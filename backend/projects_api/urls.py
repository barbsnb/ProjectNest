from django.urls import path
from . import views

urlpatterns = [
    path("project/", views.UserProject.as_view(), name="project"),
    path("project_list/", views.ProjectListView.as_view(), name="project_list"),
    path("analysis/<int:project_id>/", views.ProjectAnalysisDetailView.as_view(), name="project-analysis-detail"),
    path('improvement-suggestions/<int:project_id>/', views.ImprovementSuggestionListView.as_view(), name='improvement-suggestion-list'),
]
