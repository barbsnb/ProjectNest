from django.urls import path
from . import views

urlpatterns = [
    path("register", views.UserRegister.as_view(), name="register"),
    path("login", views.UserLogin.as_view(), name="login"),
    path("logout", views.UserLogout.as_view(), name="logout"),
    path("user", views.UserView.as_view(), name="user"),
    path("schedule", views.UserVisit.as_view(), name="schedule"),
    path("visit_list", views.VisitListView.as_view(), name="visit_list"),
    path("all_visit_list", views.AllVisitListView.as_view(), name="all_visit_list"),
    path("user/<int:pk>/", views.UserDetailView.as_view(), name="user_detail"),
    path(
        "all_extension_request_list",
        views.AllVisitExtensionListView.as_view(),
        name="all_visit_list",
    ),
    path(
        "request-extension",
        views.RequestVisitExtension.as_view(),
        name="request-extension",
    ),
    path(
        "approve_reject_extension/<int:extension_id>/<str:action>",
        views.ApproveRejectExtension.as_view(),
        name="approve_reject_extension",
    ),
    path(
        "change_status/<int:visit_id>/",
        views.ChangeStatus.as_view(),
        name="change_status",
    ),
    path(
        "complete_visit/<int:visit_id>/",
        views.CompleteVisit.as_view(),
        name="complete_visit",
    ),
    path('cancel_visit/<int:visit_id>', 
         views.CancelVisit.as_view(), 
         name='cancel_visit'),
]
