from django.urls import path
from .views import ChatSessionView, ChatMessageView, ChatSessionByProjectView

urlpatterns = [
    path("chat/sessions/", ChatSessionView.as_view(), name="chat-create-session"),
    path("chat/sessions/<str:session_id>/messages/", ChatMessageView.as_view(), name="chat-messages"),
    path("chat/project/<int:project_id>/session/", ChatSessionByProjectView.as_view(), name="chat-session-by-project"),
]
