import uuid

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from llm_api.report_assistant import send_report_chat_message
from projects_api.models import Project

from .models import ChatSession
from .serializers import ChatMessageSerializer, ChatSessionSerializer


def get_owned_chat_session(request, session_id):
    return get_object_or_404(ChatSession, session_id=session_id, project__user=request.user)


class ChatSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        project_id = request.data.get("project_id")
        if not project_id:
            return Response({"error": "Brakuje ID projektu."}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(Project, id=project_id, user=request.user)
        session = ChatSession.objects.filter(project=project).order_by("-created_at").first()
        created = False
        if not session:
            session = ChatSession.objects.create(
                project=project,
                session_id=str(uuid.uuid4()),
                title=request.data.get("title", "Nowa rozmowa"),
            )
            created = True

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ChatSessionByProjectView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        session = ChatSession.objects.filter(project=project).order_by("-created_at").first()
        if not session:
            return Response({"error": "Brak sesji dla projektu."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data)


class ChatMessageView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, session_id):
        session = get_owned_chat_session(request, session_id)
        messages = session.messages.order_by("timestamp")
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, session_id):
        content = (request.data.get("content") or "").strip()
        if not content:
            return Response({"error": "Brak tresci wiadomosci."}, status=status.HTTP_400_BAD_REQUEST)

        session = get_owned_chat_session(request, session_id)
        user_msg, assistant_msg, context = send_report_chat_message(
            session=session,
            content=content,
            finding_id=request.data.get("finding_id"),
            analysis_run_id=request.data.get("analysis_run_id"),
        )

        return Response(
            {
                "user_message": ChatMessageSerializer(user_msg).data,
                "assistant_message": ChatMessageSerializer(assistant_msg).data,
                "context": context,
            },
            status=status.HTTP_201_CREATED,
        )
