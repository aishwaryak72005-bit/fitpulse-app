from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import (
    ClientProfile, WorkoutPlan, WorkoutCompletion, DietPlan,
    DailyCheckIn, ProgressPhoto, Notification, Payment
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'role': self.user.role,
        }
        if hasattr(self.user, 'client_profile'):
            data['user']['client_profile_id'] = self.user.client_profile.id
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


class WorkoutPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutPlan
        fields = ['id', 'client', 'day', 'exercise_name', 'sets', 'reps', 'notes']


class WorkoutCompletionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutCompletion
        fields = ['id', 'client', 'date', 'completed']


class DietPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ['id', 'client', 'calories', 'protein', 'carbs', 'fats', 'water_goal', 'pdf_file']


class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = ['id', 'client', 'date', 'weight', 'protein', 'water', 'steps', 'sleep', 'notes']

    def validate(self, attrs):
        # Ensure 1 check-in per day per client
        client = attrs.get('client')
        date = attrs.get('date')
        if not self.instance:
            if DailyCheckIn.objects.filter(client=client, date=date).exists():
                raise serializers.ValidationError({"date": "A check-in for this client on this date already exists."})
        return attrs


class ProgressPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressPhoto
        fields = ['id', 'client', 'front_photo', 'side_photo', 'back_photo', 'uploaded_at']


class NotificationSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.get_full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.get_full_name', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'receiver', 'sender_name', 'receiver_name', 'title', 'message', 'created_at', 'is_read']


class PaymentSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.user.get_full_name', read_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'client', 'client_name', 'monthly_fee', 'due_date', 'renewal_date', 'status']


class ClientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    check_in_status = serializers.ReadOnlyField()
    current_streak = serializers.ReadOnlyField()
    latest_check_in = serializers.SerializerMethodField()
    diet_plan = DietPlanSerializer(read_only=True)

    class Meta:
        model = ClientProfile
        fields = [
            'id', 'user', 'trainer', 'full_name', 'email', 'age', 'gender', 'phone',
            'height', 'starting_weight', 'current_weight', 'goal_weight', 'fitness_goal',
            'join_date', 'workout_time', 'profile_photo', 'check_in_status', 'current_streak',
            'latest_check_in', 'diet_plan'
        ]

    def get_full_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username

    def get_latest_check_in(self, obj):
        latest = obj.check_ins.first()
        if latest:
            return DailyCheckInSerializer(latest).data
        return None


class ClientCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    age = serializers.IntegerField(default=25)
    gender = serializers.CharField(max_length=20, default='Male')
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    height = serializers.FloatField(default=170.0)
    starting_weight = serializers.FloatField(default=70.0)
    current_weight = serializers.FloatField(default=70.0)
    goal_weight = serializers.FloatField(default=65.0)
    fitness_goal = serializers.CharField(default='Fat Loss & Muscle Building')
    workout_time = serializers.TimeField(default='07:00:00')
    monthly_fee = serializers.DecimalField(max_digits=10, decimal_places=2, default=3000.00)

    def create(self, validated_data):
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'first_name': validated_data.get('first_name', ''),
            'last_name': validated_data.get('last_name', ''),
            'role': User.Role.CLIENT
        }
        user = User.objects.create_user(**user_data, password=validated_data['password'])
        
        trainer = self.context['request'].user if self.context['request'].user.role == 'TRAINER' else None

        client_profile = ClientProfile.objects.create(
            user=user,
            trainer=trainer,
            age=validated_data.get('age', 25),
            gender=validated_data.get('gender', 'Male'),
            phone=validated_data.get('phone', ''),
            height=validated_data.get('height', 170.0),
            starting_weight=validated_data.get('starting_weight', 70.0),
            current_weight=validated_data.get('current_weight', 70.0),
            goal_weight=validated_data.get('goal_weight', 65.0),
            fitness_goal=validated_data.get('fitness_goal', 'Fat Loss & Muscle Building'),
            workout_time=validated_data.get('workout_time', '07:00:00')
        )
        
        # Initialize default DietPlan
        DietPlan.objects.create(client=client_profile)
        
        # Initialize Payment subscription record with trainer's input monthly_fee
        fee = validated_data.get('monthly_fee', 3000.00)
        from django.utils import timezone
        from datetime import timedelta
        due_date = timezone.now().date() + timedelta(days=30)
        Payment.objects.create(
            client=client_profile,
            monthly_fee=fee,
            due_date=due_date,
            renewal_date=due_date,
            status='PENDING'
        )

        return client_profile


class TrainerRegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)

    def create(self, validated_data):
        if User.objects.filter(username=validated_data['username']).exists():
            raise serializers.ValidationError({"username": "Username already taken."})
        if User.objects.filter(email=validated_data['email']).exists():
            raise serializers.ValidationError({"email": "Email already in use."})
        
        user_data = {
            'username': validated_data['username'],
            'email': validated_data['email'],
            'first_name': validated_data.get('first_name', ''),
            'last_name': validated_data.get('last_name', ''),
            'role': User.Role.TRAINER
        }
        user = User.objects.create_user(**user_data, password=validated_data['password'])
        return user
