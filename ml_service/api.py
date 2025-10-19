import os
from dotenv import load_dotenv
import openai

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

# List models using the new v1 API
models = openai.models.list()

for model in models:
    print(model.id)
