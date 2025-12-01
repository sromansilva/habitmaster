from django.contrib import admin
from .models import Usuario, Perfil, Preferencia, Habito, Logro, UsuarioLog

admin.site.register(Usuario)
admin.site.register(Perfil)
admin.site.register(Preferencia)
admin.site.register(Habito)
admin.site.register(Logro)
admin.site.register(UsuarioLog)
