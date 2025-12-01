from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UsuarioManager(BaseUserManager):
    def create_user(self, username, email, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')

        user = self.model(
            username=username,
            email=self.normalize_email(email),
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None):
        user = self.create_user(
            username,
            email,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user

class Usuario(AbstractBaseUser):
    id_usuario = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    email = models.CharField(max_length=255, unique=True)
    password = models.TextField(db_column='password_hash')
    fecha_creacion = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(null=True, blank=True) # Required by AbstractBaseUser

    objects = UsuarioManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'usuarios'
        managed = False

    def __str__(self):
        return self.username

class Perfil(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, db_column='id_usuario')
    biografia = models.TextField(null=True, blank=True)
    puntos_totales = models.IntegerField(default=0)
    racha_actual = models.IntegerField(default=0)
    racha_maxima = models.IntegerField(default=0)
    num_habitos_creados = models.IntegerField(default=0)
    habitos_completados = models.IntegerField(default=0)
    num_logros_obtenidos = models.IntegerField(default=0)
    meta_diaria = models.IntegerField(default=3)
    avatar_url = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'perfiles'
        managed = False

class Preferencia(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, db_column='id_usuario')
    modo_oscuro = models.BooleanField(default=False)
    notificaciones_push = models.BooleanField(default=False)
    notificaciones_email = models.BooleanField(default=False)
    zona_horaria = models.CharField(max_length=100, blank=True, null=True)
    idioma = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        db_table = 'preferencias'
        managed = False

class Habito(models.Model):
    id_habito = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(null=True, blank=True)
    puntos = models.IntegerField(default=0)
    fecha = models.DateField(default=timezone.now)
    categoria = models.CharField(max_length=100, null=True, blank=True)
    dias = models.CharField(max_length=50, null=True, blank=True)
    estado = models.CharField(max_length=20, default='pendiente')

    class Meta:
        db_table = 'habitos'
        managed = False

    def __str__(self):
        return self.nombre

class UsuarioHabito(models.Model):
    # Django requires a single primary key. We'll use usuario as the PK for definition purposes,
    # but in reality it's a composite key.
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario', primary_key=True)
    habito = models.ForeignKey(Habito, on_delete=models.CASCADE, db_column='id_habito')

    class Meta:
        db_table = 'usuario_habito'
        managed = False
        unique_together = (('usuario', 'habito'),)

class Logro(models.Model):
    id_logro = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    puntos = models.IntegerField(default=0)
    condicion = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'logros'
        managed = False

    def __str__(self):
        return self.nombre

class UsuarioLogro(models.Model):
    # Same composite key workaround
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE, db_column='id_usuario', primary_key=True)
    logro = models.ForeignKey(Logro, on_delete=models.CASCADE, db_column='id_logro')
    fecha_obtencion = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'usuario_logro'
        managed = False
        unique_together = (('usuario', 'logro'),)

class UsuarioLog(models.Model):
    id_log = models.AutoField(primary_key=True)
    id_usuario = models.IntegerField(null=True, blank=True) # Keeping as integer to avoid FK constraint issues if user deleted
    accion = models.CharField(max_length=20, null=True, blank=True)
    fecha = models.DateTimeField(default=timezone.now)
    datos_anteriores = models.JSONField(null=True, blank=True)
    datos_nuevos = models.JSONField(null=True, blank=True)

    class Meta:
        db_table = 'usuario_logs'
        managed = False
