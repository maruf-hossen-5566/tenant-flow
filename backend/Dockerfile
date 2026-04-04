# backend/Dockerfile

FROM python:3.11-slim

COPY . /app
WORKDIR /app

# Install FastAPI, uvicorn, and psycopg2 (for PostgreSQL + SQLAlchemy)
RUN pip install "fastapi[standard]" uvicorn psycopg2-binary

# If you have requirements.txt, install that too:
RUN pip install -r requirements.txt

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]