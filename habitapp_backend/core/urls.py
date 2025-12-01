from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet, PerfilViewSet, PreferenciaViewSet, 
    HabitoViewSet, UsuarioHabitoViewSet, LogroViewSet, 
    UsuarioLogroViewSet, UsuarioLogViewSet,
    RegisterView, LoginView, UserProfileView
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'perfiles', PerfilViewSet)
router.register(r'preferencias', PreferenciaViewSet)
router.register(r'habitos', HabitoViewSet)
router.register(r'usuario_habitos', UsuarioHabitoViewSet)
router.register(r'logros', LogroViewSet)
router.register(r'usuario_logros', UsuarioLogroViewSet)
router.register(r'logs', UsuarioLogViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('user/me/', UserProfileView.as_view(), name='user-profile'),
]
