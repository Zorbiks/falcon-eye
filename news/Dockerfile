FROM python:3.12-slim

# Don't write .pyc files, don't buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies first (layer cache friendly)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY fetcher.py server.py main.py ./

# Data directory for the generated JSON
RUN mkdir -p data

EXPOSE 8081

CMD ["python", "main.py"]
