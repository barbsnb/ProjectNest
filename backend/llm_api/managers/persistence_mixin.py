from llm_api.models import ChatSession, ChatMessage
from typing import List, Dict, Optional

class DjangoChatPersistenceMixin:
    """
    A mixin providing database persistence for chat sessions using Django ORM.
    Designed to be used alongside a ChatManager that handles chat logic.
    """

    def load_session(self, session_id: str) -> List[Dict[str, str]]:
        """
        Load the message history for a session from the database.

        Args:
            session_id (str): The unique identifier of the chat session.

        Returns:
            List[Dict[str, str]]: A list of message dictionaries representing the chat history.

        Raises:
            ValueError: If the session ID does not exist.
        """
        try:
            session = ChatSession.objects.get(session_id=session_id)
        except ChatSession.DoesNotExist:
            raise ValueError(f"No session found with ID: {session_id}")

        return [
            {"role": msg.role, "content": msg.content}
            for msg in session.messages.order_by("timestamp")
        ]

    def save_message(self, session_id: str, role: str, content: str):
        """
        Save a new chat message to the database under the specified session.

        Args:
            session_id (str): The session identifier.
            role (str): The role of the sender ('system', 'user', 'assistant').
            content (str): The message content.
        """
        session, _ = ChatSession.objects.get_or_create(session_id=session_id)
        ChatMessage.objects.create(session=session, role=role, content=content)

    def initialize_session(
        self,
        session_id: str,
        system_prompt: str = "You are a helpful assistant.",
        title: Optional[str] = "Untitled Session",
        user=None
    ):
        """
        Initialize a new chat session in the database if it doesn't already exist.

        Args:
            session_id (str): The session identifier.
            system_prompt (str): The system prompt for the assistant.
            title (str, optional): A user-defined or default title for the session.
            user (User, optional): The Django user to associate with the session.
        """
        ChatSession.objects.get_or_create(
            session_id=session_id,
            defaults={
                "system_prompt": system_prompt,
                "title": title,
                "user": user
            }
        )