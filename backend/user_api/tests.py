from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = "pass12345"
        self.user = get_user_model().objects.create_user(
            email="owner@example.com",
            username="owner",
            password=self.password,
        )

    def test_register_logs_user_in_without_exposing_password(self):
        response = self.client.post(
            "/api/register",
            {
                "email": "new@example.com",
                "username": "new-user",
                "password": "pass12345",
                "survey": {
                    "direction": ["Backend"],
                    "focus": ["Security"],
                    "experience": "Beginner",
                    "timeAvailable": "2-5",
                    "technologies": [{"name": "Python", "level": "3"}],
                    "challenges": ["Testing"],
                },
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIn("user", response.data)
        self.assertNotIn("password", response.data["user"])

        current_user = self.client.get("/api/user")
        self.assertEqual(current_user.status_code, 200)
        self.assertEqual(current_user.data["user"]["email"], "new@example.com")

    def test_login_logout_flow(self):
        login_response = self.client.post(
            "/api/login",
            {"email": self.user.email, "password": self.password},
            format="json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.data["user"]["email"], self.user.email)
        self.assertNotIn("password", login_response.data["user"])

        current_user = self.client.get("/api/user")
        self.assertEqual(current_user.status_code, 200)

        logout_response = self.client.post("/api/logout")
        self.assertEqual(logout_response.status_code, 200)

        after_logout = self.client.get("/api/user")
        self.assertIn(after_logout.status_code, (401, 403))

    def test_invalid_login_returns_400(self):
        response = self.client.post(
            "/api/login",
            {"email": self.user.email, "password": "wrong-pass"},
            format="json",
        )

        self.assertEqual(response.status_code, 400)
