import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env (nếu có)
load_dotenv()

# Lấy URL kết nối CSDL từ biến môi trường
# Nếu không có, sẽ dùng giá trị mặc định cho local docker
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://user:password@db:5432/elearning_db"
)

# Tạo engine kết nối tới CSDL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Tạo một lớp Session, các session thực tế sẽ là các instance của lớp này
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Đây chính là dòng bị thiếu!
# Nó tạo ra một lớp Base mà các lớp model (Course, Skill) sẽ kế thừa.
# Nhờ vậy, SQLAlchemy biết cách ánh xạ các lớp Python vào các bảng CSDL.
Base = declarative_base()

# Lưu ý: file này không cần hàm get_db(). Hàm đó thuộc về tầng API (endpoints.py).
