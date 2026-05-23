from .managers.persistence_manager import GPT4ALLPersistentChatManager, OpenAIPersistentChatManager
import os


################
#GPT4ALL api settings
GPT4ALL_model = os.getenv("GPT4ALL_MODEL", "Llama 3 8B Instruct")
GPT4ALL_url = os.getenv("GPT4ALL_URL", "http://localhost:4891/v1/chat/completions")




#################
#openAI api settings
openAI_model = os.getenv("OPENAI_MODEL", "gpt-4.1-nano")
openAI_api_key = os.getenv("OPENAI_API_KEY")






######################
#choose manager
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai" if openAI_api_key else "gpt4all").lower()

if LLM_PROVIDER == "openai":
    if not openAI_api_key:
        raise RuntimeError("OPENAI_API_KEY is required when LLM_PROVIDER=openai.")
    llm_persistence_manager = OpenAIPersistentChatManager(openAI_api_key, openAI_model)
elif LLM_PROVIDER == "gpt4all":
    llm_persistence_manager = GPT4ALLPersistentChatManager(GPT4ALL_url, GPT4ALL_model)
else:
    raise RuntimeError(f"Unsupported LLM_PROVIDER: {LLM_PROVIDER}")
