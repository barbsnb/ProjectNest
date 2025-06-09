from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ChatSession, ChatMessage, Project
from .serializers import ChatSessionSerializer, ChatMessageSerializer
import uuid
from .services import StringLLMChatInterface 
from .conditioning import *

from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication

from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


llm = StringLLMChatInterface()

class ChatSessionView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def post(self, request):
        project_id = request.data.get("project_id")
        if not project_id:
            return Response({"error": "Brakuje ID projektu"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            project_instance = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            return Response({"error": "Projekt nie istnieje"}, status=status.HTTP_404_NOT_FOUND)

        session, created = ChatSession.objects.get_or_create(
            project=project_instance,
            defaults={"session_id": str(uuid.uuid4()), "title": request.data.get("title", "Nowa rozmowa")}
        )

        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

class ChatSessionByProjectView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()

    def get(self, request, project_id):
        try:
            session = ChatSession.objects.get(project_id=project_id)
            serializer = ChatSessionSerializer(session)
            return Response(serializer.data)
        except ChatSession.DoesNotExist:
            return Response({"error": "Brak sesji dla projektu"}, status=404)


class ChatMessageView(APIView):
    permission_classes = (AllowAny,)
    authentication_classes = ()
    
    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(session_id=session_id)
        except ChatSession.DoesNotExist:
            return Response({"error": "Sesja nie istnieje"}, status=status.HTTP_404_NOT_FOUND)

        messages = session.messages.order_by("timestamp")
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request, session_id):
        content = request.data.get("content")
        if not content:
            return Response({"error": "Brak treści wiadomości"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            session = ChatSession.objects.get(session_id=session_id)
        except ChatSession.DoesNotExist:
            return Response({"error": "Sesja nie istnieje"}, status=status.HTTP_404_NOT_FOUND)

        # Zapisz wiadomość użytkownika
        user_msg = ChatMessage.objects.create(
            session=session,
            role="user",
            content=content
        )

        # Pobierz odpowiedź z LLM
        try:
            response_list = llm.conditioning_msg_string(
                conditioning=chat,
                raw_prompt=content,
                session_id=session_id
            )
            assistant_response = response_list
        except Exception as e:
            assistant_response = f"Błąd LLM: {str(e)}"

        # Zapisz wiadomość asystenta
        assistant_msg = ChatMessage.objects.create(
            session=session,
            role="assistant",
            content=assistant_response
        )

        return Response({
            "user_message": ChatMessageSerializer(user_msg).data,
            "assistant_message": ChatMessageSerializer(assistant_msg).data
        }, status=status.HTTP_201_CREATED)
