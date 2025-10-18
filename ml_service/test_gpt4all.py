from gpt4all import GPT4All

# Path to your model
model_path = "C:/Users/amiel/gpt4all/resources/nomic-embed-text-v1.5.f16.gguf"

# Load the model
model = GPT4All(model_path)

# Start a chat session
with model.chat_session() as session:
    response = session.generate("Which coffee drinks are trending right now?")
    print("AI Response:", response)
