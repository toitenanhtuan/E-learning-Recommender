import pandas as pd
import sys
import os
from sqlalchemy.orm import Session
from tqdm import tqdm  # Thư viện thanh tiến trình

# ---- Cấu hình đường dẫn để script có thể import các module của app ----
# Thêm thư mục gốc của project (backend/) vào sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# --------------------------------------------------------------------

from app.db.database import SessionLocal, engine
from app.db import models
from app.schemas.course import CourseWithSkills as CourseSchema  # Dùng để validate

# Tạo các bảng trong CSDL nếu chúng chưa tồn tại
# Đây là bước quan trọng, đảm bảo script không lỗi khi CSDL trống
models.Base.metadata.create_all(bind=engine)

# Đường dẫn tới file dữ liệu đã làm sạch
# Lưu ý: Script này chạy BÊN TRONG container, nơi thư mục gốc là /code
# Vì vậy, chúng ta cần một cách khác để truy cập file dữ liệu.
# Cách tốt nhất là mount file dữ liệu vào container.
# TẠM THỜI, chúng ta sẽ giả định đường dẫn như sau.
# CHÚNG TA SẼ CHỈNH docker-compose.yml SAU BƯỚC NÀY.
PROCESSED_DATA_PATH = "/data/processed/cleaned_courses.csv"


def seed_data():
    """Hàm chính để nạp dữ liệu từ CSV vào CSDL PostgreSQL."""
    db: Session = SessionLocal()

    print("--- Bắt đầu quá trình nạp dữ liệu (Seeding) ---")

    # Kiểm tra xem dữ liệu đã tồn tại chưa để tránh nạp lại
    if db.query(models.Course).first():
        print("!! Dữ liệu khóa học đã tồn tại. Bỏ qua việc nạp dữ liệu.")
        db.close()
        return

    # Kiểm tra sự tồn tại của file dữ liệu
    if not os.path.exists(PROCESSED_DATA_PATH):
        print(f"LỖI: Không tìm thấy file dữ liệu tại '{PROCESSED_DATA_PATH}'.")
        print("Vui lòng kiểm tra lại cấu hình volume trong docker-compose.yml.")
        db.close()
        return

    print(f"Đọc dữ liệu từ: {PROCESSED_DATA_PATH}")
    df = pd.read_csv(PROCESSED_DATA_PATH)

    # Chuyển đổi chuỗi '[skill1, skill2]' thành list python thực sự
    # ast.literal_eval an toàn hơn eval()
    import ast

    df["processed_skills"] = df["processed_skills"].apply(ast.literal_eval)

    courses_created = 0
    skills_created = 0
    skill_cache = {}  # Cache để tra cứu skill đã có trong DB chưa, tăng tốc độ

    try:
        print("Bắt đầu lặp qua DataFrame và chèn vào CSDL...")
        # Sử dụng tqdm để có thanh tiến trình
        for _, row in tqdm(
            df.iterrows(), total=df.shape[0], desc="Đang xử lý khóa học"
        ):
            # 1. Tạo hoặc lấy Skill object
            skill_objects = []
            for skill_name in row["processed_skills"]:
                if skill_name in skill_cache:
                    skill_obj = skill_cache[skill_name]
                else:
                    skill_obj = (
                        db.query(models.Skill)
                        .filter(models.Skill.skill_name == skill_name)
                        .first()
                    )
                    if not skill_obj:
                        skill_obj = models.Skill(skill_name=skill_name)
                        db.add(skill_obj)
                        db.flush()  # Để có ID ngay lập tức
                        skills_created += 1
                    skill_cache[skill_name] = skill_obj
                skill_objects.append(skill_obj)

            # 2. Tạo Course object
            course_data = {
                "course_name": row["course_name"],
                "university": row["university"],
                "difficulty_level": row["difficulty_level"],
                "course_rating": row["course_rating"],
                "course_url": row["course_url"],
                "course_description": row["course_description"],
            }
            course_obj = models.Course(**course_data)

            # 3. Liên kết course với skills
            course_obj.skills.extend(skill_objects)

            db.add(course_obj)
            courses_created += 1

        print("\nHoàn tất vòng lặp. Bắt đầu commit vào CSDL...")
        db.commit()
        print("✅ Commit thành công!")

    except Exception as e:
        print(f"\n❌ Đã xảy ra lỗi: {e}")
        print("Đang rollback các thay đổi...")
        db.rollback()
    finally:
        print("--- Thống kê ---")
        print(f"Tổng số khóa học đã tạo: {courses_created}")
        print(f"Tổng số kỹ năng mới đã tạo: {skills_created}")
        print("Đóng kết nối CSDL.")
        db.close()
        print("--- Quá trình nạp dữ liệu kết thúc ---")


if __name__ == "__main__":
    seed_data()
