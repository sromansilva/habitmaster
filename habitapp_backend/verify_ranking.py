import requests
import json
import random

BASE_URL = 'http://localhost:8000/api'

def create_user_with_points(username, points):
    email = f"{username}@example.com"
    password = "password123"
    
    # Register
    try:
        requests.post(f"{BASE_URL}/auth/register/", json={
            "username": username,
            "email": email,
            "password": password
        })
    except:
        pass # Ignore if exists

    # Login
    resp = requests.post(f"{BASE_URL}/auth/login/", json={
        "username": username,
        "password": password
    })
    
    if resp.status_code != 200:
        print(f"Login failed for {username}: {resp.status_code} {resp.text}")
        return None
        
    token = resp.json()['access']
    headers = {'Authorization': f'Bearer {token}'}
    
    # Update points directly via profile patch (for testing purposes)
    # Note: In real app points come from habits, but we can patch profile for setup
    requests.patch(f"{BASE_URL}/user/me/", json={
        "perfil": {"puntos_totales": points}
    }, headers=headers)
    
    return token

def test_ranking():
    print("Setting up test users...")
    suffix = random.randint(1000, 9999)
    
    # Create 3 users with different points
    token1 = create_user_with_points(f"rank_user_1_{suffix}", 100)
    token2 = create_user_with_points(f"rank_user_2_{suffix}", 300)
    token3 = create_user_with_points(f"rank_user_3_{suffix}", 200)
    
    if not token1:
        print("Failed to create users")
        return

    print("Fetching ranking...")
    headers = {'Authorization': f'Bearer {token1}'}
    resp = requests.get(f"{BASE_URL}/ranking/", headers=headers)
    
    if resp.status_code != 200:
        print(f"Ranking fetch failed: {resp.status_code} {resp.text}")
        return
        
    ranking = resp.json()
    print(f"Got {len(ranking)} users in ranking")
    
    # Verify order
    points = [entry['puntos_totales'] for entry in ranking]
    print("Points:", points)
    
    if points == sorted(points, reverse=True):
        print("SUCCESS: Ranking is sorted correctly by points descending")
    else:
        print("FAILURE: Ranking is NOT sorted correctly")

if __name__ == "__main__":
    test_ranking()
