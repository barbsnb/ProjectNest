from django.urls import path
from . import views

urlpatterns = [
	path('register', views.UserRegister.as_view(), name='register'),
	path('login', views.UserLogin.as_view(), name='login'),
	path('logout', views.UserLogout.as_view(), name='logout'),
	path('user', views.UserView.as_view(), name='user'),
	path('schedule', views.UserVisit.as_view(), name='schedule'),
	path('visit_list', views.VisitListView.as_view(), name='visit_list'),
 	path('all_visit_list', views.AllVisitListView.as_view(), name='all_visit_list'),
  	path('user/<int:pk>/', views.UserDetailView.as_view(), name='user_detail')
]
