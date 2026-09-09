from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import timedelta

from .models import (
    User, ClientProfile, WorkoutPlan, WorkoutCompletion, DietPlan,
    DailyCheckIn, ProgressPhoto, Notification, Payment
)
from .serializers import (
    CustomTokenObtainPairSerializer, ChangePasswordSerializer, TrainerRegisterSerializer,
    ClientProfileSerializer, ClientCreateSerializer, WorkoutPlanSerializer,
    WorkoutCompletionSerializer, DietPlanSerializer, DailyCheckInSerializer,
    ProgressPhotoSerializer, NotificationSerializer, PaymentSerializer,
    UserSerializer
)
from .permissions import IsTrainer, IsClientOwnerOrTrainer


@api_view(['POST'])
@permission_classes([])
def register_trainer(request):
    serializer = TrainerRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "Trainer registered successfully.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.data.get("old_password")):
            return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.data.get("new_password"))
        user.save()
        return Response({"status": "Password changed successfully"}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_dashboard_stats(request):
    today = timezone.now().date()
    clients = ClientProfile.objects.all()
    total_clients = clients.count()
    
    active_count = 0
    inactive_count = 0
    for client in clients:
        st = client.check_in_status
        if st in ['ON_TRACK', 'MISSED_TODAY']:
            active_count += 1
        else:
            inactive_count += 1

    pending_payments = Payment.objects.filter(status__in=['PENDING', 'OVERDUE']).count()
    monthly_revenue = Payment.objects.filter(status='PAID').aggregate(total=Sum('monthly_fee'))['total'] or 0.00
    checkins_today = DailyCheckIn.objects.filter(date=today).count()

    alerts = []
    for client in clients:
        st = client.check_in_status
        if st == 'INACTIVE':
            alerts.append({
                'id': client.id,
                'client_name': client.full_name,
                'type': 'INACTIVE_3_DAYS',
                'message': f"{client.full_name} has been inactive for 3+ days!"
            })
        overdue_pay = client.payments.filter(status='OVERDUE').first()
        if overdue_pay:
            alerts.append({
                'id': client.id,
                'client_name': client.full_name,
                'type': 'PAYMENT_OVERDUE',
                'message': f"{client.full_name}'s payment of ₹{overdue_pay.monthly_fee} is overdue!"
            })

    return Response({
        'total_clients': total_clients,
        'active_clients': active_count,
        'inactive_clients': inactive_count,
        'pending_payments': pending_payments,
        'monthly_revenue': float(monthly_revenue),
        'checkins_today': checkins_today,
        'alerts': alerts
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_dashboard_stats(request):
    user = request.user
    if user.role == User.Role.TRAINER:
        return Response({'detail': 'Dashboard for client access only.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        client = user.client_profile
    except ClientProfile.DoesNotExist:
        return Response({'detail': 'Client profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()
    day_name = today.strftime('%A')
    
    todays_workouts = client.workout_plans.filter(day=day_name)
    workout_completed = WorkoutCompletion.objects.filter(client=client, date=today, completed=True).exists()
    today_checkin = client.check_ins.filter(date=today).first()
    
    diet = getattr(client, 'diet_plan', None)
    diet_data = DietPlanSerializer(diet).data if diet else None
    
    return Response({
        'client_id': client.id,
        'streak': client.current_streak,
        'workout_time': client.workout_time,
        'todays_workouts_count': todays_workouts.count(),
        'workout_completed': workout_completed,
        'checkin_completed': bool(today_checkin),
        'current_weight': client.current_weight,
        'goal_weight': client.goal_weight,
        'starting_weight': client.starting_weight,
        'diet_plan': diet_data,
        'today_checkin': DailyCheckInSerializer(today_checkin).data if today_checkin else None
    })


class ClientProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ClientProfileSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.TRAINER:
            return ClientProfile.objects.all()
        return ClientProfile.objects.filter(user=user)

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = ClientProfile.objects.filter(pk=pk).first()
            if obj and obj.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's information.")
        return super().get_object()

    def create(self, request, *args, **kwargs):
        if request.user.role != User.Role.TRAINER:
            return Response({'detail': 'Only trainers can create client accounts.'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ClientCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        client_profile = serializer.save()

        Notification.objects.create(
            sender=request.user,
            receiver=client_profile.user,
            title="Welcome to FitPulse!",
            message=f"Welcome {client_profile.full_name}! Your profile and dashboard are ready. Let's reach your goals together."
        )

        return Response(ClientProfileSerializer(client_profile).data, status=status.HTTP_201_CREATED)


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    serializer_class = WorkoutPlanSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        client_id = self.request.query_params.get('client_id')
        
        if user.role == User.Role.TRAINER:
            if client_id:
                return WorkoutPlan.objects.filter(client_id=client_id)
            return WorkoutPlan.objects.all()
        
        if hasattr(user, 'client_profile'):
            return WorkoutPlan.objects.filter(client=user.client_profile)
        return WorkoutPlan.objects.none()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = WorkoutPlan.objects.filter(pk=pk).first()
            if obj and obj.client.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's workout plan.")
        return super().get_object()


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def workout_completion_toggle(request):
    user = request.user
    today = timezone.now().date()
    req_date = request.data.get('date', today) if request.method == 'POST' else request.query_params.get('date', today)
    
    if user.role == User.Role.CLIENT:
        try:
            client = user.client_profile
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Client profile missing.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        client_id = request.data.get('client_id') or request.query_params.get('client_id')
        if not client_id:
            return Response({'detail': 'client_id parameter required for trainer.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            client = ClientProfile.objects.get(id=client_id)
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Client profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        completion = WorkoutCompletion.objects.filter(client=client, date=req_date).first()
        return Response({'client_id': client.id, 'date': str(req_date), 'completed': completion.completed if completion else False})

    elif request.method == 'POST':
        completed = request.data.get('completed', True)
        obj, created = WorkoutCompletion.objects.update_or_create(
            client=client,
            date=req_date,
            defaults={'completed': completed}
        )
        return Response(WorkoutCompletionSerializer(obj).data, status=status.HTTP_200_OK)


class DietPlanViewSet(viewsets.ModelViewSet):
    serializer_class = DietPlanSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        client_id = self.request.query_params.get('client_id')
        if user.role == User.Role.TRAINER:
            if client_id:
                return DietPlan.objects.filter(client_id=client_id)
            return DietPlan.objects.all()
        
        if hasattr(user, 'client_profile'):
            return DietPlan.objects.filter(client=user.client_profile)
        return DietPlan.objects.none()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = DietPlan.objects.filter(pk=pk).first()
            if obj and obj.client.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's diet plan.")
        return super().get_object()


class DailyCheckInViewSet(viewsets.ModelViewSet):
    serializer_class = DailyCheckInSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        client_id = self.request.query_params.get('client_id')
        if user.role == User.Role.TRAINER:
            if client_id:
                return DailyCheckIn.objects.filter(client_id=client_id)
            return DailyCheckIn.objects.all()
        
        if hasattr(user, 'client_profile'):
            return DailyCheckIn.objects.filter(client=user.client_profile)
        return DailyCheckIn.objects.none()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = DailyCheckIn.objects.filter(pk=pk).first()
            if obj and obj.client.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's check-in.")
        return super().get_object()

    def perform_create(self, serializer):
        checkin = serializer.save()
        client = checkin.client
        client.current_weight = checkin.weight
        client.save()


class ProgressPhotoViewSet(viewsets.ModelViewSet):
    serializer_class = ProgressPhotoSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        client_id = self.request.query_params.get('client_id')
        if user.role == User.Role.TRAINER:
            if client_id:
                return ProgressPhoto.objects.filter(client_id=client_id)
            return ProgressPhoto.objects.all()
        
        if hasattr(user, 'client_profile'):
            return ProgressPhoto.objects.filter(client=user.client_profile)
        return ProgressPhoto.objects.none()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = ProgressPhoto.objects.filter(pk=pk).first()
            if obj and obj.client.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's progress photo.")
        return super().get_object()


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(Q(receiver=user) | Q(sender=user))

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'marked as read'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsTrainer])
def send_custom_notification(request):
    receiver_id = request.data.get('receiver_id')
    broadcast_all = request.data.get('broadcast_all', False)
    title = request.data.get('title', 'Trainer Notice')
    message = request.data.get('message')

    if not message:
        return Response({'detail': 'Message content is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if broadcast_all:
        clients = ClientProfile.objects.all()
        created_count = 0
        for c in clients:
            Notification.objects.create(
                sender=request.user,
                receiver=c.user,
                title=title,
                message=message
            )
            created_count += 1
        return Response({'detail': f'Notification sent to {created_count} clients.'}, status=status.HTTP_201_CREATED)
    else:
        if not receiver_id:
            return Response({'detail': 'receiver_id or broadcast_all flag required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            receiver = User.objects.get(id=receiver_id)
        except User.DoesNotExist:
            return Response({'detail': 'Receiver user not found.'}, status=status.HTTP_404_NOT_FOUND)

        notif = Notification.objects.create(
            sender=request.user,
            receiver=receiver,
            title=title,
            message=message
        )
        return Response(NotificationSerializer(notif).data, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated, IsClientOwnerOrTrainer]

    def get_queryset(self):
        user = self.request.user
        client_id = self.request.query_params.get('client_id')
        if user.role == User.Role.TRAINER:
            if client_id:
                return Payment.objects.filter(client_id=client_id)
            return Payment.objects.all()
        
        if hasattr(user, 'client_profile'):
            return Payment.objects.filter(client=user.client_profile)
        return Payment.objects.none()

    def get_object(self):
        pk = self.kwargs.get('pk')
        if self.request.user.role == User.Role.CLIENT:
            obj = Payment.objects.filter(pk=pk).first()
            if obj and obj.client.user != self.request.user:
                raise PermissionDenied("You do not have permission to access another client's payment record.")
        return super().get_object()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_progress_report(request):
    user = request.user
    client_id = request.query_params.get('client_id')

    if user.role == User.Role.TRAINER:
        if not client_id:
            return Response({'detail': 'client_id query parameter required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            client = ClientProfile.objects.get(id=client_id)
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Client profile not found.'}, status=status.HTTP_404_NOT_FOUND)
    else:
        try:
            client = user.client_profile
        except ClientProfile.DoesNotExist:
            return Response({'detail': 'Client profile not found.'}, status=status.HTTP_404_NOT_FOUND)

    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)

    checkins = client.check_ins.filter(date__gte=seven_days_ago, date__lte=today).order_by('date')
    checkin_count = checkins.count()
    checkin_consistency_pct = round((checkin_count / 7.0) * 100, 1)

    first_checkin = checkins.first()
    last_checkin = checkins.last()
    start_w = first_checkin.weight if first_checkin else client.starting_weight
    end_w = last_checkin.weight if last_checkin else client.current_weight
    weight_change = round(end_w - start_w, 2)

    completions = WorkoutCompletion.objects.filter(client=client, date__gte=seven_days_ago, date__lte=today, completed=True).count()
    workout_completion_pct = round((completions / 7.0) * 100, 1)

    target_protein = client.diet_plan.protein if hasattr(client, 'diet_plan') else 150
    avg_protein = checkins.aggregate(avg=Sum('protein'))['avg'] or 0
    avg_daily_protein = round(avg_protein / max(checkin_count, 1), 1)
    protein_achievement_pct = round((avg_daily_protein / max(target_protein, 1)) * 100, 1)

    return Response({
        'client_name': client.full_name,
        'report_period': f"{seven_days_ago.strftime('%b %d')} - {today.strftime('%b %d, %Y')}",
        'starting_weight': start_w,
        'current_weight': end_w,
        'weight_change': weight_change,
        'checkin_consistency_pct': checkin_consistency_pct,
        'workout_completion_pct': workout_completion_pct,
        'target_protein_g': target_protein,
        'avg_daily_protein_g': avg_daily_protein,
        'protein_achievement_pct': protein_achievement_pct,
        'current_streak': client.current_streak
    })
