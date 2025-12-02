from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Usuario, Perfil, Preferencia, Habito, UsuarioHabito, Logro, UsuarioLogro, UsuarioLog

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'email', 'fecha_creacion']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, error_messages={
        'min_length': 'La contraseña es demasiado corta'
    })

    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'username': {'error_messages': {'unique': 'Este nombre de usuario ya existe'}},
            'email': {'error_messages': {'unique': 'Este correo ya está registrado'}}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class PerfilSerializer(serializers.ModelSerializer):
    id_usuario = serializers.ReadOnlyField(source='usuario.id_usuario')

    class Meta:
        model = Perfil
        fields = ['id_usuario', 'biografia', 'puntos_totales', 'racha_actual', 'racha_maxima', 'num_habitos_creados', 'habitos_completados', 'num_logros_obtenidos', 'meta_diaria', 'avatar_url']

class PreferenciaSerializer(serializers.ModelSerializer):
    id_usuario = serializers.ReadOnlyField(source='usuario.id_usuario')

    class Meta:
        model = Preferencia
        fields = ['id_usuario', 'modo_oscuro', 'notificaciones_push', 'notificaciones_email', 'zona_horaria', 'idioma']

class HabitoSerializer(serializers.ModelSerializer):
    # Explicitly handle fecha as DateField to avoid datetime/date mismatch
    fecha = serializers.DateField(format='%Y-%m-%d', input_formats=['%Y-%m-%d', 'iso-8601'])
    
    class Meta:
        model = Habito
        fields = ['id_habito', 'nombre', 'descripcion', 'puntos', 'fecha', 'categoria', 'dias', 'estado']

class UsuarioHabitoSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioHabito
        fields = ['usuario', 'habito']

class LogroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Logro
        fields = '__all__'

class UsuarioLogroSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioLogro
        fields = ['usuario', 'logro', 'fecha_obtencion']

class UsuarioLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioLog
        fields = '__all__'
