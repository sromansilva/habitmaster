from rest_framework import viewsets, status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario, Perfil, Preferencia, Habito, UsuarioHabito, Logro, UsuarioLogro, UsuarioLog
from .serializers import (
    UsuarioSerializer, RegisterSerializer, LoginSerializer,
    PerfilSerializer, PreferenciaSerializer, 
    HabitoSerializer, UsuarioHabitoSerializer, LogroSerializer, 
    UsuarioLogroSerializer, UsuarioLogSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return user data
        user_serializer = UsuarioSerializer(user)
        return Response(user_serializer.data, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        try:
            user = Usuario.objects.get(username=username)
        except Usuario.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if not check_password(password, user.password):
            return Response({'error': 'Contraseña incorrecta'}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id_usuario': user.id_usuario,
                'username': user.username,
                'email': user.email
            }
        })

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.all()
    serializer_class = PerfilSerializer

class PreferenciaViewSet(viewsets.ModelViewSet):
    queryset = Preferencia.objects.all()
    serializer_class = PreferenciaSerializer

class HabitoViewSet(viewsets.ModelViewSet):
    queryset = Habito.objects.all()
    serializer_class = HabitoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter habits by the current user
        user = self.request.user
        return Habito.objects.filter(usuariohabito__usuario=user)

    def perform_create(self, serializer):
        # Create the habit
        habito = serializer.save()
        # Link it to the current user
        UsuarioHabito.objects.create(usuario=self.request.user, habito=habito)
        
        # Update profile stats (num_habitos_creados)
        try:
            perfil = Perfil.objects.get(usuario=self.request.user)
            perfil.num_habitos_creados += 1
            perfil.save()
        except Perfil.DoesNotExist:
            pass

    def update(self, request, *args, **kwargs):
        from datetime import datetime, timedelta
        
        # Get the habit instance before update
        instance = self.get_object()
        old_estado = instance.estado
        
        # Perform the update
        response = super().update(request, *args, **kwargs)
        
        # Get the updated instance
        instance.refresh_from_db()
        new_estado = instance.estado
        
        # Update points and streaks if estado changed
        if old_estado != new_estado:
            try:
                perfil = Perfil.objects.get(usuario=request.user)
                
                if old_estado == 'pendiente' and new_estado == 'completado':
                    # Habit completed: add points
                    perfil.puntos_totales += instance.puntos
                    perfil.habitos_completados += 1
                    
                    # Calculate streak
                    today = datetime.now().date()
                    yesterday = today - timedelta(days=1)
                    
                    # Get all user's habits completed today
                    user_habits = Habito.objects.filter(
                        usuariohabito__usuario=request.user,
                        estado='completado',
                        fecha=today
                    )
                    
                    # Get habits completed yesterday
                    habits_yesterday = Habito.objects.filter(
                        usuariohabito__usuario=request.user,
                        estado='completado',
                        fecha=yesterday
                    )
                    
                    # Update streak logic
                    if habits_yesterday.exists():
                        # Continue streak
                        perfil.racha_actual += 1
                    else:
                        # Check if this is the first habit today
                        if user_habits.count() == 1:  # Only this habit completed today
                            # Start new streak or reset
                            perfil.racha_actual = 1
                    
                    # Update max streak if current is higher
                    if perfil.racha_actual > perfil.racha_maxima:
                        perfil.racha_maxima = perfil.racha_actual
                    
                    print("Added {} points. Total: {}".format(instance.puntos, perfil.puntos_totales))
                    print("Streak: {} days (Max: {})".format(perfil.racha_actual, perfil.racha_maxima))
                    
                elif old_estado == 'completado' and new_estado == 'pendiente':
                    # Habit uncompleted: subtract points
                    perfil.puntos_totales = max(0, perfil.puntos_totales - instance.puntos)
                    perfil.habitos_completados = max(0, perfil.habitos_completados - 1)
                    
                    print("Subtracted {} points. Total: {}".format(instance.puntos, perfil.puntos_totales))
                
                perfil.save()
                
            except Perfil.DoesNotExist:
                print("Profile not found for user {}".format(request.user.username))
                pass
        
        return response

class UsuarioHabitoViewSet(viewsets.ModelViewSet):
    queryset = UsuarioHabito.objects.all()
    serializer_class = UsuarioHabitoSerializer
    permission_classes = [permissions.IsAuthenticated]

class LogroViewSet(viewsets.ModelViewSet):
    queryset = Logro.objects.all()
    serializer_class = LogroSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsuarioLogroViewSet(viewsets.ModelViewSet):
    queryset = UsuarioLogro.objects.all()
    serializer_class = UsuarioLogroSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsuarioLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UsuarioLog.objects.all()
    serializer_class = UsuarioLogSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            perfil = Perfil.objects.get(usuario=user)
            preferencias = Preferencia.objects.get(usuario=user)
            
            return Response({
                'user': {
                    'id_usuario': user.id_usuario,
                    'username': user.username,
                    'email': user.email
                },
                'perfil': PerfilSerializer(perfil).data,
                'preferencias': PreferenciaSerializer(preferencias).data
            })
        except (Perfil.DoesNotExist, Preferencia.DoesNotExist):
            return Response({'error': 'Profile or Preferences not found'}, status=404)

    def patch(self, request):
        user = request.user
        data = request.data
        
        # Update User (username, email)
        if 'user' in data:
            user_serializer = UsuarioSerializer(user, data=data['user'], partial=True)
            if user_serializer.is_valid():
                user_serializer.save()
            else:
                return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Update Profile
        if 'perfil' in data:
            try:
                perfil = Perfil.objects.get(usuario=user)
                perfil_serializer = PerfilSerializer(perfil, data=data['perfil'], partial=True)
                if perfil_serializer.is_valid():
                    perfil_serializer.save()
                else:
                    return Response(perfil_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Perfil.DoesNotExist:
                pass

        # Update Preferences
        if 'preferencias' in data:
            try:
                pref = Preferencia.objects.get(usuario=user)
                pref_serializer = PreferenciaSerializer(pref, data=data['preferencias'], partial=True)
                if pref_serializer.is_valid():
                    pref_serializer.save()
                else:
                    return Response(pref_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Preferencia.DoesNotExist:
                pass
                
        return self.get(request)
