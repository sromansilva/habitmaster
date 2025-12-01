from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.forms.models import model_to_dict
from .models import Usuario, UsuarioLog
import json

# Note: The SQL triggers already handle logging for 'usuarios' table.
# Implementing this in Django as requested will result in DUPLICATE logs if the triggers are active.
# However, per instructions "quiero que implementes esto con signals de Django", we provide the implementation.

from django.core.serializers.json import DjangoJSONEncoder
import json

# Helper to serialize data
def serialize_data(data):
    return json.loads(json.dumps(data, cls=DjangoJSONEncoder))

@receiver(post_save, sender=Usuario)
def log_usuario_save(sender, instance, created, **kwargs):
    if created:
        action = 'INSERT'
        datos_nuevos = model_to_dict(instance)
        UsuarioLog.objects.create(
            id_usuario=instance.id_usuario,
            accion=action,
            datos_nuevos=serialize_data(datos_nuevos)
        )
    else:
        action = 'UPDATE'
        datos_nuevos = model_to_dict(instance)
        UsuarioLog.objects.create(
            id_usuario=instance.id_usuario,
            accion=action,
            datos_nuevos=serialize_data(datos_nuevos)
        )

@receiver(post_delete, sender=Usuario)
def log_usuario_delete(sender, instance, **kwargs):
    action = 'DELETE'
    datos_anteriores = model_to_dict(instance)
    UsuarioLog.objects.create(
        id_usuario=instance.id_usuario,
        accion=action,
        datos_anteriores=serialize_data(datos_anteriores)
    )
