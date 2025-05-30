from typing import List, Dict, Optional
from abc import ABC, abstractmethod
from openai import OpenAI
import requests

class BaseChatManager(ABC):
    """
    Abstract base class for managing chat sessions with language models.
    Handles session context, message management, and defines an interface for fetching responses.
    """

    def __init__(self, model: str = "gpt-4"):
        """
        Initialize the base chat manager.

        Args:
            model (str): The model name to use (e.g., 'gpt-4').
        """
        self.model = model
        self.sessions: Dict[str, List[Dict[str, str]]] = {}

    def new_session(self, session_id: str, system_prompt: str = "You are a helpful assistant."):
        """
        Create a new chat session with a system prompt.

        Args:
            session_id (str): A unique identifier for the chat session.
            system_prompt (str): The initial prompt to guide the assistant's behavior.
        """
        self.sessions[session_id] = [{"role": "system", "content": system_prompt}]

    def add_message(self, session_id: str, role: str, content: str):
        """
        Add a message to a session's conversation history.

        Args:
            session_id (str): The ID of the session.
            role (str): The role of the message sender ('user', 'assistant', or 'system').
            content (str): The message content.
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session '{session_id}' not found.")
        self.sessions[session_id].append({"role": role, "content": content})

    def reset_session(self, session_id: str):
        """
        Reset the conversation history of a session, keeping only the system message.

        Args:
            session_id (str): The ID of the session to reset.
        """
        if session_id in self.sessions:
            system_msg = next((m for m in self.sessions[session_id] if m['role'] == 'system'), None)
            self.sessions[session_id] = [system_msg] if system_msg else []

    def list_sessions(self) -> List[str]:
        """
        List all active session IDs.

        Returns:
            List[str]: A list of session IDs.
        """
        return list(self.sessions.keys())

    def get_session(self, session_id: str) -> Optional[List[Dict[str, str]]]:
        """
        Retrieve the conversation history for a session.

        Args:
            session_id (str): The ID of the session.

        Returns:
            Optional[List[Dict[str, str]]]: The session's message history or None if not found.
        """
        return self.sessions.get(session_id)

    def get_response(self, session_id: str, user_message: str) -> str:
        """
        Add a user message to the session and fetch the assistant's response.

        Args:
            session_id (str): The session ID.
            user_message (str): The user's message to send.

        Returns:
            str: The assistant's reply.
        """
        if session_id not in self.sessions:
            raise ValueError(f"Session '{session_id}' not found.")
        self.add_message(session_id, "user", user_message)
        reply = self.fetch_response(self.sessions[session_id])
        self.add_message(session_id, "assistant", reply)
        return reply

    def get_response_once(self, user_message: str, system_prompt: str = "You are a helpful assistant.") -> str:
        """
        Handle a one-time user message outside of any session.

        Args:
            user_message (str): The user's message.
            system_prompt (str): Optional system prompt.

        Returns:
            str: The assistant's reply.
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ]
        return self.fetch_response(messages)

    @abstractmethod
    def fetch_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Fetch a response from the chat model based on the provided messages.

        Must be implemented by subclasses.

        Args:
            messages (List[Dict[str, str]]): The conversation history.

        Returns:
            str: The assistant's reply.
        """
        pass



class OpenAIChatManager(BaseChatManager):
    """
    Chat manager that uses OpenAI's official API to fetch responses.
    """

    def __init__(self, api_key: str, model: str = "gpt-4"):
        """
        Initialize the OpenAI chat manager.

        Args:
            api_key (str): Your OpenAI API key.
            model (str): The model to use (e.g., 'gpt-4').
        """
        super().__init__(model)
        self.client = OpenAI(api_key=api_key)

    def fetch_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Fetch a response from OpenAI's chat completion API.

        Args:
            messages (List[Dict[str, str]]): The conversation history.

        Returns:
            str: The assistant's reply.
        """
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages  # Must be List[ChatCompletionMessageParam] format
        )
        return response.choices[0].message.content


class Chat4AllChatManager(BaseChatManager):
    """
    Chat manager that communicates with a custom or OpenAI-compatible API endpoint like Chat4All.
    """

    def __init__(self, base_url: str, model: str = "gpt-4"):
        """
        Initialize the Chat4All manager.

        Args:
            api_key (str): The API key for authorization.
            base_url (str): The base URL of the API endpoint.
            model (str): The model to use (e.g., 'gpt-4').
        """
        super().__init__(model)
        self.base_url = base_url

    def fetch_response(self, messages: List[Dict[str, str]]) -> str:
        """
        Fetch a response using an OpenAI-compatible API.

        Args:
            messages (List[Dict[str, str]]): The conversation history.

        Returns:
            str: The assistant's reply.
        """
        response = requests.post(
            self.base_url,
            json={
                "model": self.model,
                "messages": messages,
                "max_tokens": 2048
            }
        )
        response.raise_for_status()
        return response.json()['choices'][0]['message']['content']