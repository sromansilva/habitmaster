import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'habitapp_backend.settings')
django.setup()

from core.models import Usuario, Habito, UsuarioHabito
from django.db.utils import IntegrityError

def verify():
    print("Verifying Database Connection...")
    try:
        user_count = Usuario.objects.count()
        print(f"Connection Successful. Users count: {user_count}")
    except Exception as e:
        print(f"Connection Failed: {e}")
        return

    print("\nTesting Composite Key Issue (UsuarioHabito)...")
    # Create dummy user and habits
    try:
        u, created = Usuario.objects.get_or_create(
            username='testuser_verify', 
            defaults={'email': 'test@example.com', 'password': 'pass'}
        )
        h1, _ = Habito.objects.get_or_create(nombre='Habit 1')
        h2, _ = Habito.objects.get_or_create(nombre='Habit 2')

        # Try to link first habit
        if not UsuarioHabito.objects.filter(usuario=u, habito=h1).exists():
            UsuarioHabito.objects.create(usuario=u, habito=h1)
            print("Linked Habit 1")
        
        # Try to link second habit
        if not UsuarioHabito.objects.filter(usuario=u, habito=h2).exists():
            UsuarioHabito.objects.create(usuario=u, habito=h2)
            print("Linked Habit 2")
            
        print("Successfully linked multiple habits! (Surprising if PK is id_usuario)")
        
    except IntegrityError as e:
        print(f"IntegrityError (Expected due to PK issue): {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    verify()
