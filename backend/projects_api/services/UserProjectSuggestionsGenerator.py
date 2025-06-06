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
        Generate project improvement suggestions based on project content.
        """
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            logger.error(f"Project with id {project_id} not found.")
            return {"error": "Project not found."}

        # Convert project fields to readable text
        project_dict = model_to_dict(project)
        raw_prompt = "\n".join(f"{key}: {value}" for key, value in project_dict.items())

        if not raw_prompt.strip():
            logger.warning(f"Project {project_id} has no usable data for suggestions.")
            return {"error": "Project has no content for suggestions."}

        # Ask the LLM for suggestions
        result = llm_interface.conditioning_msg(
            conditioning=ask_project_suggestions,
            raw_prompt=raw_prompt
        )
        
        print(result)

        if isinstance(result, str):
            try:
                parsed_result = json.loads(result)
            except json.JSONDecodeError:
                logger.error("Failed to decode LLM JSON response.")
                return {"error": "Invalid JSON response from LLM."}
        elif isinstance(result, (list, dict)):
            parsed_result = result
        else:
            logger.error("Unexpected type of LLM response.")
            return {"error": "Unexpected response type from LLM."}

        if not isinstance(parsed_result, list):
            logger.error("LLM response is not a list of suggestions.")
            return {"error": "Unexpected response format from LLM."}
        
        suggestions = []
        for suggestion_data in result:
            suggestion_data['project'] = project_id
            serializer = ImprovementSuggestionSerializer(data=suggestion_data)
            if serializer.is_valid():
                serializer.save(project=project)
                suggestions.append(serializer.data)
            else:
                logger.warning(f"Invalid suggestion skipped: {serializer.errors}")

        logger.info(f"Generated {len(suggestions)} suggestions for project id {project_id}.")
        return {"suggestions": suggestions}

    @staticmethod
    def generate_suggestions_for_user_from_keywords(user) -> Dict[str, Any]:
        """
        Generate project ideas based on keywords from projects
        :param user: logged user object
        :return: suggestions list for the user
        """
        projects = Project.objects.filter(user=user)
        all_keywords = []
        for project in projects:
            all_keywords.extend(project.get_keywords_list())
        # Deduplicate and clean
        unique_keywords = list(set(k.strip() for k in all_keywords if k.strip()))

        if not unique_keywords:
            return {"error": "User has no keywords in projects."}

        # Compose a prompt with keywords
        raw_prompt = f"Suggest projects or improvements based on these keywords: {', '.join(unique_keywords)}"

        result = llm_interface.conditioning_msg(
            conditioning=ask_project_suggestions,
            raw_prompt=raw_prompt
        )

        # Parse LLM response
        if isinstance(result, str):
            try:
                parsed_result = json.loads(result)
            except json.JSONDecodeError:
                logger.error("Failed to decode LLM JSON response.")
                return {"error": "Invalid JSON response from LLM."}
        elif isinstance(result, (list, dict)):
            parsed_result = result
        else:
            logger.error("Unexpected type of LLM response.")
            return {"error": "Unexpected response type from LLM."}

        if not isinstance(parsed_result, list):
            logger.error("LLM response is not a list of suggestions.")
            return {"error": "Unexpected response format from LLM."}

        # Return suggestions directly (not saving here)
        return {"suggestions": parsed_result}