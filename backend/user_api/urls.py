from django.urls import path
from . import views

urlpatterns = [
    path("register", views.UserRegister.as_view(), name="register"),
    path("login", views.UserLogin.as_view(), name="login"),
    path("logout", views.UserLogout.as_view(), name="logout"),
    path("user", views.UserView.as_view(), name="user"),
    path("project/", views.UserProject.as_view(), name="project"),
    path("project_list/", views.ProjectListView.as_view(), name="project_list"),
    path("analysis/create/", views.ProjectAnalysisCreateView.as_view(), name="create-analysis"),
    path("analysis/<int:project_id>/", views.ProjectAnalysisDetailView.as_view(), name="project-analysis-detail"),
]
