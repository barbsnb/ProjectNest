from django.db import models
from projects_api.models import Project  # Update to your actual app name

class ChatSession(models.Model):
    """
    Represents a chat session instance related to a project.

    Attributes:
        session_id (str): Unique identifier for the chat session.
        project (Project): The project this chat session is linked to.
        created_at (datetime): Timestamp of when the session was created.
        title (str): A human-readable title for the session.
    """
    session_id = models.CharField(max_length=100, unique=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="chat_sessions")
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255, blank=True, default="Nowa rozmowa")

    def __str__(self):
        return self.session_id


class ChatMessage(models.Model):
    """
    Represents an individual message in a chat session.

    Attributes:
        session (ChatSession): The chat session this message belongs to.
        role (str): The role of the sender ('system', 'user', or 'assistant').
        content (str): The textual content of the message.
        timestamp (datetime): The time the message was created.
    """
    ROLE_CHOICES = [
        ("system", "System"),
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    session = models.ForeignKey(ChatSession, related_name="messages", on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} @ {self.timestamp}: {self.content[:40]}"