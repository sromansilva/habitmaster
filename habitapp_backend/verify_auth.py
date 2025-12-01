import os
import django
import json
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'habitapp_backend.settings')
django.setup()

from rest_framework.test import APIRequestFactory
from core.views import RegisterView, LoginView
from core.models import Usuario

def verify_auth():
    factory = APIRequestFactory()
    
    print("Testing Registration...")
    # Clean up test user
    Usuario.objects.filter(username='authtest').delete()
    
    reg_data = {
        'username': 'authtest',
        'email': 'authtest@example.com',
        'password': 'securepassword123'
    }
    
    request = factory.post('/api/auth/register/', reg_data, format='json')
    view = RegisterView.as_view()
    response = view(request)
    
    if response.status_code == 201:
        print("Registration Successful!")
        print(response.data)
    else:
        print(f"Registration Failed: {response.status_code}")
        print(response.data)
        return

    print("\nTesting Login...")
    login_data = {
        'username': 'authtest',
        'password': 'securepassword123'
    }
    
    request = factory.post('/api/auth/login/', login_data, format='json')
    view = LoginView.as_view()
    response = view(request)
    
    if response.status_code == 200:
        print("Login Successful!")
        if 'access' in response.data and 'refresh' in response.data:
            print("Tokens received.")
        else:
            print("Tokens MISSING!")
        print(response.data)
    else:
        print(f"Login Failed: {response.status_code}")
        print(response.data)

if __name__ == '__main__':
    verify_auth()
