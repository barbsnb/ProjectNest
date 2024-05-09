from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django import forms
from datetime import timedelta



class Resident(models.Model):
    resident_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=14)
    email = models.EmailField(max_length=50, unique=True)
    room_number = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Administrator(models.Model):
    admin_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    admin_type = models.CharField(max_length=50)  # Assuming a type field to differentiate administrators

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Guest(models.Model):
    guest_id = models.AutoField(primary_key=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=14)
    email = models.EmailField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Visit(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='visits')
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name='visits')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='scheduled')  # Possible values like 'scheduled', 'ongoing', 'completed'
    def extend_visit(self):
        if self.end_time + timedelta(days=1) - self.start_time <= timedelta(days=3):
            self.end_time += timedelta(days=1)
            self.save()
        else:
            raise ValueError("Nie można przedłużyć wizyty dłużej niż 3 dni")
    def __str__(self):
        return f"Visit of {self.guest.last_name} at {self.resident.last_name} from {self.start_time.strftime('%Y-%m-%d %H:%M')}"


class AppUserManager(BaseUserManager):
    def create_user(self, email, username, first_name, last_name, phone_number, dormitory, room_number, password=None):
        if not email:
            raise ValueError('An email is required.')
        if not username:
            raise ValueError('A username is required.')
        if not first_name:
            raise ValueError('A first name is required.')
        if not last_name:
            raise ValueError('A last name is required.')
        if not phone_number:
            raise ValueError('A phone number is required.')
        if not dormitory:
            raise ValueError('A building name is required.')
        if not room_number:
            raise ValueError('A room number is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, 
                          username=username, 
                          first_name=first_name, 
                          last_name=last_name, 
                          phone_number=phone_number, 
                          dormitory=dormitory, 
                          room_number=room_number)
        user.set_password(password)
        user.save()
        return user
    
    def create_superuser(self, email, username, first_name, last_name, phone_number, dormitory, room_number, password=None, is_receptionist = False):
        user = self.create_user(email,username, first_name, last_name, phone_number, dormitory, room_number, password)
        user.is_superuser = True
        #types of superusers:
        user.is_receptionist = is_receptionist
        user.is_community_member = not is_receptionist  
        user.save()
        return user

class AppUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15)
    dormitory = models.CharField(max_length=100)
    room_number = models.CharField(max_length=50)
    # flags for admin type:
    is_receptionist = models.BooleanField(default=False)
    is_community_member = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name', 'phone_number', 'dormitory', 'room_number']
    objects = AppUserManager()
    
    def __str__(self):
        return self.last_name


class Visit(models.Model):
    start_date = models.DateField()
    start_time = models.TimeField()
    end_date = models.DateField()
    end_time = models.TimeField()
    guest_first_name = models.CharField(max_length=50, blank=False)
    guest_last_name = models.CharField(max_length=50, blank=False)
    guest_phone_nr = models.CharField(max_length=14, blank=False)
    guest_email = models.EmailField(max_length=50, blank=False)
    # Pole klucza obcego do użytkownika
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE)
    dormitory = models.CharField(max_length=100)
        
        
        
# class AppUserManager(BaseUserManager):
# 	def create_user(self, email, password=None):
# 		if not email:
# 			raise ValueError('An email is required.')
# 		if not password:
# 			raise ValueError('A password is required.')
# 		email = self.normalize_email(email)
# 		user = self.model(email=email)
# 		user.set_password(password)
# 		user.save()
# 		return user
# 	def create_superuser(self, email, password=None):
# 		if not email:
# 			raise ValueError('An email is required.')
# 		if not password:
# 			raise ValueError('A password is required.')
# 		user = self.create_user(email, password)
# 		user.is_superuser = True
# 		user.save()
# 		return user



# class AppUser(AbstractBaseUser, PermissionsMixin):
# 	user_id = models.AutoField(primary_key=True)
# 	email = models.EmailField(max_length=50, unique=True)
# 	username = models.CharField(max_length=50)
# 	USERNAME_FIELD = 'email'
# 	REQUIRED_FIELDS = ['username']
# 	objects = AppUserManager()
# 	def __str__(self):
# 		return self.username