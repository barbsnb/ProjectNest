from .managers.base import OpenAIChatManager
from .managers.base import Chat4AllChatManager
from .managers.persistence_manager import GPT4ALLPersistentChatManager, OpenAIPersistentChatManager
from .managers.persistence_mixin import DjangoChatPersistenceMixin


################
#GPT4ALL api settings
GPT4ALL_model = "Llama 3 8B Instruct"
GPT4ALL_url = "http://localhost:4891/v1/chat/completions"




#################
#openAI api settings
openAI_model = "gpt-4.1-nano"
openAI_api_key = "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"






######################
#choose manager
llm_persistence_manager = OpenAIPersistentChatManager(openAI_api_key, openAI_model)
#llm_persistence_manager = GPT4ALLPersistentChatManager(GPT4ALL_url, GPT4ALL_model)