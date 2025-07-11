FROM python:3.9-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

# Bạn có thể bỏ qua dòng scripts này nếu không cần chạy nó bên trong container
# COPY ./scripts /code/scripts 

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]