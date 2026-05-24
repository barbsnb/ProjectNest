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
        Aktualizuje klasyczny raport ProjectAnalysis na podstawie pól projektu.
        """
        try:
            project = Project.objects.get(pk=project_id)
        except Project.DoesNotExist:
            logger.error("Projekt o id %s nie istnieje.", project_id)
            return {"error": "Projekt nie istnieje."}

        # Serialize all fields into a readable string
        project_dict = model_to_dict(project)
        raw_prompt = "\n".join(f"{key}: {value}" for key, value in project_dict.items())

        if not raw_prompt.strip():
            logger.warning("Projekt %s nie ma danych możliwych do analizy.", project_id)
            return {"error": "Projekt nie ma treści do analizy."}

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
                "Zapisano ProjectAnalysis dla projektu %s.", project_id
            )
            return ProjectAnalysisSerializer(instance).data
        else:
            logger.error("Walidacja ProjectAnalysis nie powiodła się: %s", serializer.errors)
            return {"errors": serializer.errors}
