from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    class Role(models.TextChoices):
        TRAINER = 'TRAINER', 'Trainer'
        CLIENT = 'CLIENT', 'Client'
        
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)
    email = models.EmailField(unique=True)

    def is_trainer(self):
        return self.role == self.Role.TRAINER

    def is_client(self):
        return self.role == self.Role.CLIENT


def get_current_date():
    return timezone.now().date()


class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    trainer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients')
    age = models.IntegerField(default=25)
    gender = models.CharField(max_length=20, default='Other')
    phone = models.CharField(max_length=20, blank=True, default='')
    height = models.FloatField(help_text='Height in cm', default=170.0)
    starting_weight = models.FloatField(help_text='Starting weight in kg', default=70.0)
    current_weight = models.FloatField(help_text='Current weight in kg', default=70.0)
    goal_weight = models.FloatField(help_text='Goal weight in kg', default=65.0)
    fitness_goal = models.CharField(max_length=255, default='Fat Loss & Muscle Building')
    join_date = models.DateField(default=get_current_date)
    workout_time = models.TimeField(default='07:00:00')
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)

    @property
    def full_name(self):
        name = f"{self.user.first_name} {self.user.last_name}".strip()
        return name if name else self.user.username

    @property
    def check_in_status(self):
        """
        Status auto calculation:
        🟢 On Track: Checked in today
        🟡 Missed Today's Check-In: No check-in today, but check-in within last 3 days
        🔴 Inactive For 3+ Days: No check-in for 3+ days (or never checked in and joined 3+ days ago)
        """
        today = timezone.now().date()
        latest_checkin = self.check_ins.order_by('-date').first()
        if not latest_checkin:
            days_since_join = (today - self.join_date).days
            if days_since_join >= 3:
                return 'INACTIVE'
            return 'MISSED_TODAY'
        
        days_diff = (today - latest_checkin.date).days
        if days_diff == 0:
            return 'ON_TRACK'
        elif days_diff < 3:
            return 'MISSED_TODAY'
        else:
            return 'INACTIVE'

    @property
    def current_streak(self):
        """
        Calculates consecutive days of check-ins up to today or yesterday.
        """
        today = timezone.now().date()
        checkins = set(self.check_ins.values_list('date', flat=True))
        if not checkins:
            return 0
        
        streak = 0
        current_check_date = today
        if current_check_date not in checkins:
            current_check_date = today - timezone.timedelta(days=1)
            
        while current_check_date in checkins:
            streak += 1
            current_check_date -= timezone.timedelta(days=1)
            
        return streak


class WorkoutPlan(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Sunday', 'Sunday'),
    ]
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='workout_plans')
    day = models.CharField(max_length=20, choices=DAY_CHOICES)
    exercise_name = models.CharField(max_length=255)
    sets = models.IntegerField(default=3)
    reps = models.IntegerField(default=10)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"{self.client.user.username} - {self.day}: {self.exercise_name}"


class WorkoutCompletion(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='workout_completions')
    date = models.DateField(default=get_current_date)
    completed = models.BooleanField(default=True)

    class Meta:
        unique_together = ('client', 'date')

    def __str__(self):
        return f"{self.client.user.username} - {self.date} completed={self.completed}"


class DietPlan(models.Model):
    client = models.OneToOneField(ClientProfile, on_delete=models.CASCADE, related_name='diet_plan')
    calories = models.IntegerField(default=2000)
    protein = models.IntegerField(default=150) # grams
    carbs = models.IntegerField(default=200) # grams
    fats = models.IntegerField(default=60) # grams
    water_goal = models.FloatField(default=3.5) # Liters
    pdf_file = models.FileField(upload_to='diet_pdfs/', null=True, blank=True)

    def __str__(self):
        return f"Diet Plan for {self.client.user.username}"


class DailyCheckIn(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='check_ins')
    date = models.DateField(default=get_current_date)
    weight = models.FloatField()
    protein = models.FloatField(help_text='Protein intake in grams')
    water = models.FloatField(help_text='Water intake in Liters')
    steps = models.IntegerField(default=0)
    sleep = models.FloatField(default=7.0, help_text='Sleep hours')
    notes = models.TextField(blank=True, default='')

    class Meta:
        unique_together = ('client', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Check-In {self.client.user.username} on {self.date}"


class ProgressPhoto(models.Model):
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='progress_photos')
    front_photo = models.ImageField(upload_to='progress_photos/', null=True, blank=True)
    side_photo = models.ImageField(upload_to='progress_photos/', null=True, blank=True)
    back_photo = models.ImageField(upload_to='progress_photos/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"Photos for {self.client.user.username} at {self.uploaded_at.strftime('%Y-%m-%d')}"


class Notification(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification to {self.receiver.username}: {self.title}"


class Payment(models.Model):
    STATUS_CHOICES = [
        ('PAID', 'Paid'),
        ('PENDING', 'Pending'),
        ('OVERDUE', 'Overdue'),
    ]
    client = models.ForeignKey(ClientProfile, on_delete=models.CASCADE, related_name='payments')
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    due_date = models.DateField()
    renewal_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        ordering = ['-due_date']

    def __str__(self):
        return f"Payment {self.client.user.username} - ₹{self.monthly_fee} ({self.status})"
