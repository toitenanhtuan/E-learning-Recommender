from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import router từ file endpoints
from .api.v1 import endpoints
from .db.database import engine
from .db import models

# Tạo các bảng trong CSDL nếu chưa có.
# Mặc dù seed.py cũng làm việc này, nhưng để ở đây đảm bảo app chạy là có bảng.
models.Base.metadata.create_all(bind=engine)

# Đây là dòng quan trọng nhất mà Uvicorn đang tìm kiếm
app = FastAPI(
    title="E-Learning Recommender API",
    description="API for the Personalized E-Learning Path Recommender System.",
    version="1.0.0",
)

# --- Cấu hình CORS ---
# Cho phép Frontend (chạy ở localhost:3000) có thể gọi API này
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Chỉ cho phép nguồn này
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả các phương thức (GET, POST, etc.)
    allow_headers=["*"],  # Cho phép tất cả các header
)

# Gắn router vào ứng dụng chính với một tiền tố (prefix)
app.include_router(endpoints.router, prefix="/api/v1", tags=["v1"])


# Một endpoint gốc để kiểm tra nhanh
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the E-Learning Recommender API!"}
