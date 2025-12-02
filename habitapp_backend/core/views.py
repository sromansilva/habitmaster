from rest_framework import viewsets, status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Usuario, Perfil, Preferencia, Habito, UsuarioHabito, Logro, UsuarioLogro, UsuarioLog
from .prolog_service import PrologService
from .chat_service import ChatService
from .serializers import (
    UsuarioSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    PerfilSerializer, PreferenciaSerializer, 
    HabitoSerializer, UsuarioHabitoSerializer, LogroSerializer, 
    UsuarioLogroSerializer, UsuarioLogSerializer, RankingSerializer
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

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not check_password(serializer.data.get("old_password"), user.password):
                return Response({"old_password": ["Contraseña incorrecta."]}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.data.get("new_password"))
            user.save()
            return Response({"status": "success", "message": "Contraseña actualizada correctamente."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
class RankingView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = RankingSerializer
    
    def get_queryset(self):
        return Perfil.objects.select_related('usuario').all().order_by('-puntos_totales')

class PrologDemoView(APIView):
    permission_classes = [permissions.AllowAny] # Allow any for demo purposes, or IsAuthenticated

    def get(self, request):
        service = PrologService()
        action = request.query_params.get('action')

        if not action:
            # Return available actions
            return Response({
                'available_actions': [
                    'sugerir_habito',
                    'sugerir_por_dificultad',
                    'nivel_usuario',
                    'calcular_bonus'
                ]
            })

        try:
            result = {}
            if action == 'sugerir_habito':
                categoria = request.query_params.get('categoria', 'Salud')
                result['resultado'] = service.obtener_sugerencias(categoria)
            
            elif action == 'sugerir_por_dificultad':
                dificultad = request.query_params.get('dificultad', 'Facil')
                result['resultado'] = service.obtener_sugerencias_por_dificultad(dificultad)
            
            elif action == 'nivel_usuario':
                puntos = int(request.query_params.get('puntos', 0))
                result['resultado'] = service.obtener_nivel(puntos)
            
            elif action == 'calcular_bonus':
                racha = int(request.query_params.get('racha', 0))
                result['resultado'] = service.calcular_bonus_racha(racha)
            
            else:
                return Response({'error': 'Acción no válida'}, status=400)

            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class ChatBotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Endpoint to handle chat messages.
        Expects:
        {
            "message": "User message here",
            "history": [{"role": "user", "content": "prev msg"}, ...] (Optional)
        }
        """
        user_message = request.data.get('message')
        history = request.data.get('history', [])

        if not user_message:
            return Response({'error': 'Message is required'}, status=400)

        # Construct context from history + current message
        # Ensure history is a list of dicts with 'role' and 'content'
        # We limit history to last 10 messages to save tokens
        recent_history = history[-10:] if history else []
        
        # Add current message
        current_msg_obj = {"role": "user", "content": user_message}
        messages = recent_history + [current_msg_obj]

        service = ChatService()
        response_text = service.get_chat_response(messages)

        return Response({
            'response': response_text,
            'message': current_msg_obj # Return the formatted user message to append to state if needed
        })
