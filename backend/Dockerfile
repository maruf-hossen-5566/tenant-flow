FROM python:3.11-slim

# Copy your project (ignoring .venv with .dockerignore)
COPY . /app
WORKDIR /app

# Install uvicorn + dependencies via pip
RUN pip install uvicorn

# Install other deps from your lockfile (or requirements.txt)
# If you have requirements.txt:
RUN pip install -r requirements.txt
# If you don't, you can install fastapi + extras directly:
# RUN pip install "fastapi[standard]" psycopg-binary sqlalchemy ...

# Run FastAPI via Python module
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]