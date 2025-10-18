import os
import mysql.connector
from mysql.connector import Error
from openai import OpenAI
from datetime import datetime, date
from decimal import Decimal
from dotenv import load_dotenv
import json

load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Database config
DB_CONFIG = {
    "host": os.getenv("ML_DB_HOST", "127.0.0.1"),
    "user": os.getenv("ML_DB_USER", "root"),
    "password": os.getenv("ML_DB_PASS", "irino"),
    "database": os.getenv("ML_DB_NAME", "inventra"),
    "port": int(os.getenv("ML_DB_PORT", 3406))
}

# ---------------------------------------------
# Fetch sales + trend data
# ---------------------------------------------
def fetch_products_with_trends():
    query = """
        SELECT 
            st.product_id,
            st.product_name,
            MAX(st.trend_date) AS latest_trend_date,
            SUM(st.search_interest) AS total_search_interest,
            IFNULL(SUM(ss.qty), 0) AS total_qty,
            IFNULL(SUM(ss.sales_amount), 0) AS total_sales
        FROM staging_trends st
        LEFT JOIN staging_sales ss 
            ON st.product_id = ss.product_id
        GROUP BY st.product_id, st.product_name
        ORDER BY total_search_interest DESC, total_sales DESC
        LIMIT 50;
    """
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query)
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f"❌ Database error: {e}")
        return []
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# ---------------------------------------------
# Generate AI recommendations
# ---------------------------------------------
def generate_ai_recommendations(products):
    # Convert MySQL types for JSON serialization
    safe_products = []
    for p in products:
        converted = {}
        for k, v in p.items():
            if isinstance(v, (datetime, date)):
                converted[k] = v.isoformat()
            elif isinstance(v, Decimal):
                converted[k] = float(v)
            else:
                converted[k] = v
        safe_products.append(converted)

    prompt = (
        "You are an inventory strategist for a café. "
        "Given the latest sales and trend data, suggest stock actions in a friendly and concise tone.\n\n"
        "For each product, output JSON in this format:\n"
        "[\n"
        "  {\n"
        "    'product_id': <id>,\n"
        "    'recommendation_text': '<short actionable suggestion>',\n"
        "    'priority': '<high|medium|low>',\n"
        "    'reason': '<one-sentence explanation>'\n"
        "  }\n"
        "]\n\n"
        f"Data:\n{json.dumps(safe_products, indent=2)}"
    )

    try:
        response = client.responses.create(
            model="gpt-5-mini",
            input=[
                {"role": "system", "content": "You generate smart, business-friendly insights for café inventory optimization."},
                {"role": "user", "content": prompt}
            ]
        )

        # Safely extract output text
        text_out = None
        if hasattr(response, "output") and response.output:
            for item in response.output:
                if item.type == "message" and item.content:
                    for c in item.content:
                        if c.type == "output_text":
                            text_out = c.text
                            break
                elif isinstance(item, dict) and "content" in item:
                    text_out = item["content"]
                    break

        if not text_out:
            print("⚠️ OpenAI response had no text output. Full object:\n", response)
            return []

        print("\n🤖 Raw AI Output:\n", text_out[:800], "...\n")

        try:
            recs = json.loads(text_out.replace("'", '"'))
            if isinstance(recs, list):
                return recs
        except json.JSONDecodeError:
            print("⚠️ Could not parse AI JSON output. Storing fallback.")
            return []

    except Exception as e:
        print("❌ OpenAI failed:", e)
        return []

# ---------------------------------------------
# Save to Database
# ---------------------------------------------
def save_recommendations_to_db(recommendations):
    insert_query = """
        INSERT INTO ai_recommendations 
        (product_id, recommendation_text, priority, reason, generated_by, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        count = 0

        for rec in recommendations:
            pid = rec.get("product_id")
            if not pid:
                continue
            cursor.execute(insert_query, (
                pid,
                rec.get("recommendation_text"),
                rec.get("priority"),
                rec.get("reason"),
                "openai-gpt5",
                datetime.now()
            ))
            count += 1

        conn.commit()
        print(f"✅ Saved {count} AI recommendations.")
    except Error as e:
        print(f"❌ Database insert error: {e}")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# ---------------------------------------------
# Main runner
# ---------------------------------------------
if __name__ == "__main__":
    print("📊 Fetching product and trend data...")
    products = fetch_products_with_trends()

    if not products:
        print("⚠️ No data retrieved. Exiting.")
    else:
        ai_recs = generate_ai_recommendations(products)
        if ai_recs:
            save_recommendations_to_db(ai_recs)
            print(f"\n✨ Processed {len(ai_recs)} recommendations successfully.")
        else:
            print("⚠️ No valid recommendations generated.")
