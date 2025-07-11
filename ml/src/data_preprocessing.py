import pandas as pd
import re


def clean_skills(text):
    """
    Tách và làm sạch chuỗi kỹ năng.
    Đầu vào: "skill1  skill2  skill3"
    Đầu ra: ['skill1', 'skill2', 'skill3']
    """
    if not isinstance(text, str):
        return []

    # Sử dụng regex để tách bằng một hoặc nhiều khoảng trắng
    # Chuyển về chữ thường và xóa khoảng trắng thừa ở đầu/cuối mỗi skill
    skills = [skill.strip().lower() for skill in re.split(r"\s{2,}", text)]

    # Bỏ các giá trị rỗng và trùng lặp
    return sorted(list(set(filter(None, skills))))


def preprocess_data(input_path, output_path):
    """
    Hàm chính để đọc, xử lý và lưu dữ liệu.
    """
    print(f"Đang đọc dữ liệu từ: {input_path}")
    df = pd.read_csv(input_path)

    # 1. Đổi tên cột cho nhất quán (snake_case)
    df.columns = [
        "course_name",
        "university",
        "difficulty_level",
        "course_rating",
        "course_url",
        "course_description",
        "skills",
    ]

    df.insert(0, "id", range(1, 1 + len(df)))

    # 2. Xử lý giá trị thiếu 'Course Rating'
    # Thay thế các giá trị không hợp lệ (ví dụ: 'Not Calibrated') bằng NaN
    df["course_rating"] = pd.to_numeric(df["course_rating"], errors="coerce")
    # Điền giá trị thiếu bằng trung bình
    mean_rating = df["course_rating"].mean()
    df["course_rating"].fillna(mean_rating, inplace=True)
    df["course_rating"] = round(df["course_rating"], 2)

    # 3. Chuẩn hóa cột 'difficulty_level'
    # Loại bỏ các giá trị không mong muốn
    valid_levels = ["Beginner", "Intermediate", "Advanced", "Mixed"]
    df = df[df["difficulty_level"].isin(valid_levels)]
    df["difficulty_level"] = df["difficulty_level"].str.lower()

    # 4. Xử lý cột 'skills' quan trọng nhất
    print("Đang xử lý cột 'skills'...")
    df["processed_skills"] = df["skills"].apply(clean_skills)

    # 5. Lưu kết quả
    # Chúng ta sẽ lưu cả cột skills gốc và cột đã xử lý để tiện tham khảo
    df.to_csv(output_path, index=False, encoding="utf-8")
    print(f"Dữ liệu đã được làm sạch và lưu tại: {output_path}")


if __name__ == "__main__":
    RAW_DATA_PATH = "D:/AnhTuan/BaiTap/MLDatasets_DS423/DoAn/e_learning_recommender/ml/data/raw/Coursera.csv"
    PROCESSED_DATA_PATH = (
        "D:/AnhTuan/BaiTap/MLDatasets_DS423/DoAn/e_learning_recommender/ml/data/processed/cleaned_courses.csv"
        # Lưu vào thư mục processed
    )

    # (Cần tạo thư mục data/processed nếu chưa có)
    import os

    os.makedirs(os.path.dirname(PROCESSED_DATA_PATH), exist_ok=True)

    preprocess_data(RAW_DATA_PATH, PROCESSED_DATA_PATH)
