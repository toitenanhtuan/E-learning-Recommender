import pandas as pd
import networkx as nx
import joblib
import os
import ast

# --- Định nghĩa các đường dẫn ---
CLEANED_COURSES_PATH = "D:/AnhTuan/BaiTap/MLDatasets_DS423/DoAn/e_learning_recommender/ml/data/processed/cleaned_courses.csv"
DEPENDENCIES_PATH = "D:/AnhTuan/BaiTap/MLDatasets_DS423/DoAn/e_learning_recommender/ml/data/raw/skill_dependencies.csv"
MODEL_DIR = "D:/AnhTuan/BaiTap/MLDatasets_DS423/DoAn/e_learning_recommender/ml/models"
SKILL_GRAPH_PATH = os.path.join(MODEL_DIR, "skill_dependency_graph.joblib")
SKILL_ID_MAP_PATH = os.path.join(MODEL_DIR, "skill_id_map.joblib")


def build_graph():
    """
    Xây dựng và lưu đồ thị phụ thuộc kỹ năng.
    """
    print("--- Bắt đầu xây dựng Đồ thị Phụ thuộc Kỹ năng ---")
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 1. Đọc tất cả các kỹ năng từ dữ liệu khóa học để tạo các nút
    print(f"Đọc dữ liệu khóa học từ: {CLEANED_COURSES_PATH}")
    courses_df = pd.read_csv(CLEANED_COURSES_PATH)
    courses_df["processed_skills"] = courses_df["processed_skills"].apply(
        ast.literal_eval
    )

    # Tạo một set chứa tất cả các kỹ năng duy nhất
    all_skills_set = set()
    for skills_list in courses_df["processed_skills"]:
        all_skills_set.update(skills_list)

    print(f"Tìm thấy tổng cộng {len(all_skills_set)} kỹ năng duy nhất.")

    # Tạo đồ thị có hướng
    G = nx.DiGraph()

    # Thêm tất cả kỹ năng vào đồ thị dưới dạng các nút
    G.add_nodes_from(all_skills_set)

    # 2. Tạo một map từ tên skill -> id (từ file cleaned_courses)
    # Bước này rất quan trọng để liên kết tên skill trong file CSV và ID trong DB
    # Chúng ta sẽ cần file skills.csv được sinh ra từ data_preprocessing hoặc seed
    # Để đơn giản, ta sẽ tự tạo map này từ CSDL hoặc file csv sạch

    # Tạo skill_id_map:
    all_skills = sorted(list(all_skills_set))
    skill_id_map = {skill_name: i + 1 for i, skill_name in enumerate(all_skills)}
    joblib.dump(skill_id_map, SKILL_ID_MAP_PATH)
    print(f"Đã lưu Skill ID Map vào: {SKILL_ID_MAP_PATH}")

    # 3. Đọc file dependencies để thêm các cạnh
    try:
        print(f"Đọc dữ liệu phụ thuộc từ: {DEPENDENCIES_PATH}")
        deps_df = pd.read_csv(DEPENDENCIES_PATH)

        edges_added = 0
        for _, row in deps_df.iterrows():
            prerequisite = row["prerequisite_skill_name"].lower().strip()
            skill = row["skill_name"].lower().strip()

            # Chỉ thêm cạnh nếu cả hai nút đều tồn tại trong đồ thị
            if G.has_node(prerequisite) and G.has_node(skill):
                G.add_edge(prerequisite, skill)
                edges_added += 1

        print(f"Đã thêm {edges_added} cạnh phụ thuộc vào đồ thị.")

    except FileNotFoundError:
        print(
            f"CẢNH BÁO: Không tìm thấy file '{DEPENDENCIES_PATH}'. Đồ thị sẽ không có cạnh nào."
        )

    # Kiểm tra xem đồ thị có bị vòng lặp không (rất quan trọng)
    if not nx.is_directed_acyclic_graph(G):
        cycles = list(nx.simple_cycles(G))
        print(f"LỖI: Đồ thị có chứa vòng lặp! Không thể thực hiện sắp xếp Tô-pô.")
        print("Các vòng lặp được tìm thấy:", cycles)
        return

    # 4. Lưu đồ thị
    joblib.dump(G, SKILL_GRAPH_PATH)
    print(f"Đồ thị đã được xây dựng và lưu thành công vào: {SKILL_GRAPH_PATH}")


if __name__ == "__main__":
    build_graph()
