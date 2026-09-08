from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, ChangePasswordView, register_trainer,
    trainer_dashboard_stats, client_dashboard_stats,
    workout_completion_toggle, send_custom_notification,
    weekly_progress_report, ClientProfileViewSet,
    WorkoutPlanViewSet, DietPlanViewSet, DailyCheckInViewSet,
    ProgressPhotoViewSet, NotificationViewSet, PaymentViewSet
)

router = DefaultRouter()
router.register(r'clients', ClientProfileViewSet, basename='client')
router.register(r'workout-plans', WorkoutPlanViewSet, basename='workoutplan')
router.register(r'diet-plans', DietPlanViewSet, basename='dietplan')
router.register(r'daily-checkins', DailyCheckInViewSet, basename='dailycheckin')
router.register(r'progress-photos', ProgressPhotoViewSet, basename='progressphoto')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'payments', PaymentViewSet, basename='payment')

urlpatterns = [
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register-trainer/', register_trainer, name='register_trainer'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    path('trainer/stats/', trainer_dashboard_stats, name='trainer_stats'),
    path('client/stats/', client_dashboard_stats, name='client_stats'),
    path('workout-completion/', workout_completion_toggle, name='workout_completion'),
    path('notifications/broadcast/', send_custom_notification, name='send_custom_notification'),
    path('reports/weekly/', weekly_progress_report, name='weekly_report'),
    
    path('', include(router.urls)),
]
