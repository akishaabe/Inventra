from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from prophet import Prophet
import mysql.connector
import os

app = FastAPI()

DB_HOST = os.getenv("ML_DB_HOST", "mysql")
DB_USER = os.getenv("ML_DB_USER", "root")
DB_PASS = os.getenv("ML_DB_PASS", "irino")
DB_NAME = os.getenv("ML_DB_NAME", "inventra")

def get_sales_df():
    conn = mysql.connector.connect(host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME)
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
    df['ds'] = pd.to_datetime(df['ds'])
    df = df.sort_values('ds')
    return df

class ForecastRequest(BaseModel):
    horizon: int = 14

@app.post("/forecast")
def forecast(req: ForecastRequest):
    df = get_sales_df()

    # 🧠 Debug print to confirm if data exists
    if df is not None:
        print("DEBUG: Sales DataFrame length =", len(df))
        print(df.head())

    if df is None or df.empty:
        print("DEBUG: No sales data found.")
        return []

    model = Prophet()
    model.fit(df.rename(columns={"ds":"ds","y":"y"}))
    future = model.make_future_dataframe(periods=req.horizon)
    forecast = model.predict(future)
    result = forecast[["ds","yhat","yhat_lower","yhat_upper"]].tail(req.horizon)
    records = []
    for _, r in result.iterrows():
        records.append({
            "ds": r["ds"].strftime("%Y-%m-%d"),
            "yhat": float(r["yhat"]),
            "yhat_lower": float(r["yhat_lower"]) if pd.notna(r["yhat_lower"]) else None,
            "yhat_upper": float(r["yhat_upper"]) if pd.notna(r["yhat_upper"]) else None
        })
    return records
