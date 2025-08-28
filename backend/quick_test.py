import requests
import json
import time

print("🚀 SMS Campaign Platform - Manual API Test")
print("="*50)

# Quick test of core functionality
base_url = "http://localhost:8001"

# Test 1: Health Check
try:
    response = requests.get(f"{base_url}/")
    if response.status_code == 200:
        print("✅ Health Check - PASSED")
        data = response.json()
        print(f"   Version: {data.get('version')}")
        print(f"   Status: {data.get('status')}")
    else:
        print(f"❌ Health Check - FAILED ({response.status_code})")
except Exception as e:
    print(f"❌ Health Check - ERROR: {e}")
    exit()

# Test 2: Create Contact
print("\n📝 Testing Contact Creation...")
contact_data = {
    "nom": "TestUser",
    "prenom": "API",
    "numero_telephone": "+33987654321",
    "email": "apitest@example.com",
    "ville": "TestCity",
    "type_client": "VIP",
    "age": 30,
    "genre": "M",
    "statut_opt_in": True
}

try:
    response = requests.post(f"{base_url}/contacts/", json=contact_data)
    if response.status_code == 200:
        contact = response.json()
        contact_id = contact.get("id_contact")
        print(f"✅ Contact Created - ID: {contact_id}")
    else:
        print(f"❌ Contact Creation - FAILED ({response.status_code})")
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"❌ Contact Creation - ERROR: {e}")

# Test 3: Get Contacts
print("\n📋 Testing Get Contacts...")
try:
    response = requests.get(f"{base_url}/contacts/")
    if response.status_code == 200:
        contacts = response.json()
        print(f"✅ Get Contacts - Found {len(contacts)} contacts")
    else:
        print(f"❌ Get Contacts - FAILED ({response.status_code})")
except Exception as e:
    print(f"❌ Get Contacts - ERROR: {e}")

# Test 4: Dashboard
print("\n📊 Testing Dashboard...")
try:
    response = requests.get(f"{base_url}/dashboard")
    if response.status_code == 200:
        stats = response.json()
        print("✅ Dashboard - PASSED")
        print(f"   Total Contacts: {stats.get('total_contacts', 0)}")
        print(f"   Total Campaigns: {stats.get('total_campaigns', 0)}")
        print(f"   Opt-in Contacts: {stats.get('opt_in_contacts', 0)}")
    else:
        print(f"❌ Dashboard - FAILED ({response.status_code})")
except Exception as e:
    print(f"❌ Dashboard - ERROR: {e}")

# Test 5: Campaign Creation
print("\n🚀 Testing Campaign Creation...")
from datetime import datetime, timedelta

future_date = datetime.now() + timedelta(hours=1)
end_date = future_date + timedelta(hours=2)

campaign_data = {
    "nom_campagne": "API Test Campaign",
    "type_campagne": "promotional",
    "date_debut": future_date.isoformat(),
    "date_fin": end_date.isoformat(),
    "message_template": "Bonjour {prenom}, offre spéciale pour {type_client}!",
    "personnalisation_active": True,
    "segment_cible": "VIP"
}

try:
    response = requests.post(f"{base_url}/campaigns/", json=campaign_data)
    if response.status_code == 200:
        campaign = response.json()
        campaign_id = campaign.get("id_campagne")
        print(f"✅ Campaign Created - ID: {campaign_id}")
    else:
        print(f"❌ Campaign Creation - FAILED ({response.status_code})")
        print(f"   Error: {response.text}")
except Exception as e:
    print(f"❌ Campaign Creation - ERROR: {e}")

# Test 6: Segmentation
print("\n🎯 Testing Segmentation...")
segment_criteria = {
    "type_client": ["VIP"],
    "statut_opt_in": True
}

try:
    response = requests.post(f"{base_url}/contacts/segment", json=segment_criteria)
    if response.status_code == 200:
        segmented_contacts = response.json()
        print(f"✅ Segmentation - Found {len(segmented_contacts)} VIP contacts")
    else:
        print(f"❌ Segmentation - FAILED ({response.status_code})")
except Exception as e:
    print(f"❌ Segmentation - ERROR: {e}")

# Test 7: Template Help
print("\n📝 Testing Template Help...")
try:
    response = requests.get(f"{base_url}/templates/personalization-help")
    if response.status_code == 200:
        help_data = response.json()
        print("✅ Template Help - PASSED")
        placeholders = help_data.get("placeholders_disponibles", [])
        print(f"   Available placeholders: {len(placeholders)}")
    else:
        print(f"❌ Template Help - FAILED ({response.status_code})")
except Exception as e:
    print(f"❌ Template Help - ERROR: {e}")

print("\n" + "="*50)
print("🎉 API Testing Complete!")
print("🌐 Full API Documentation: http://localhost:8001/docs")
print("🔄 API Health: http://localhost:8001/test")
