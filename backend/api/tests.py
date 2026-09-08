from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from api.models import User, ClientProfile, WorkoutPlan, DietPlan


class RBACTests(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        
        # Create trainer
        self.trainer = User.objects.create_user(
            username='trainer_test',
            email='trainer_test@fitpulse.com',
            password='Password@123',
            role=User.Role.TRAINER
        )
        
        # Create Client 1 (Rahul)
        self.user1 = User.objects.create_user(
            username='client1_test',
            email='client1@fitpulse.com',
            password='Password@123',
            role=User.Role.CLIENT
        )
        self.profile1 = ClientProfile.objects.create(
            user=self.user1,
            trainer=self.trainer,
            current_weight=75.0,
            goal_weight=70.0
        )
        
        # Create Client 2 (Priya)
        self.user2 = User.objects.create_user(
            username='client2_test',
            email='client2@fitpulse.com',
            password='Password@123',
            role=User.Role.CLIENT
        )
        self.profile2 = ClientProfile.objects.create(
            user=self.user2,
            trainer=self.trainer,
            current_weight=58.0,
            goal_weight=55.0
        )

    def test_client_cannot_access_other_client_profile(self):
        """Verify client 1 receives 403 Forbidden when requesting client 2's profile detail"""
        self.client_api.force_authenticate(user=self.user1)
        response = self.client_api.get(f'/api/clients/{self.profile2.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_trainer_can_access_any_client_profile(self):
        """Verify trainer receives 200 OK when requesting client 2's profile detail"""
        self.client_api.force_authenticate(user=self.trainer)
        response = self.client_api.get(f'/api/clients/{self.profile2.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.profile2.id)

    def test_client_own_profile_access(self):
        """Verify client 1 can view their own profile"""
        self.client_api.force_authenticate(user=self.user1)
        response = self.client_api.get(f'/api/clients/{self.profile1.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.profile1.id)

    def test_trainer_can_create_client(self):
        """Verify trainer can create a new client without AttributeError"""
        self.client_api.force_authenticate(user=self.trainer)
        data = {
            'username': 'newclient',
            'email': 'newclient@fitpulse.com',
            'password': 'Password@123',
            'first_name': 'New',
            'last_name': 'Client',
            'phone': '+91 9999999999',
            'age': 26,
            'gender': 'Male',
            'height': 175,
            'starting_weight': 80,
            'current_weight': 80,
            'goal_weight': 75,
            'fitness_goal': 'Fat Loss',
            'workout_time': '07:00:00'
        }
        response = self.client_api.post('/api/clients/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['full_name'], 'New Client')
