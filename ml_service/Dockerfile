FROM python:3.11-slim-bullseye
WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    gfortran \
    liblapack-dev \
    libopenblas-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 5000
CMD ["uvicorn", "ml_service:app", "--host", "0.0.0.0", "--port", "5000"]