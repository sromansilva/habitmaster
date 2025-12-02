import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'habitapp_backend.settings')
django.setup()

from core.models import Perfil, Usuario
from core.serializers import RankingSerializer

def debug_ranking():
    print("Debugging Ranking...")
    
    # Check if we have profiles
    count = Perfil.objects.count()
    print(f"Total profiles: {count}")
    
    if count == 0:
        print("No profiles found.")
        return

    # Try to serialize the first profile
    try:
        perfil = Perfil.objects.select_related('usuario').first()
        print(f"First profile: {perfil.usuario.username} - {perfil.puntos_totales}")
        
        serializer = RankingSerializer(perfil)
        print("Serialized data:", serializer.data)
        
    except Exception as e:
        print(f"Error serializing profile: {e}")

if __name__ == "__main__":
    debug_ranking()
