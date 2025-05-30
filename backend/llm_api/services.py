from .settings import llm_persistence_manager

from abc import ABC, abstractmethod
import json
import ast
from typing import Any, Dict, List, Optional


class LLMChatInterface(ABC):
    def __init__(self):
        self.llm_persistence_manager = llm_persistence_manager

    @abstractmethod
    def conditioning_msg(self, conditioning: str, raw_prompt: str, session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param raw_prompt: The original prompt string.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """
        pass

    @abstractmethod
    def conditioning_msg_files(self, conditioning: str, raw_prompt: str, file_paths: List[str], session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param raw_prompt: The original prompt string.
        :param file_paths: List of files that are to be added to prompt.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """
        pass

    @abstractmethod
    def conditioning_files(self, conditioning: str, file_paths: List[str], session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param file_paths: List of files that are to be added to prompt.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """
        pass


class StringLLMChatInterface(LLMChatInterface):
    def __init__(self):
        super().__init__()

    def conditioning_msg(self, conditioning: str, raw_prompt: str, session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param raw_prompt: The original prompt string.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """
        promt = conditioning + "\n" + raw_prompt
        if session_id is not None:
            reply = self.llm_persistence_manager.get_response(session_id, promt)
        else:
            reply = self.llm_persistence_manager.get_response_once(raw_prompt, conditioning)

        return self.string_to_dict(reply)

    def conditioning_msg_files(self, conditioning: str, raw_prompt: str, file_paths: List[str], session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param raw_prompt: The original prompt string.
        :param file_paths: List of files that are to be added to prompt.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """

        #TO DO
        pass

    def conditioning_files(self, conditioning: str, file_paths: List[str], session_id: str = None) -> List[Dict[str, Any]]:
        """
        Get LLM response basing on the conditioning. The conditioning is required to get the answer that can be
        transformed in Dict[str, Any] format,

        :param conditioning: Conditioning added at the beginning of prompt.
        :param file_paths: List of files that are to be added to prompt.
        :param session_id: Optional session_id for adding context.
        :return: The answer from the LLM formated to Dict[str, Any].
        """

        # TO DO
        pass

    def string_to_dict(self, s: str) -> List[Dict[str, Any]]:
        # First, try to parse it as JSON directly
        try:
            result = json.loads(s)
            if isinstance(result, dict):
                return [result]  # wrap dict in a list
            elif isinstance(result, list) and all(isinstance(item, dict) for item in result):
                return result
        except json.JSONDecodeError:
            pass

        # Try to clean and parse using ast.literal_eval (safe eval for Python-like dicts)
        try:
            cleaned = s.strip()

            # Remove enclosing backticks or code block markers
            if cleaned.startswith("```") and cleaned.endswith("```"):
                cleaned = '\n'.join(cleaned.splitlines()[1:-1])

            # Try to parse with literal_eval
            result = ast.literal_eval(cleaned)
            if isinstance(result, dict):
                return [result]  # wrap dict in a list
            elif isinstance(result, list) and all(isinstance(item, dict) for item in result):
                return result
        except (ValueError, SyntaxError):
            pass

        raise ValueError(f"Unable to convert string to list of dictionaries. Input was:\n{s}")
