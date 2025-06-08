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