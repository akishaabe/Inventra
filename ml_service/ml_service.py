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

# ===== Get Sales Data (Quantity-based) =====
def get_sales_df(product_id=None):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    if product_id:
        cursor.execute("""
            SELECT DATE(s.sale_date) AS ds, SUM(si.quantity) AS y
            FROM sales s
            JOIN sales_items si ON s.sale_id = si.sale_id
            WHERE si.product_id = %s
            GROUP BY DATE(s.sale_date)
            ORDER BY ds
        """, (product_id,))
    else:
        cursor.execute("""
            SELECT si.product_id, DATE(s.sale_date) AS ds, SUM(si.quantity) AS y
            FROM sales s
            JOIN sales_items si ON s.sale_id = si.sale_id
            GROUP BY si.product_id, DATE(s.sale_date)
            ORDER BY si.product_id, ds
        """)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    if not rows:
        print("⚠️ No sales data found in DB.")
        return None

    df = pd.DataFrame(rows)
    df["ds"] = pd.to_datetime(df["ds"])
    df = df.sort_values(["ds"])
    print(f"📊 Retrieved {len(df)} sales records{' for product ' + str(product_id) if product_id else ''}.")
    return df

# ===== Request Model =====
class ForecastRequest(BaseModel):
    horizon: int = 14
    product_id: int | None = None

# ===== Persist Forecasts =====
def persist_forecasts(product_id, forecast_df):
    conn = get_db_connection()
    cursor = conn.cursor()

    insert_sql = """
        INSERT INTO forecasts (product_id, forecast_date, forecasted_demand, model_meta)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            forecasted_demand = VALUES(forecasted_demand),
            created_at = CURRENT_TIMESTAMP
    """

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    data = [
        (
            product_id,
            row["ds"].strftime("%Y-%m-%d"),
            float(row["yhat"]),
            "Prophet Model v1.1.7 (qty-based)",
            now
        )
        for _, row in forecast_df.iterrows()
    ]

    cursor.executemany(insert_sql, data)
    conn.commit()
    cursor.close()
    conn.close()
    print(f"✅ Saved {len(data)} forecast rows for product {product_id}")

# ===== Forecast Logic =====
def run_prophet_forecast(df, horizon, product_id=None):
    # Skip if data too small
    if df.dropna().shape[0] < 2:
        print(f"⚠️ Skipping product {product_id if product_id else 'N/A'}: not enough data points ({len(df)} rows).")
        return None

    print("🔮 Training Prophet model...")
    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=req.horizon)
    forecast_df = model.predict(future)
    print("✅ Forecast generated.")
    return forecast_df[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(horizon)


# ===== API: /forecast =====
@app.post("/forecast")
def forecast(req: ForecastRequest):
    df = get_sales_df(req.product_id)

    if df is None or df.empty:
        print("⚠️ No sales data found, skipping forecast.")
        return []

    total_products = 0
    results = []

    if req.product_id:
        print(f"🔍 Forecasting for product {req.product_id} (horizon={req.horizon})...")
        forecast_df = run_prophet_forecast(df, req.horizon, req.product_id)
        if forecast_df is None:
            return {"message": f"⚠️ Not enough data to forecast product {req.product_id}."}
        persist_forecasts(req.product_id, forecast_df)

        results = forecast_df
        total_products = 1
    else:
        print("🔁 Forecasting for all products...")
        for pid in df["product_id"].unique():
            product_df = df[df["product_id"] == pid][["ds", "y"]]
            if len(product_df) < 3:
                print(f"⚠️ Skipping product {pid}: not enough data.")
                continue
            forecast_df = run_prophet_forecast(product_df, req.horizon, pid)
            if forecast_df is None:
                continue
            persist_forecasts(pid, forecast_df)

            results.append({
                "product_id": pid,
                "forecast": [
                    {
                        "ds": r["ds"].strftime("%Y-%m-%d"),
                        "yhat": float(r["yhat"]),
                        "yhat_lower": float(r["yhat_lower"]) if pd.notna(r["yhat_lower"]) else None,
                        "yhat_upper": float(r["yhat_upper"]) if pd.notna(r["yhat_upper"]) else None
                    }
                    for _, r in forecast_df.iterrows()
                ]
            })
            total_products += 1

    print(f"🏁 Done forecasting for {total_products} product(s).")

    # ---- Return JSON ----
    if req.product_id:
        return [
            {
                "ds": r["ds"].strftime("%Y-%m-%d"),
                "yhat": float(r["yhat"]),
                "yhat_lower": float(r["yhat_lower"]) if pd.notna(r["yhat_lower"]) else None,
                "yhat_upper": float(r["yhat_upper"]) if pd.notna(r["yhat_upper"]) else None
            }
            for _, r in results.iterrows()
        ]
    else:
        return results

# ===== Root Endpoint =====
@app.get("/")
def root():
    return {"message": "Welcome to the ML Forecasting Service! Use POST /forecast with {horizon, product_id (optional)}"}
