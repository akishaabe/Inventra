FROM python:3.11-slim

# Prevent Python from writing .pyc files and using buffered stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies needed by Prophet
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3-dev \
    libssl-dev \
    libffi-dev \
    liblapack-dev \
    libblas-dev \
    gfortran \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install Python deps
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose your FastAPI port
EXPOSE 5000

# Copy the app code
COPY . .

# Run the app
CMD ["uvicorn", "ml_service:app", "--host", "0.0.0.0", "--port", "5000"]
