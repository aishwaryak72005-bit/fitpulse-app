from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import (
    User, ClientProfile, WorkoutPlan, WorkoutCompletion, DietPlan,
    DailyCheckIn, ProgressPhoto, Notification, Payment
)


class Command(BaseCommand):
    help = 'Seeds database with realistic initial trainer and client data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding initial data...')

        # Create Trainer
        trainer, created = User.objects.get_or_create(
            username='trainer',
            defaults={
                'email': 'trainer@fitpulse.com',
                'first_name': 'Alex',
                'last_name': 'Mercer',
                'role': User.Role.TRAINER
            }
        )
        if created:
            trainer.set_password('Trainer@123')
            trainer.save()
            self.stdout.write(self.style.SUCCESS('Created Trainer: trainer / Trainer@123'))
        else:
            self.stdout.write('Trainer already exists.')

        clients_data = [
            {
                'username': 'rahul',
                'email': 'rahul@fitpulse.com',
                'first_name': 'Rahul',
                'last_name': 'Sharma',
                'password': 'Client@123',
                'age': 28,
                'gender': 'Male',
                'phone': '+91 9876543210',
                'height': 178.0,
                'starting_weight': 82.5,
                'current_weight': 78.0,
                'goal_weight': 74.0,
                'fitness_goal': 'Hypertrophy & Weight Loss',
                'workout_time': '07:00:00',
                'days_inactive': 0
            },
            {
                'username': 'priya',
                'email': 'priya@fitpulse.com',
                'first_name': 'Priya',
                'last_name': 'Patel',
                'password': 'Client@123',
                'age': 25,
                'gender': 'Female',
                'phone': '+91 9876543211',
                'height': 163.0,
                'starting_weight': 62.0,
                'current_weight': 58.5,
                'goal_weight': 55.0,
                'fitness_goal': 'Fat Loss & Core Strength',
                'workout_time': '18:30:00',
                'days_inactive': 1
            },
            {
                'username': 'amit',
                'email': 'amit@fitpulse.com',
                'first_name': 'Amit',
                'last_name': 'Verma',
                'password': 'Client@123',
                'age': 32,
                'gender': 'Male',
                'phone': '+91 9876543212',
                'height': 175.0,
                'starting_weight': 90.0,
                'current_weight': 89.2,
                'goal_weight': 80.0,
                'fitness_goal': 'Weight Loss & Endurance',
                'workout_time': '08:00:00',
                'days_inactive': 4
            }
        ]

        today = timezone.now().date()

        for cdata in clients_data:
            cuser, c_created = User.objects.get_or_create(
                username=cdata['username'],
                defaults={
                    'email': cdata['email'],
                    'first_name': cdata['first_name'],
                    'last_name': cdata['last_name'],
                    'role': User.Role.CLIENT
                }
            )
            if c_created:
                cuser.set_password(cdata['password'])
                cuser.save()

            profile, p_created = ClientProfile.objects.get_or_create(
                user=cuser,
                defaults={
                    'trainer': trainer,
                    'age': cdata['age'],
                    'gender': cdata['gender'],
                    'phone': cdata['phone'],
                    'height': cdata['height'],
                    'starting_weight': cdata['starting_weight'],
                    'current_weight': cdata['current_weight'],
                    'goal_weight': cdata['goal_weight'],
                    'fitness_goal': cdata['fitness_goal'],
                    'workout_time': cdata['workout_time'],
                    'join_date': today - timedelta(days=30)
                }
            )

            # Create Diet Plan
            DietPlan.objects.get_or_create(
                client=profile,
                defaults={
                    'calories': 2200 if cdata['gender'] == 'Male' else 1700,
                    'protein': 160 if cdata['gender'] == 'Male' else 120,
                    'carbs': 230 if cdata['gender'] == 'Male' else 170,
                    'fats': 65 if cdata['gender'] == 'Male' else 50,
                    'water_goal': 4.0 if cdata['gender'] == 'Male' else 3.0
                }
            )

            # Create Workouts
            workouts_sample = [
                ('Monday', 'Barbell Bench Press', 4, 10, 'Focus on controlled eccentric phase'),
                ('Monday', 'Push Ups', 3, 15, 'Bodyweight warm down'),
                ('Tuesday', 'Barbell Squats', 4, 8, 'Keep back neutral'),
                ('Tuesday', 'Leg Extension', 3, 12, 'Squeeze at top'),
                ('Wednesday', 'Lat Pulldown', 4, 10, 'Full range of motion'),
                ('Thursday', 'Overhead Shoulder Press', 4, 8, 'Strict form'),
                ('Friday', 'Deadlift', 4, 6, 'Engage core'),
                ('Saturday', 'HIIT Treadmill Sprints', 5, 1, '30s sprint / 60s walk'),
            ]
            for wday, wname, wsets, wreps, wnotes in workouts_sample:
                WorkoutPlan.objects.get_or_create(
                    client=profile,
                    day=wday,
                    exercise_name=wname,
                    defaults={'sets': wsets, 'reps': wreps, 'notes': wnotes}
                )

            # Create check-ins for previous days based on days_inactive
            days_inactive = cdata['days_inactive']
            for i in range(14, days_inactive - 1, -1):
                if i < days_inactive:
                    continue
                checkin_date = today - timedelta(days=i)
                w_val = cdata['starting_weight'] - ((14 - i) * 0.3)
                DailyCheckIn.objects.get_or_create(
                    client=profile,
                    date=checkin_date,
                    defaults={
                        'weight': round(w_val, 1),
                        'protein': 155.0 if cdata['gender'] == 'Male' else 115.0,
                        'water': 3.8 if cdata['gender'] == 'Male' else 2.8,
                        'steps': 8500 + (i * 150),
                        'sleep': 7.5,
                        'notes': 'Feeling energetic today!'
                    }
                )
                WorkoutCompletion.objects.get_or_create(
                    client=profile,
                    date=checkin_date,
                    defaults={'completed': True}
                )

            # Payments
            pay_status = 'PAID' if cdata['username'] != 'amit' else 'OVERDUE'
            Payment.objects.get_or_create(
                client=profile,
                due_date=today - timedelta(days=5 if pay_status == 'OVERDUE' else -25),
                defaults={
                    'monthly_fee': 150.00,
                    'renewal_date': today + timedelta(days=25),
                    'status': pay_status
                }
            )

            # Notifications
            Notification.objects.get_or_create(
                sender=trainer,
                receiver=cuser,
                title="Daily Motivation 🔥",
                defaults={
                    'message': "Good morning! Every workout brings you one step closer to your goal weight. Let's crush today!",
                    'is_read': False
                }
            )

            self.stdout.write(self.style.SUCCESS(f"Seeded Client: {cdata['username']} / {cdata['password']}"))

        self.stdout.write(self.style.SUCCESS('Successfully seeded FitPulse database!'))
