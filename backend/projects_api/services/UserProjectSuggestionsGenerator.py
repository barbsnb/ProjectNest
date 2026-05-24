import logging
from django.forms.models import model_to_dict
from projects_api.models import Project, ImprovementSuggestion
from projects_api.serializers import ImprovementSuggestionSerializer
from llm_api.services import StringLLMChatInterface
from llm_api.conditioning import ask_project_suggestions
from typing import Any, Dict, List
import json

logger = logging.getLogger(__name__)
llm_interface = StringLLMChatInterface()

class UserProjectSuggestionsGenerator:
    @staticmethod
    def generate_project_suggestions(project_id: int) -> Dict[str, Any]:
        """
        Generuje sugestie ulepszeń na podstawie treści projektu.
        """
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            logger.error("Projekt o id %s nie istnieje.", project_id)
            return {"error": "Projekt nie istnieje."}

        # Convert project fields to readable text
        project_dict = model_to_dict(project)
        raw_prompt = "\n".join(f"{key}: {value}" for key, value in project_dict.items())

        if not raw_prompt.strip():
            logger.warning("Projekt %s nie ma danych możliwych do wygenerowania sugestii.", project_id)
            return {"error": "Projekt nie ma treści do wygenerowania sugestii."}

        # Ask the LLM for suggestions
        result = llm_interface.conditioning_msg(
            conditioning=ask_project_suggestions,
            raw_prompt=raw_prompt
        )

        if isinstance(result, str):
            try:
                parsed_result = json.loads(result)
            except json.JSONDecodeError:
                logger.error("Nie udało się zdekodować odpowiedzi JSON z LLM.")
                return {"error": "Model LLM zwrócił niepoprawny JSON."}
        elif isinstance(result, (list, dict)):
            parsed_result = result
        else:
            logger.error("Nieoczekiwany typ odpowiedzi LLM.")
            return {"error": "Model LLM zwrócił nieoczekiwany typ odpowiedzi."}

        logger.debug("Wygenerowano surowy payload sugestii dla projektu %s.", project_id)

        if not isinstance(parsed_result, list):
            logger.error("Odpowiedź LLM nie jest listą sugestii.")
            return {"error": "Model LLM zwrócił nieoczekiwany format odpowiedzi."}
        
        suggestions = []
        for suggestion_data in parsed_result:
            suggestion_data['project'] = project_id
            serializer = ImprovementSuggestionSerializer(data=suggestion_data)
            if serializer.is_valid():
                serializer.save(project=project)
                suggestions.append(serializer.data)
            else:
                logger.warning("Pominięto niepoprawną sugestię: %s", serializer.errors)

        logger.info("Wygenerowano %s sugestii dla projektu %s.", len(suggestions), project_id)
        return {"suggestions": suggestions}
