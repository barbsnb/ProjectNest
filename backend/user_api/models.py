from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django import forms

class AppUserManager(BaseUserManager):
	def create_user(self, email, password=None):
		if not email:
			raise ValueError('An email is required.')
		if not password:
			raise ValueError('A password is required.')
		email = self.normalize_email(email)
		user = self.model(email=email)
		user.set_password(password)
		user.save()
		return user
	def create_superuser(self, email, password=None):
		if not email:
			raise ValueError('An email is required.')
		if not password:
			raise ValueError('A password is required.')
		user = self.create_user(email, password)
		user.is_superuser = True
		user.save()
		return user


class AppUser(AbstractBaseUser, PermissionsMixin):
	user_id = models.AutoField(primary_key=True)
	email = models.EmailField(max_length=50, unique=True)
	username = models.CharField(max_length=50)
	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['username']
	objects = AppUserManager()
	def __str__(self):
		return self.username

class Visit(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField(default='23:00')
    guest_name = models.CharField(max_length=50, blank=False)
    guest_last_name = models.CharField(max_length=50, blank=False)
    guest_phone_nr = models.CharField(max_length=14, blank=False)
    
    # def __str__(self):
	# 	return self.guest_last_name
    
class VisitForm(forms.ModelForm):
    date = forms.DateInput(attrs={'type': 'date'}),
    start_time = forms.TimeInput(attrs={'type': 'time'}),
    guest_name = forms.TextInput(attrs={'type': 'text'})
    guest_last_name = forms.TextInput(attrs={'type': 'text'})
    guest_phone_nr = forms.TextInput(attrs={'type': 'tel'}),
    
    class Meta:
        model = Visit
        fields = ['date', 'start_time', 'guest_name', 'guest_last_name', 'guest_phone_nr']
        # widgets = {
        #     'date': forms.DateInput(attrs={'type': 'date'}),
        #     'start_time': forms.TimeInput(attrs={'type': 'time'}),
        #     'guest_phone_nr': forms.TextInput(attrs={'type': 'tel'}),
        # }