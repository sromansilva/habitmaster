import sys
print(f"Python Executable: {sys.executable}")
print(f"Path: {sys.path}")
try:
    import rest_framework_simplejwt
    print("SUCCESS: rest_framework_simplejwt imported")
    from rest_framework_simplejwt.authentication import JWTAuthentication
    print("SUCCESS: JWTAuthentication imported")
except ImportError as e:
    print(f"ERROR: {e}")
