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
    path('projects/<int:project_id>/ingest/', views.ProjectIngestView.as_view(), name='project-ingest'),
    path('projects/<int:project_id>/snapshot/', views.ProjectSnapshotDetailView.as_view(), name='project-snapshot'),
    path('projects/<int:project_id>/analysis-runs/', views.ProjectAnalysisRunCreateView.as_view(), name='project-analysis-runs'),
    path('projects/<int:project_id>/analysis-runs/<int:run_id>/', views.ProjectAnalysisRunDetailView.as_view(), name='project-analysis-run-detail'),
    path('projects/<int:project_id>/report-summary/', views.ProjectReportSummaryView.as_view(), name='project-report-summary'),
    path('analysis-runs/<int:run_id>/findings/', views.AnalysisRunFindingListView.as_view(), name='analysis-run-findings'),
    path('analysis-runs/<int:run_id>/findings/<int:finding_id>/', views.AnalysisRunFindingDetailView.as_view(), name='analysis-run-finding-detail'),
]
