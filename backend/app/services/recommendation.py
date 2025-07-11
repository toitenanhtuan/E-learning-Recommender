import joblib
import pandas as pd
import os
from typing import List
from sqlalchemy.orm import Session
from app.db import models
import networkx as nx


class RecommendationService:
    def __init__(self):
        # Đường dẫn tới các file model BÊN TRONG container
        # Nhớ rằng chúng ta đã mount 'ml/models' vào '/models' trong docker-compose
        self.model_dir = "/models"
        self.cosine_sim_path = os.path.join(self.model_dir, "cosine_sim_matrix.joblib")
        self.course_data_path = os.path.join(
            self.model_dir, "course_data_for_recommendation.csv"
        )

        # Tải model và dữ liệu
        self.cosine_sim_matrix = self._load_model(self.cosine_sim_path)
        self.course_data = self._load_data(self.course_data_path)
        self.skill_graph_path = os.path.join(
            self.model_dir, "skill_dependency_graph.joblib"
        )
        self.skill_graph = self._load_model(self.skill_graph_path)
        if self.skill_graph:
            print("Đồ thị Phụ thuộc Kỹ năng đã được tải thành công.")

        # Tạo một series để mapping từ course_id -> index của DataFrame
        self.indices = pd.Series(
            self.course_data.index, index=self.course_data["id"]
        ).drop_duplicates()

        print("RecommendationService đã được khởi tạo và tải model thành công.")

    def _load_model(self, path):
        """Tải file joblib."""
        try:
            return joblib.load(path)
        except FileNotFoundError:
            print(
                f"LỖI: Không tìm thấy file model tại '{path}'. Hãy chắc chắn bạn đã mount volume đúng."
            )
            return None

    def _load_data(self, path):
        """Tải file CSV dữ liệu khóa học."""
        try:
            return pd.read_csv(path)
        except FileNotFoundError:
            print(f"LỖI: Không tìm thấy file dữ liệu khóa học tại '{path}'.")
            return None

    def get_recommendations(
        self, course_id: int, num_recommendations: int = 10
    ) -> List[int]:
        """
        Lấy danh sách các ID khóa học tương tự.
        """
        if self.cosine_sim_matrix is None or self.course_data is None:
            return []

        if course_id not in self.indices:
            # Nếu course_id không có trong dữ liệu huấn luyện, không thể gợi ý
            return []

        # 1. Lấy index của DataFrame tương ứng với course_id
        idx = self.indices[course_id]

        # 2. Lấy điểm tương đồng của khóa học này với tất cả các khóa học khác
        sim_scores = list(enumerate(self.cosine_sim_matrix[idx]))

        # 3. Sắp xếp các khóa học dựa trên điểm tương đồng (giảm dần)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)

        # 4. Lấy điểm của top N khóa học tương tự nhất
        # Bắt đầu từ 1 để bỏ qua chính nó (vì một khóa học luôn tương tự nhất với chính nó)
        sim_scores = sim_scores[1 : num_recommendations + 1]

        # 5. Lấy index của các khóa học được gợi ý
        course_indices = [i[0] for i in sim_scores]

        # 6. Trả về list các `id` của các khóa học đó
        recommended_course_ids = self.course_data["id"].iloc[course_indices].tolist()

        return recommended_course_ids

    def get_personalized_path(self, user: models.User, db: Session) -> List[int]:
        """
        Tạo một lộ trình học tập cá nhân hóa dựa trên skill gap của người dùng.
        """
        print(f"Bắt đầu tạo lộ trình cá nhân hóa cho user: {user.email}")

        # 1. Lấy danh sách ID kỹ năng của người dùng từ CSDL
        # Sử dụng set để tính toán hiệu quả hơn
        known_skill_ids = {skill.id for skill in user.known_skills}
        target_skill_ids = {skill.id for skill in user.target_skills}

        print(f"Kỹ năng đã biết: {len(known_skill_ids)} skills")
        print(f"Kỹ năng mục tiêu: {len(target_skill_ids)} skills")

        # 2. Tính toán Skill Gap
        skill_gap_ids = target_skill_ids - known_skill_ids

        if not skill_gap_ids:
            print("Không có skill gap. Người dùng đã biết tất cả kỹ năng mục tiêu.")
            return []

        print(f"Skill gap tìm thấy: {len(skill_gap_ids)} skills")

        # 3. Tìm tất cả các khóa học "ứng viên" có chứa ít nhất một kỹ năng trong skill_gap
        # .c là một cách để truy cập các cột của bảng trung gian trong join
        candidate_courses_query = (
            db.query(models.Course)
            .join(models.course_skills_association)
            .filter(models.course_skills_association.c.skill_id.in_(skill_gap_ids))
            .distinct()
        )

        candidate_courses = candidate_courses_query.all()

        if not candidate_courses:
            print("Không tìm thấy khóa học nào phù hợp với skill gap.")
            return []

        print(f"Tìm thấy {len(candidate_courses)} khóa học ứng viên.")

        # 4. Chấm điểm và sắp xếp các khóa học ứng viên
        scored_courses = []

        # 4.5: Thưởng điểm dựa trên Phong cách học
        user_learning_style = user.profile.learning_style if user.profile else None

        if user_learning_style:
            print(f"Áp dụng bộ lọc Phong cách học: {user_learning_style}")

            # Định nghĩa các mapping giữa phong cách học và định dạng khóa học
            style_format_mapping = {
                "visual": "video_heavy",
                "read_write": "text_heavy",
                "kinesthetic": "project_based",
            }

            preferred_format = style_format_mapping.get(user_learning_style)

            for course_score_dict in scored_courses:
                course_id = course_score_dict["id"]
                # Tìm format của khóa học này (cần một cách truy cập nhanh, có thể thêm vào dict)
                # Tạm thời ta sẽ giả sử 'difficulty' key cũng chứa 'format'
                #
                # Sửa đổi: Ta sẽ cập nhật vòng lặp chấm điểm ban đầu để đưa format vào
                if (
                    preferred_format
                    and course_score_dict.get("format") == preferred_format
                ):
                    course_score_dict["score"] += 15  # Thưởng điểm lớn

        for course in candidate_courses:
            score = 0
            course_skill_ids = {skill.id for skill in course.skills}

            # Tiêu chí 1: Số lượng kỹ năng trong "skill gap" mà khóa học này dạy được
            matching_skills_count = len(course_skill_ids.intersection(skill_gap_ids))
            score += matching_skills_count * 10

            # Tiêu chí 2: Ưu tiên các khóa học "Beginner" để bắt đầu
            if course.difficulty_level == "beginner":
                score += 5
            elif course.difficulty_level == "intermediate":
                score += 2

            # Tiêu chí 3 (phụ): Thưởng nhẹ cho các khóa học có rating cao
            score += course.course_rating

            # Loại bỏ các khóa học mà người dùng đã biết TẤT CẢ kỹ năng của nó
            if known_skill_ids.issuperset(course_skill_ids):
                continue

            scored_courses.append(
                {
                    "id": course.id,
                    "score": score,
                    "difficulty": course.difficulty_level,
                    "format": course.course_format,
                }
            )

        # 5. Sắp xếp lại các khóa học dựa trên Đồ thị Phụ thuộc (Topological Sort)
        # Đây là một bước sắp xếp tinh vi hơn.

        print("Bắt đầu sắp xếp lại lộ trình dựa trên đồ thị phụ thuộc...")

        if self.skill_graph and scored_courses:
            # Lấy set tất cả các kỹ năng có trong các khóa học được đề xuất
            all_relevant_skills = set()
            # Tạo map: course_id -> set of skill names
            course_id_to_skills_map = {}
            # Cần truy vấn lại để lấy tên skill
            candidate_courses = (
                db.query(models.Course)
                .filter(models.Course.id.in_([c["id"] for c in scored_courses]))
                .all()
            )
            for course in candidate_courses:
                course_skills_set = {skill.skill_name for skill in course.skills}
                all_relevant_skills.update(course_skills_set)
                course_id_to_skills_map[course.id] = course_skills_set

            # Tạo một đồ thị con chỉ chứa các kỹ năng liên quan
            sub_graph = self.skill_graph.subgraph(all_relevant_skills)

            # Thực hiện sắp xếp tô-pô
            try:
                # Sắp xếp các kỹ năng theo thứ tự logic
                topo_sorted_skills = list(nx.topological_sort(sub_graph))
                print(
                    f"Thứ tự kỹ năng logic (sắp xếp tô-pô): {topo_sorted_skills[:10]}..."
                )

                # Tạo map: skill_name -> rank (thứ hạng)
                skill_rank_map = {
                    skill: i for i, skill in enumerate(topo_sorted_skills)
                }

                # Bây giờ, tính "rank" trung bình cho mỗi khóa học
                # Khóa học có rank thấp hơn (chứa các skill cơ bản) sẽ được ưu tiên
                for course_dict in scored_courses:
                    course_skills = course_id_to_skills_map.get(
                        course_dict["id"], set()
                    )
                    if not course_skills:
                        course_dict["topo_rank"] = float("inf")
                        continue

                    # Tính rank trung bình của các kỹ năng trong khóa học
                    ranks = [
                        skill_rank_map.get(skill, float("inf"))
                        for skill in course_skills
                    ]
                    course_dict["topo_rank"] = sum(ranks) / len(ranks)

                # Sắp xếp lại scored_courses một lần cuối: ưu tiên rank thấp trước, sau đó mới đến điểm cao
                scored_courses.sort(
                    key=lambda x: (x.get("topo_rank", float("inf")), -x["score"])
                )

            except nx.NetworkXUnfeasible:
                print(
                    "CẢNH BÁO: Không thể sắp xếp tô-pô (có thể có vòng lặp trong đồ thị con). Bỏ qua bước này."
                )
                # Nếu lỗi, vẫn dùng cách sắp xếp cũ
                difficulty_order = {
                    "beginner": 0,
                    "intermediate": 1,
                    "mixed": 2,
                    "advanced": 3,
                }
                scored_courses.sort(
                    key=lambda x: (
                        difficulty_order.get(x["difficulty"], 99),
                        -x["score"],
                    )
                )

        else:
            # Fallback nếu không có đồ thị
            difficulty_order = {
                "beginner": 0,
                "intermediate": 1,
                "mixed": 2,
                "advanced": 3,
            }
            scored_courses.sort(
                key=lambda x: (difficulty_order.get(x["difficulty"], 99), -x["score"])
            )

        # 6. Lấy ID của các khóa học đã sắp xếp, giới hạn số lượng
        recommended_ids = [course["id"] for course in scored_courses]

        print(f"Đã tạo lộ trình với {len(recommended_ids)} khóa học.")

        return recommended_ids[:20]


# Tạo một instance duy nhất của service để toàn bộ ứng dụng sử dụng (Singleton pattern)
# App sẽ chỉ tải model một lần duy nhất lúc khởi động, rất hiệu quả.
recommendation_service = RecommendationService()
