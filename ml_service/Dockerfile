# Use Python 3.11 slim
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first (to leverage Docker cache)
COPY requirements.txt .

# Upgrade pip, setuptools, wheel first
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port for FastAPI/uvicorn
EXPOSE 5000

# Run the app
CMD ["uvicorn", "ml_service:app", "--host", "0.0.0.0", "--port", "5000"]
