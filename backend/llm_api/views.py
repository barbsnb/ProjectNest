import uuid

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from llm_api.conditioning import chat
from projects_api.models import Project

from .models import ChatMessage, ChatSession
from .serializers import ChatMessageSerializer, ChatSessionSerializer
from .services import StringLLMChatInterface


llm = StringLLMChatInterface()


def get_owned_chat_session(request, session_id):
    return get_object_or_404(ChatSession, session_id=session_id, project__user=request.user)


class ChatSessionView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        project_id = request.data.get("project_id")
        if not project_id:
            return Response({"error": "Brakuje ID projektu."}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(Project, id=project_id, user=request.user)
        session, created = ChatSession.objects.get_or_create(
            project=project,
            defaults={
                "session_id": str(uuid.uuid4()),
                "title": request.data.get("title", "Nowa rozmowa"),
            },
        )

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ChatSessionByProjectView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id, user=request.user)
        try:
            session = ChatSession.objects.get(project=project)
        except ChatSession.DoesNotExist:
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
        content = request.data.get("content")
        if not content:
            return Response({"error": "Brak tresci wiadomosci."}, status=status.HTTP_400_BAD_REQUEST)

        session = get_owned_chat_session(request, session_id)
        user_msg = ChatMessage.objects.create(session=session, role="user", content=content)

        try:
            assistant_response = llm.conditioning_msg_string(
                conditioning=chat,
                raw_prompt=content,
                session_id=session_id,
            )
        except Exception as exc:
            assistant_response = f"Blad LLM: {exc}"

        assistant_msg = ChatMessage.objects.create(
            session=session,
            role="assistant",
            content=assistant_response,
        )

        return Response(
            {
                "user_message": ChatMessageSerializer(user_msg).data,
                "assistant_message": ChatMessageSerializer(assistant_msg).data,
            },
            status=status.HTTP_201_CREATED,
        )
