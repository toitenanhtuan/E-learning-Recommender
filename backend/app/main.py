from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import các router
from app.api.v1 import (
    endpoints as course_endpoints,  # Đặt alias để rõ ràng
    auth_endpoints,
    survey_endpoints,
    user_endpoints,
)
from app.db.database import engine
from app.db import models

# Tạo các bảng trong CSDL
models.Base.metadata.create_all(bind=engine)

# Khởi tạo ứng dụng FastAPI
app = FastAPI(
    title="E-Learning Recommender API",
    description="API for the Personalized E-Learning Path Recommender System.",
    version="1.0.0",
)

# Cấu hình CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Đăng ký các Router vào ứng dụng ===
# Tiền tố (prefix) giúp nhóm các API lại với nhau
# Ví dụ: /api/v1/auth/register, /api/v1/users/me

# API cho Authentication (Đăng ký/Đăng nhập)
app.include_router(
    auth_endpoints.router, prefix="/api/v1/auth", tags=["Authentication"]
)

# API cho các khóa học và gợi ý chung
app.include_router(
    course_endpoints.router, prefix="/api/v1", tags=["Courses & Recommendations"]
)

# API cho người dùng (lấy thông tin, lộ trình cá nhân hóa)
app.include_router(user_endpoints.router, prefix="/api/v1/users", tags=["User"])

# API cho khảo sát
app.include_router(survey_endpoints.router, prefix="/api/v1/survey", tags=["Survey"])


# Endpoint gốc
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the E-Learning Recommender API!"}
