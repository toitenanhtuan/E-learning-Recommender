import joblib
import pandas as pd
import os
from typing import List


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

        # Tạo một series để mapping từ course_id -> index của DataFrame
        self.indices = pd.Series(
            self.course_data.index, index=self.course_data["id"]
        ).drop_duplicates()

        print("✅ RecommendationService đã được khởi tạo và tải model thành công.")

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


# Tạo một instance duy nhất của service để toàn bộ ứng dụng sử dụng (Singleton pattern)
# App sẽ chỉ tải model một lần duy nhất lúc khởi động, rất hiệu quả.
recommendation_service = RecommendationService()
