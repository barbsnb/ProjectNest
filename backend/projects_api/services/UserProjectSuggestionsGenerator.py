import logging
from django.forms.models import model_to_dict
from rest_framework.views import APIView

from projects_api.models import Project, ImprovementSuggestion
from projects_api.serializers import ImprovementSuggestionSerializer
from llm_api.services import StringLLMChatInterface
from llm_api.conditioning import ask_project_suggestions, suggest_development_path
from typing import Any, Dict, List
import json

from user_api.models import Survey

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
    def generate_suggestions_for_user_from_keywords(user):
        """
        Generate project ideas based on keywords from projects
        :param user: logged user object
        :return: suggestions list for the user
        """
        projects = Project.objects.filter(user=user)
        all_keywords = []
        for project in projects:
            all_keywords.extend(project.get_keywords_list())

        unique_keywords = list(set(k.strip() for k in all_keywords if k.strip()))

        if not unique_keywords:
            return {"error": "User has no keywords in projects."}

        raw_prompt = (
            f"Zaproponuj użytkownikowi pomysły na kolejne projekty na podstawie tych słów kluczowych z jego projektów:"
            f" {', '.join(unique_keywords)}")

        result = llm_interface.conditioning_msg(
            conditioning=ask_project_suggestions,
            raw_prompt=raw_prompt
        )

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

        return {"suggestions": parsed_result}


class DevelopmentPathGenerator():

    @staticmethod
    def suggest_development_path(self, survey) -> [Dict[str, str]]:

        #extract the information from the survey
        survey = Survey.objects.filter(user=survey.user)
        survey_keywords = {}

        if hasattr(survey, 'direction'):
            survey_keywords['direction'] = survey.direction or ''

        if hasattr(survey, 'focus'):
            survey_keywords['focus'] = survey.focus or ''

        if hasattr(survey, 'experience'):
            survey_keywords['experience'] = survey.experience or ''

        if hasattr(survey, 'time_availability'):
            survey_keywords['time_availability'] = survey.time_availability or ''

        if hasattr(survey, 'challanges'):
            survey_keywords['challanges'] = survey.challanges or ''

        if hasattr(survey, 'technologies') and survey.technologies:
            techs = [tech.strip() for tech in survey.technologies.split(',')]
            survey_keywords['technologies'] = ', '.join(techs)
        else:
            survey_keywords['technologies'] = ''

        result = llm_interface.conditioning_msg(conditioning=suggest_development_path.format(**survey_keywords),
                                                raw_prompt="")[0]
