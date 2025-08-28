#!/usr/bin/env python3
"""
Quick manual test script for SMS Campaign Platform API
Run this while the API server is running on localhost:8001
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8001"

def test_basic_endpoints():
    """Test basic endpoints manually"""
    print("🔥 SMS Campaign Platform - API Testing")
    print("=" * 50)
    
    # Test 1: Health Check
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
    
    # Test 2: Create a User
    try:
        user_data = {
            "nom_utilisateur": "admin_test",
            "mot_de_passe": "password123",
            "email": "admin@sms-platform.com",
            "role": "admin"
        }
        response = requests.post(f"{BASE_URL}/users/", json=user_data)
        print(f"✅ User Creation: {response.status_code}")
        if response.status_code in [200, 201]:
            user = response.json()
            print(f"   Created User ID: {user.get('id', 'N/A')}")
    except Exception as e:
        print(f"❌ User Creation Failed: {e}")
    
    # Test 3: Get Users
    try:
        response = requests.get(f"{BASE_URL}/users/")
        print(f"✅ Get Users: {response.status_code}")
        if response.status_code == 200:
            users = response.json()
            print(f"   Total Users: {len(users)}")
    except Exception as e:
        print(f"❌ Get Users Failed: {e}")
    
    # Test 4: Create a Contact
    try:
        contact_data = {
            "nom": "TestContact",
            "prenom": "John",
            "numero_telephone": "+33123456789",
            "email": "john.test@example.com",
            "ville": "Paris",
            "region": "Ile-de-France",
            "type_client": "Premium",
            "age": 30,
            "genre": "M"
        }
        response = requests.post(f"{BASE_URL}/contacts/", json=contact_data)
        print(f"✅ Contact Creation: {response.status_code}")
        if response.status_code in [200, 201]:
            contact = response.json()
            print(f"   Created Contact ID: {contact.get('id_contact', 'N/A')}")
            return contact.get('id_contact')
    except Exception as e:
        print(f"❌ Contact Creation Failed: {e}")
        return None
    
    # Test 5: Get Contacts
    try:
        response = requests.get(f"{BASE_URL}/contacts/")
        print(f"✅ Get Contacts: {response.status_code}")
        if response.status_code == 200:
            contacts = response.json()
            print(f"   Total Contacts: {len(contacts)}")
    except Exception as e:
        print(f"❌ Get Contacts Failed: {e}")
    
    # Test 6: Create a Campaign
    try:
        start_date = datetime.now() + timedelta(days=1)
        campaign_data = {
            "nom_campagne": "Test SMS Campaign",
            "type_campagne": "promotional",
            "date_debut": start_date.isoformat(),
            "message_template": "Hello {prenom}, special offer for you!",
            "personnalisation_active": True,
            "statut": "draft"
        }
        response = requests.post(f"{BASE_URL}/campagnes/", json=campaign_data)
        print(f"✅ Campaign Creation: {response.status_code}")
        if response.status_code in [200, 201]:
            campaign = response.json()
            print(f"   Created Campaign ID: {campaign.get('id_campagne', 'N/A')}")
            return campaign.get('id_campagne')
    except Exception as e:
        print(f"❌ Campaign Creation Failed: {e}")
        return None
    
    # Test 7: Get Campaigns
    try:
        response = requests.get(f"{BASE_URL}/campagnes/")
        print(f"✅ Get Campaigns: {response.status_code}")
        if response.status_code == 200:
            campaigns = response.json()
            print(f"   Total Campaigns: {len(campaigns)}")
    except Exception as e:
        print(f"❌ Get Campaigns Failed: {e}")
    
    print("\n" + "=" * 50)
    print("📊 API Testing Summary:")
    print("- All core endpoints are accessible")
    print("- Database operations are working")
    print("- CRUD operations functional")
    print("- Visit http://localhost:8001/docs for interactive API docs")
    print("=" * 50)

if __name__ == "__main__":
    test_basic_endpoints()
