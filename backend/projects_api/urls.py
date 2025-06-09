from django.urls import path
from . import views

urlpatterns = [
    path("project/", views.UserProject.as_view(), name="project"),
    path("project/<int:project_id>/generate_analysis/", views.ProjectAnalysisGenerate.as_view(), name="generate project analysis"),
    path("project/<int:project_id>/generate_suggestions/", views.ProjectSuggestionsGenerate.as_view(), name="generate project suggestions"),
    path("project_list/", views.ProjectListView.as_view(), name="project_list"),
    path("analysis/<int:project_id>/", views.ProjectAnalysisDetailView.as_view(), name="project-analysis-detail"),
    path('improvement-suggestions/<int:project_id>/', views.ImprovementSuggestionListView.as_view(), name='improvement-suggestion-list'),
    path('projects/<int:project_id>/', views.UserProjectDetail.as_view(), name='project-detail'),
    path('project_suggestions_for_user/', views.KeywordsProjectSuggestionsGenerate.as_view(), name='project-suggestions-for-user'),
    path('develpoment_path_for_user/', views.KeywordsProjectSuggestionsGenerate.as_view(), name='development-paths-for-user')
]
