import requests
import json

# Simple test of key endpoints
BASE_URL = "http://localhost:8001"

print("🔄 Testing SMS Campaign Platform API")
print("=" * 50)

def test_endpoint(method, endpoint, data=None, description=""):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method.upper() == "GET":
            response = requests.get(url, timeout=10)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        status = "✅" if response.status_code == 200 else "❌"
        print(f"{status} {method} {endpoint} - {description}")
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, dict):
                if 'message' in result:
                    print(f"   → {result['message']}")
                elif 'version' in result:
                    print(f"   → Version: {result['version']}")
            elif isinstance(result, list):
                print(f"   → Returned {len(result)} items")
        else:
            print(f"   → Status: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ {method} {endpoint} - Connection refused (server not running)")
        return False
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False
    
    return response.status_code == 200

# Test core endpoints
print("\n📍 Health Check:")
test_endpoint("GET", "/", description="Root endpoint")
test_endpoint("GET", "/test", description="Health test")

print("\n📍 Contacts:")
test_endpoint("GET", "/contacts/", description="Get all contacts")

# Create a test contact
contact_data = {
    "nom": "Test",
    "prenom": "User", 
    "numero_telephone": "+33999999999",
    "ville": "TestCity",
    "type_client": "VIP"
}
test_endpoint("POST", "/contacts/", contact_data, "Create test contact")

print("\n📍 Campaigns:")
test_endpoint("GET", "/campaigns/", description="Get all campaigns")

print("\n📍 Templates:")
test_endpoint("GET", "/templates/", description="Get all templates")
test_endpoint("GET", "/templates/personalization-help", description="Get personalization help")

print("\n📍 Dashboard:")
test_endpoint("GET", "/dashboard", description="Get dashboard stats")

print("\n📍 Import Template:")
try:
    response = requests.get(f"{BASE_URL}/contacts/import/template", timeout=10)
    if response.status_code == 200:
        file_size = len(response.content)
        print(f"✅ GET /contacts/import/template - Import template download")
        print(f"   → Downloaded {file_size} bytes")
    else:
        print(f"❌ GET /contacts/import/template - Status: {response.status_code}")
except Exception as e:
    print(f"❌ GET /contacts/import/template - Error: {str(e)}")

print("\n" + "=" * 50)
print("✅ API Testing Complete!")
print("🔗 Full API Documentation: http://localhost:8001/docs")
