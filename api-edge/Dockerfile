FROM python:3.11-slim AS base
WORKDIR /app

# Install dependencies without creating venv (container is already isolated)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

EXPOSE 8000

# Run with Uvicorn — reload enabled for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
