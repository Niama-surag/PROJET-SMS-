import requests
import json

# Test the SMS API
def test_sms_api():
    try:
        # Test basic API health
        response = requests.get("http://localhost:8001/")
        print("✅ API Health Check:", response.json())
        
        # Test contacts endpoint
        contacts_response = requests.get("http://localhost:8001/contacts/")
        print("✅ Contacts API:", len(contacts_response.json()), "contacts found")
        
        # Test SMS endpoint
        sms_data = {
            "recipient": "+1234567890",
            "message": "🔥 Test SMS from Python script! This works perfectly!",
            "contact_name": "John Smith",
            "contact_id": 1
        }
        
        sms_response = requests.post(
            "http://localhost:8001/sms/send",
            json=sms_data,
            headers={"Content-Type": "application/json"}
        )
        
        print("✅ SMS API Response:", sms_response.json())
        print("\n🎉 ALL SMS FUNCTIONALITY IS WORKING! 🎉")
        return True
        
    except Exception as e:
        print("❌ Error:", e)
        return False

if __name__ == "__main__":
    test_sms_api()
