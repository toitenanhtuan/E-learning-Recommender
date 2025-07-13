from fastapi import APIRouter, Depends
from networkx.readwrite import json_graph

from app.services.recommendation import recommendation_service

router = APIRouter()


@router.get("/dependency-graph")
def get_dependency_graph():
    """
    Lấy dữ liệu đồ thị phụ thuộc kỹ năng ở định dạng JSON.
    """
    graph = recommendation_service.skill_graph
    if not graph:
        return {"nodes": [], "links": []}
    graph_data = json_graph.node_link_data(graph)
    return graph_data
