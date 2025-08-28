import requests
import json
import time
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8001"
headers = {"Content-Type": "application/json"}

def print_test_result(test_name, success, response_data=None, error=None):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if error:
        print(f"   Error: {error}")
    if response_data and isinstance(response_data, dict):
        if 'message' in response_data:
            print(f"   Message: {response_data['message']}")
    print()

def test_health_endpoints():
    """Test health check endpoints"""
    print("🔄 Testing Health Endpoints...")
    
    # Test root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        success = response.status_code == 200
        print_test_result("Root endpoint (/)", success, response.json())
    except Exception as e:
        print_test_result("Root endpoint (/)", False, error=str(e))
    
    # Test health check
    try:
        response = requests.get(f"{BASE_URL}/test")
        success = response.status_code == 200
        print_test_result("Health check (/test)", success, response.json())
    except Exception as e:
        print_test_result("Health check (/test)", False, error=str(e))

def test_contact_operations():
    """Test contact CRUD operations"""
    print("🔄 Testing Contact Operations...")
    
    # Test contact creation
    contact_data = {
        "nom": "Dupont",
        "prenom": "Jean",
        "numero_telephone": "+33123456789",
        "email": "jean.dupont@test.com",
        "ville": "Paris",
        "region": "Ile-de-France",
        "code_postal": "75001",
        "type_client": "VIP",
        "age": 35,
        "genre": "M",
        "statut_opt_in": True
    }
    
    contact_id = None
    try:
        response = requests.post(f"{BASE_URL}/contacts/", json=contact_data, headers=headers)
        success = response.status_code == 200
        if success:
            contact_id = response.json().get("id_contact")
        print_test_result("Create contact", success, response.json())
    except Exception as e:
        print_test_result("Create contact", False, error=str(e))
    
    # Test get all contacts
    try:
        response = requests.get(f"{BASE_URL}/contacts/")
        success = response.status_code == 200
        print_test_result("Get all contacts", success, {"count": len(response.json()) if success else 0})
    except Exception as e:
        print_test_result("Get all contacts", False, error=str(e))
    
    # Test get specific contact
    if contact_id:
        try:
            response = requests.get(f"{BASE_URL}/contacts/{contact_id}")
            success = response.status_code == 200
            print_test_result(f"Get contact by ID ({contact_id})", success)
        except Exception as e:
            print_test_result("Get contact by ID", False, error=str(e))
        
        # Test update contact
        update_data = {
            "ville": "Lyon",
            "type_client": "Regular"
        }
        try:
            response = requests.put(f"{BASE_URL}/contacts/{contact_id}", json=update_data, headers=headers)
            success = response.status_code == 200
            print_test_result("Update contact", success)
        except Exception as e:
            print_test_result("Update contact", False, error=str(e))
    
    # Test search contacts
    try:
        response = requests.get(f"{BASE_URL}/contacts/search/Jean")
        success = response.status_code == 200
        results_count = len(response.json()) if success else 0
        print_test_result("Search contacts", success, {"results_found": results_count})
    except Exception as e:
        print_test_result("Search contacts", False, error=str(e))
    
    return contact_id

def test_segmentation():
    """Test contact segmentation"""
    print("🔄 Testing Contact Segmentation...")
    
    # Test segmentation
    segmentation_criteria = {
        "type_client": ["VIP", "Regular"],
        "ville": ["Paris", "Lyon"],
        "age_min": 25,
        "age_max": 50,
        "statut_opt_in": True
    }
    
    try:
        response = requests.post(f"{BASE_URL}/contacts/segment", json=segmentation_criteria, headers=headers)
        success = response.status_code == 200
        results_count = len(response.json()) if success else 0
        print_test_result("Contact segmentation", success, {"matches": results_count})
    except Exception as e:
        print_test_result("Contact segmentation", False, error=str(e))
    
    # Test segmentation stats
    try:
        response = requests.get(f"{BASE_URL}/contacts/stats/segmentation")
        success = response.status_code == 200
        print_test_result("Segmentation statistics", success, response.json() if success else None)
    except Exception as e:
        print_test_result("Segmentation statistics", False, error=str(e))

def test_campaign_operations():
    """Test campaign operations"""
    print("🔄 Testing Campaign Operations...")
    
    # Create campaign
    future_date = datetime.now() + timedelta(days=1)
    end_date = future_date + timedelta(hours=2)
    
    campaign_data = {
        "nom_campagne": "Test Campaign VIP",
        "type_campagne": "promotional",
        "date_debut": future_date.isoformat(),
        "date_fin": end_date.isoformat(),
        "message_template": "Bonjour {prenom}, profitez de notre offre spéciale pour les clients {type_client}!",
        "personnalisation_active": True,
        "segment_cible": "VIP",
        "zone_geographique": "Paris"
    }
    
    campaign_id = None
    try:
        response = requests.post(f"{BASE_URL}/campaigns/", json=campaign_data, headers=headers)
        success = response.status_code == 200
        if success:
            campaign_id = response.json().get("id_campagne")
        print_test_result("Create campaign", success, response.json())
    except Exception as e:
        print_test_result("Create campaign", False, error=str(e))
    
    # Test get all campaigns
    try:
        response = requests.get(f"{BASE_URL}/campaigns/")
        success = response.status_code == 200
        print_test_result("Get all campaigns", success, {"count": len(response.json()) if success else 0})
    except Exception as e:
        print_test_result("Get all campaigns", False, error=str(e))
    
    # Test campaign preview
    if campaign_id:
        try:
            response = requests.post(f"{BASE_URL}/campaigns/{campaign_id}/preview", headers=headers)
            success = response.status_code == 200
            print_test_result("Campaign preview", success, response.json() if success else None)
        except Exception as e:
            print_test_result("Campaign preview", False, error=str(e))
        
        # Test update campaign
        update_data = {
            "statut": "en cours"
        }
        try:
            response = requests.put(f"{BASE_URL}/campaigns/{campaign_id}", json=update_data, headers=headers)
            success = response.status_code == 200
            print_test_result("Update campaign status", success)
        except Exception as e:
            print_test_result("Update campaign status", False, error=str(e))
    
    # Test get campaigns by status
    try:
        response = requests.get(f"{BASE_URL}/campaigns/status/créée")
        success = response.status_code == 200
        print_test_result("Get campaigns by status", success, {"count": len(response.json()) if success else 0})
    except Exception as e:
        print_test_result("Get campaigns by status", False, error=str(e))
    
    return campaign_id

def test_template_operations():
    """Test message template operations"""
    print("🔄 Testing Template Operations...")
    
    # Create template
    template_data = {
        "nom_modele": "Template VIP",
        "contenu_modele": "Cher {prenom} {nom}, en tant que client {type_client}, vous bénéficiez de privilèges exclusifs!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/templates/", json=template_data, headers=headers)
        success = response.status_code == 200
        print_test_result("Create template", success, response.json())
    except Exception as e:
        print_test_result("Create template", False, error=str(e))
    
    # Get all templates
    try:
        response = requests.get(f"{BASE_URL}/templates/")
        success = response.status_code == 200
        print_test_result("Get all templates", success, {"count": len(response.json()) if success else 0})
    except Exception as e:
        print_test_result("Get all templates", False, error=str(e))
    
    # Get personalization help
    try:
        response = requests.get(f"{BASE_URL}/templates/personalization-help")
        success = response.status_code == 200
        print_test_result("Get personalization help", success, response.json())
    except Exception as e:
        print_test_result("Get personalization help", False, error=str(e))

def test_mailing_list_operations():
    """Test mailing list operations"""
    print("🔄 Testing Mailing List Operations...")
    
    # Create mailing list
    try:
        response = requests.post(f"{BASE_URL}/mailing-lists/?nom_liste=VIP Customers List")
        success = response.status_code == 200
        list_id = response.json().get("id_liste") if success else None
        print_test_result("Create mailing list", success, response.json())
    except Exception as e:
        print_test_result("Create mailing list", False, error=str(e))
        list_id = None
    
    # Get all mailing lists
    try:
        response = requests.get(f"{BASE_URL}/mailing-lists/")
        success = response.status_code == 200
        print_test_result("Get all mailing lists", success, {"count": len(response.json()) if success else 0})
    except Exception as e:
        print_test_result("Get all mailing lists", False, error=str(e))
    
    # Add contacts to list by segment
    if list_id:
        segment_criteria = {
            "type_client": ["VIP"],
            "statut_opt_in": True
        }
        try:
            response = requests.post(f"{BASE_URL}/mailing-lists/{list_id}/contacts", json=segment_criteria, headers=headers)
            success = response.status_code == 200
            print_test_result("Add contacts to list by segment", success, response.json())
        except Exception as e:
            print_test_result("Add contacts to list by segment", False, error=str(e))

def test_dashboard():
    """Test dashboard statistics"""
    print("🔄 Testing Dashboard...")
    
    try:
        response = requests.get(f"{BASE_URL}/dashboard")
        success = response.status_code == 200
        print_test_result("Dashboard statistics", success, response.json())
    except Exception as e:
        print_test_result("Dashboard statistics", False, error=str(e))

def test_import_template():
    """Test import template download"""
    print("🔄 Testing Import Template...")
    
    try:
        response = requests.get(f"{BASE_URL}/contacts/import/template")
        success = response.status_code == 200 and response.headers.get('content-type', '').startswith('application/')
        file_size = len(response.content) if success else 0
        print_test_result("Download import template", success, {"file_size_bytes": file_size})
    except Exception as e:
        print_test_result("Download import template", False, error=str(e))

def create_sample_data():
    """Create sample data for testing"""
    print("🔄 Creating Sample Data...")
    
    # Create multiple contacts
    sample_contacts = [
        {
            "nom": "Martin", "prenom": "Marie", "numero_telephone": "+33123456790",
            "email": "marie.martin@test.com", "ville": "Lyon", "type_client": "Regular", "age": 28, "genre": "F"
        },
        {
            "nom": "Bernard", "prenom": "Pierre", "numero_telephone": "+33123456791",
            "email": "pierre.bernard@test.com", "ville": "Marseille", "type_client": "VIP", "age": 42, "genre": "M"
        },
        {
            "nom": "Durand", "prenom": "Sophie", "numero_telephone": "+33123456792",
            "email": "sophie.durand@test.com", "ville": "Paris", "type_client": "New", "age": 31, "genre": "F"
        }
    ]
    
    created_contacts = 0
    for contact in sample_contacts:
        try:
            response = requests.post(f"{BASE_URL}/contacts/", json=contact, headers=headers)
            if response.status_code == 200:
                created_contacts += 1
        except:
            pass
    
    print_test_result("Create sample contacts", True, {"created": created_contacts})

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Comprehensive API Test Suite")
    print("=" * 60)
    
    start_time = time.time()
    
    # Test API availability
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        if response.status_code != 200:
            print("❌ API not available. Make sure the server is running on http://localhost:8001")
            return
    except requests.exceptions.RequestException:
        print("❌ Cannot connect to API. Make sure the server is running on http://localhost:8001")
        return
    
    print("✅ API is available. Starting tests...\n")
    
    # Run all test suites
    test_health_endpoints()
    create_sample_data()
    contact_id = test_contact_operations()
    test_segmentation()
    campaign_id = test_campaign_operations()
    test_template_operations()
    test_mailing_list_operations()
    test_dashboard()
    test_import_template()
    
    # Cleanup - delete test contact
    if contact_id:
        try:
            requests.delete(f"{BASE_URL}/contacts/{contact_id}")
            print("🧹 Cleaned up test contact")
        except:
            pass
    
    end_time = time.time()
    duration = round(end_time - start_time, 2)
    
    print("=" * 60)
    print(f"✅ Test Suite Completed in {duration} seconds")
    print(f"🔗 API Documentation: {BASE_URL}/docs")
    print(f"🔗 API Health Check: {BASE_URL}/test")

if __name__ == "__main__":
    run_comprehensive_test()
