from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django import forms
from datetime import timedelta


<<<<<<< HEAD
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
    admin_type = models.CharField(
        max_length=50
    )  # Assuming a type field to differentiate administrators

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

<<<<<<< HEAD

### dodac model wniosku
=======
class Visit(models.Model):
    resident = models.ForeignKey(Resident, on_delete=models.CASCADE, related_name='visits')
    guest = models.ForeignKey(Guest, on_delete=models.CASCADE, related_name='visits')
    #wniosek
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
>>>>>>> 0f6afe8 (adding)

=======
>>>>>>> 21f5840 (commit)

class AppUserManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Email jest wymagany")
        if not username:
            raise ValueError("Nazwa użytkownika jest wymagana")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            username=username,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None):
        user = self.create_user(email, username, password)
        user.is_superuser = True
        user.is_staff = True
        user.save(using=self._db)
        return user


class AppUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    email = models.EmailField(max_length=50, unique=True)
    username = models.CharField(max_length=50, unique=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = AppUserManager()

    def __str__(self):
        return f"{self.username} ({self.email})"

class Project(models.Model):
    name = models.CharField(max_length=255, verbose_name="Nazwa projektu")
    description = models.TextField(verbose_name="Opis projektu")
    user = models.ForeignKey("AppUser", on_delete=models.CASCADE)

    def __str__(self):
        return self.name



