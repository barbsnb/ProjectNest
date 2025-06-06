import logging
from django.forms.models import model_to_dict
from projects_api.models import ProjectAnalysis, Project
from projects_api.serializers import UserProjectSerializer, ProjectAnalysisSerializer
from llm_api.services import StringLLMChatInterface
from llm_api.conditioning import *
from typing import Any, Dict, List, Optional


logger = logging.getLogger(__name__)

llm_interface = StringLLMChatInterface()

class UserProjectUpdater:
    @staticmethod
    def update_project_analysis(project_id: int) -> Dict[str, Any]:
        """
        Update ProjectAnalysis for a given project using all project fields as the raw_prompt.
        """
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            logger.error(f"Project with id {project_id} not found.")
            return {"error": "Project not found."}

        # Serialize all fields into a readable string
        project_dict = model_to_dict(project)
        raw_prompt = "\n".join(f"{key}: {value}" for key, value in project_dict.items())

        if not raw_prompt.strip():
            logger.warning(f"Project {project_id} has no usable data for analysis.")
            return {"error": "Project has no content for analysis."}


        # extraction first
        keyword_prompt = keywords_project_extraction + raw_prompt
        keywords_response = llm_interface.conditioning_msg(conditioning=keyword_prompt, raw_prompt="")
        keywords_list = keywords_response.strip()

        #saving keywords to project
        project.keywords = keywords_list

        #TODO: in case of an error
        project.save(update_fields=["keywords"])
        logger.info(f"Updated keywords for project id {project_id}: {keywords_list}")

        # analysis generation as before
        result = llm_interface.conditioning_msg(
            conditioning=ask_project_analysis,
            raw_prompt=raw_prompt
        )[0]



        try:
            analysis = project.analysis  # via related_name
            serializer = ProjectAnalysisSerializer(instance=analysis, data=result, partial=True)
        except ProjectAnalysis.DoesNotExist:
            serializer = ProjectAnalysisSerializer(data=result, partial=True)

        if serializer.is_valid():
            instance = serializer.save(project=project)
            logger.info(
                f"ProjectAnalysis {'created' if not hasattr(instance, 'id') else 'updated'} for project id {project_id}."
            )
            return ProjectAnalysisSerializer(instance).data
        else:
            logger.error(f"Validation failed for ProjectAnalysis update: {serializer.errors}")
            return {"errors": serializer.errors}