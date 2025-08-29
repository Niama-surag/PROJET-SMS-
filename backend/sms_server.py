from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uvicorn

app = FastAPI(
    title="SMS Server API",
    description="Simple SMS API for testing SMS functionality",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SMS Request/Response models
class SmsRequest(BaseModel):
    recipient: str = Field(..., description="Phone number of the recipient")
    message: str = Field(..., max_length=160, description="SMS message content")
    contact_name: Optional[str] = Field(None, description="Name of the contact")
    contact_id: Optional[int] = Field(None, description="ID of the contact")

class SmsResponse(BaseModel):
    success: bool
    message: str
    recipient: str
    sent_at: datetime
    message_id: Optional[str] = None

# Sample contacts for testing
sample_contacts = [
    {
        "id_contact": 1,
        "nom": "Smith",
        "prenom": "John",
        "numero_telephone": "+1234567890",
        "email": "john.smith@example.com",
        "statut_opt_in": True,
        "ville": "New York",
        "type_client": "Premium",
        "date_inscription": "2025-08-27T03:02:51.179523"
    },
    {
        "id_contact": 2,
        "nom": "Johnson",
        "prenom": "Sarah",
        "numero_telephone": "+9876543210",
        "email": "sarah.johnson@example.com",
        "statut_opt_in": True,
        "ville": "Los Angeles",
        "type_client": "Standard",
        "date_inscription": "2025-08-27T03:03:02.140053"
    }
]

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "SMS Server API",
        "status": "running",
        "version": "1.0.0",
        "features": ["SMS Messaging", "Contact Management"]
    }

@app.get("/contacts/", tags=["Contacts"])
def get_contacts():
    """Get all contacts"""
    return sample_contacts

@app.post("/contacts/", tags=["Contacts"])
def create_contact(contact_data: dict):
    """Create a new contact"""
    new_id = max([c["id_contact"] for c in sample_contacts]) + 1 if sample_contacts else 1
    contact = {
        "id_contact": new_id,
        "date_inscription": datetime.now().isoformat(),
        **contact_data
    }
    sample_contacts.append(contact)
    return contact

@app.post("/sms/send", response_model=SmsResponse, tags=["SMS"])
def send_sms(sms_data: SmsRequest):
    """Send SMS message to a contact"""
    try:
        # Validate phone number format
        if not sms_data.recipient or len(sms_data.recipient) < 10:
            raise HTTPException(status_code=400, detail="Invalid phone number")
        
        # Create message ID
        message_id = f"sms_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{sms_data.recipient[-4:]}"
        
        print(f"🔥 SMS SENT: {sms_data.message} → {sms_data.recipient}")
        
        # Return success response
        return SmsResponse(
            success=True,
            message=f"SMS sent successfully to {sms_data.contact_name or 'contact'}",
            recipient=sms_data.recipient,
            sent_at=datetime.now(),
            message_id=message_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send SMS: {str(e)}")

@app.get("/sms/history", tags=["SMS"])
def get_sms_history():
    """Get SMS message history"""
    return {
        "sms_history": [],
        "total": 0,
        "message": "SMS history tracking active"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
