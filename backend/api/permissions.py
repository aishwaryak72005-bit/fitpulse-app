from rest_framework import permissions

class IsTrainer(permissions.BasePermission):
    """
    Allows access only to authenticated users with TRAINER role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'TRAINER')


class IsClientOwnerOrTrainer(permissions.BasePermission):
    """
    Custom permission to only allow clients to view/edit their own data,
    while Trainers can view/edit data of clients assigned to them or all clients.
    Raises 403 Forbidden if a client attempts to access another client's data.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False

        # Trainer has full access
        if request.user.role == 'TRAINER':
            return True

        # For Client user, check object ownership strictly
        user = request.user
        
        if hasattr(obj, 'user'):
            return obj.user == user
        elif hasattr(obj, 'client'):
            return obj.client.user == user
        elif hasattr(obj, 'receiver'):
            return obj.receiver == user or obj.sender == user
        elif hasattr(obj, 'username'):
            return obj == user

        return False
