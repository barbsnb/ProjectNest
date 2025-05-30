from .base import Chat4AllChatManager
from .base import OpenAIChatManager
from .persistence_mixin import DjangoChatPersistenceMixin

class GPT4ALLPersistentChatManager(DjangoChatPersistenceMixin, Chat4AllChatManager):
    """
    A chat manager that integrates OpenAI API access with Django-based session persistence.
    Combines:
    - Chat logic from Chat4AllChatManager
    - Session/message storage from DjangoChatPersistenceMixin
    """

    def __init__(self, base_url: str, model: str = "gpt-4"):
        super().__init__(base_url, model)

    def get_response(self, session_id: str, user_message: str) -> str:
        """
        Add a user message to the DB, fetch assistant's reply from OpenAI, and persist it.

        Args:
            session_id (str): The chat session identifier.
            user_message (str): The user's input message.

        Returns:
            str: The assistant's reply.
        """
        self.initialize_session(session_id)
        self.save_message(session_id, "user", user_message)
        messages = self.load_session(session_id)
        reply = self.fetch_response(messages)
        self.save_message(session_id, "assistant", reply)
        return reply

class OpenAIPersistentChatManager(DjangoChatPersistenceMixin, OpenAIChatManager):
    """
    A chat manager that integrates OpenAI API access with Django-based session persistence.
    Combines:
    - Chat logic from OpenAIChatManager
    - Session/message storage from DjangoChatPersistenceMixin
    """

    def __init__(self, api_key: str, model: str = "gpt-4"):
        super().__init__(api_key, model)

    def get_response(self, session_id: str, user_message: str) -> str:
        """
        Add a user message to the DB, fetch assistant's reply from OpenAI, and persist it.

        Args:
            session_id (str): The chat session identifier.
            user_message (str): The user's input message.

        Returns:
            str: The assistant's reply.
        """
        self.initialize_session(session_id)
        self.save_message(session_id, "user", user_message)
        messages = self.load_session(session_id)
        reply = self.fetch_response(messages)
        self.save_message(session_id, "assistant", reply)
        return reply