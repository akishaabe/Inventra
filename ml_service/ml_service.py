from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from prophet import Prophet
import mysql.connector
import os
from datetime import datetime

app = FastAPI(title="ML Forecasting Service")

# ===== Database Config =====
DB_HOST = os.getenv("ML_DB_HOST", "localhost")
DB_USER = os.getenv("ML_DB_USER", "inventra")
DB_PASS = os.getenv("ML_DB_PASS", "@Inventra123")
DB_NAME = os.getenv("ML_DB_NAME", "inventra")

# ===== Helper: Connect to DB =====
def get_db_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )

# ===== Get Sales Data =====
def get_sales_df():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT DATE(sale_date) AS ds, SUM(total_amount) AS y
        FROM sales
        GROUP BY DATE(sale_date)
        ORDER BY ds
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        return None

    df = pd.DataFrame(rows)
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values("ds")
    return df

# ===== Request Model =====
class ForecastRequest(BaseModel):
    horizon: int = 14
    product_id: int | None = None  # optional

# ===== Persist Forecasts =====
def persist_forecasts(product_id, forecast_df):
    conn = get_db_connection()
    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO forecasts (product_id, forecast_date, forecasted_demand, model_meta, created_at)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            forecasted_demand = VALUES(forecasted_demand),
            created_at = VALUES(created_at)
    """

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = [
        (
            product_id if product_id else 1,
            row["ds"].strftime("%Y-%m-%d"),
            float(row["yhat"]),
            "Prophet Model v1.1.7",
            now
        )
        for _, row in forecast_df.iterrows()
    ]

    cursor.executemany(insert_sql, data)
    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ Saved {len(data)} forecast rows to database.")

# ===== Root Endpoint =====
@app.get("/")
def root():
    return {
        "message": "Welcome to the ML Forecasting Service! Use POST /forecast with JSON or GET /forecast?horizon=14&product_id=0"
    }

# ===== Forecast Endpoint (POST) =====
@app.post("/forecast")
def forecast_post(req: ForecastRequest):
    return generate_forecast(req.horizon, req.product_id or 1)

# ===== Forecast Endpoint (GET) =====
@app.get("/forecast")
def forecast_get(horizon: int = 14, product_id: int = 0):
    return generate_forecast(horizon, product_id or 1)

# ===== Forecast Logic =====
def generate_forecast(horizon: int, product_id: int):
    df = get_sales_df()

    if df is None or df.empty:
        return {"error": "No sales data found."}

    # ---- Prophet Forecast ----
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=horizon)
    forecast_df = model.predict(future)

    result = forecast_df[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(horizon)

    # ---- Save to DB ----
    persist_forecasts(product_id, result)

    # ---- Return JSON ----
    return [
        {
            "ds": r["ds"].strftime("%Y-%m-%d"),
            "yhat": float(r["yhat"]),
            "yhat_lower": float(r["yhat_lower"]) if pd.notna(r["yhat_lower"]) else None,
            "yhat_upper": float(r["yhat_upper"]) if pd.notna(r["yhat_upper"]) else None
        }
        for _, r in result.iterrows()
    ]
