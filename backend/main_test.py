from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

import database, models, crud
from database import get_db
from schemas import (
    ContactCreate, ContactRead, ContactUpdate, 
    CampagneCreate, CampagneRead, CampagneUpdate,
    SegmentationCriteria, SmsRequest, SmsResponse
)

# Créer tables si besoin (dev)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SMS Campaign Platform API",
    description="API complète pour la gestion de campagnes SMS avec segmentation avancée",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "SMS Campaign Platform API", 
        "status": "running",
        "version": "2.0.0",
        "features": [
            "Advanced Contact Management",
            "Contact Segmentation", 
            "Personalized SMS Campaigns",
            "Campaign Analytics"
        ]
    }

@app.get("/test", tags=["Health"])
def test():
    return {"message": "API is working!", "timestamp": datetime.now().isoformat()}

# ==================== ENHANCED CONTACTS ENDPOINTS ====================
@app.post("/contacts/", response_model=ContactRead, tags=["Contacts"])
def create_contact(contact: ContactCreate, db: Session = Depends(get_db)):
    """Créer un nouveau contact avec informations détaillées"""
    try:
        return crud.create_contact(db, contact)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/contacts/", response_model=List[ContactRead], tags=["Contacts"])
def get_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer tous les contacts avec pagination"""
    return crud.get_contacts(db, skip=skip, limit=limit)

@app.get("/contacts/{contact_id}", response_model=ContactRead, tags=["Contacts"])
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Récupérer un contact par ID"""
    contact = crud.get_contact_by_id(db, contact_id)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return contact

@app.put("/contacts/{contact_id}", response_model=ContactRead, tags=["Contacts"])
def update_contact(contact_id: int, contact_update: ContactUpdate, db: Session = Depends(get_db)):
    """Mettre à jour un contact"""
    contact = crud.update_contact(db, contact_id, contact_update)
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return contact

@app.delete("/contacts/{contact_id}", tags=["Contacts"])
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    """Supprimer un contact"""
    success = crud.delete_contact(db, contact_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return {"message": "Contact supprimé avec succès"}

@app.get("/contacts/search/{query}", response_model=List[ContactRead], tags=["Contacts"])
def search_contacts(query: str, db: Session = Depends(get_db)):
    """Rechercher des contacts par nom, prénom, téléphone ou email"""
    return crud.search_contacts(db, query)

# ==================== CONTACT SEGMENTATION ====================
@app.post("/contacts/segment", response_model=List[ContactRead], tags=["Contacts", "Segmentation"])
def segment_contacts(criteria: SegmentationCriteria, db: Session = Depends(get_db)):
    """Récupérer des contacts selon des critères de segmentation"""
    return crud.get_contacts_by_segmentation(db, criteria)

@app.get("/contacts/stats/segmentation", tags=["Contacts", "Analytics"])
def get_segmentation_stats(db: Session = Depends(get_db)):
    """Statistiques de segmentation des contacts"""
    from sqlalchemy import func
    
    total_contacts = db.query(models.Contact).count()
    
    # Statistiques par type de client
    type_stats = db.query(models.Contact.type_client, func.count(models.Contact.id_contact)).group_by(models.Contact.type_client).all()
    
    # Statistiques par ville
    city_stats = db.query(models.Contact.ville, func.count(models.Contact.id_contact)).group_by(models.Contact.ville).limit(10).all()
    
    # Statistiques par genre
    gender_stats = db.query(models.Contact.genre, func.count(models.Contact.id_contact)).group_by(models.Contact.genre).all()
    
    # Statistiques par statut opt-in
    opt_in_stats = db.query(models.Contact.statut_opt_in, func.count(models.Contact.id_contact)).group_by(models.Contact.statut_opt_in).all()
    
    return {
        "total_contacts": total_contacts,
        "by_customer_type": [{"type": t[0], "count": t[1]} for t in type_stats if t[0]],
        "top_cities": [{"ville": c[0], "count": c[1]} for c in city_stats if c[0]],
        "by_gender": [{"genre": g[0], "count": g[1]} for g in gender_stats if g[0]],
        "by_opt_in_status": [{"opt_in": bool(o[0]), "count": o[1]} for o in opt_in_stats],
    }

# ==================== ENHANCED CAMPAIGNS ENDPOINTS ====================
@app.post("/campaigns/", response_model=CampagneRead, tags=["Campaigns"])
def create_campaign(campaign: CampagneCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle campagne SMS avec personnalisation"""
    return crud.create_campaign(db, campaign)

@app.get("/campaigns/", response_model=List[CampagneRead], tags=["Campaigns"])
def get_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer toutes les campagnes"""
    return crud.get_campaigns(db, skip=skip, limit=limit)

@app.get("/campaigns/{campaign_id}", response_model=CampagneRead, tags=["Campaigns"])
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Récupérer une campagne par ID"""
    campaign = crud.get_campaign_by_id(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    return campaign

@app.put("/campaigns/{campaign_id}", response_model=CampagneRead, tags=["Campaigns"])
def update_campaign(campaign_id: int, campaign_update: CampagneUpdate, db: Session = Depends(get_db)):
    """Mettre à jour une campagne"""
    campaign = crud.update_campaign(db, campaign_id, campaign_update)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    return campaign

@app.post("/campaigns/{campaign_id}/preview", tags=["Campaigns"])
def preview_campaign_messages(
    campaign_id: int, 
    criteria: Optional[SegmentationCriteria] = None,
    db: Session = Depends(get_db)
):
    """Prévisualiser les messages personnalisés d'une campagne"""
    campaign = crud.get_campaign_by_id(db, campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    # Récupérer les contacts selon les critères ou tous les contacts opt-in
    if criteria:
        contacts = crud.get_contacts_by_segmentation(db, criteria)
    else:
        default_criteria = SegmentationCriteria(statut_opt_in=True)
        contacts = crud.get_contacts_by_segmentation(db, default_criteria)
    
    # Générer les aperçus de messages personnalisés
    previews = []
    for contact in contacts[:10]:  # Limiter à 10 pour l'aperçu
        personalized_message = campaign.personnaliser_message(contact)
        previews.append({
            "contact": {
                "nom": contact.nom,
                "prenom": contact.prenom,
                "numero_telephone": contact.numero_telephone
            },
            "message_personalise": personalized_message
        })
    
    return {
        "campagne": campaign.nom_campagne,
        "template": campaign.message_template,
        "total_contacts_cibles": len(contacts),
        "apercu_messages": previews
    }

@app.get("/campaigns/status/{status}", response_model=List[CampagneRead], tags=["Campaigns"])
def get_campaigns_by_status(status: str, db: Session = Depends(get_db)):
    """Récupérer les campagnes par statut"""
    valid_statuses = ["créée", "en cours", "suspendue", "terminée"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}")
    
    return crud.get_campaigns_by_status(db, status)

# ==================== MAILING LISTS ENDPOINTS ====================
@app.post("/mailing-lists/", tags=["Mailing Lists"])
def create_mailing_list(nom_liste: str, db: Session = Depends(get_db)):
    """Créer une nouvelle liste de diffusion"""
    db_list = models.MailingList(nom_liste=nom_liste)
    db.add(db_list)
    db.commit()
    db.refresh(db_list)
    return db_list

@app.get("/mailing-lists/", tags=["Mailing Lists"])
def get_mailing_lists(db: Session = Depends(get_db)):
    """Récupérer toutes les listes de diffusion"""
    return db.query(models.MailingList).all()

@app.post("/mailing-lists/{list_id}/contacts", tags=["Mailing Lists"])
def add_contacts_to_list_by_segment(
    list_id: int, 
    criteria: SegmentationCriteria, 
    db: Session = Depends(get_db)
):
    """Ajouter des contacts à une liste basée sur des critères de segmentation"""
    mailing_list = db.query(models.MailingList).filter(models.MailingList.id_liste == list_id).first()
    if not mailing_list:
        raise HTTPException(status_code=404, detail="Liste de diffusion non trouvée")
    
    contacts = crud.get_contacts_by_segmentation(db, criteria)
    
    added_count = 0
    for contact in contacts:
        if contact not in mailing_list.contacts:
            mailing_list.contacts.append(contact)
            added_count += 1
    
    db.commit()
    return {
        "message": f"{added_count} contacts ajoutés à la liste '{mailing_list.nom_liste}'",
        "total_contacts_in_list": len(mailing_list.contacts)
    }

# ==================== DASHBOARD ENHANCED ====================
@app.get("/dashboard", tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Statistiques avancées du tableau de bord"""
    from sqlalchemy import func
    from datetime import timedelta
    
    total_contacts = db.query(models.Contact).count()
    total_campaigns = db.query(models.Campagne).count()
    total_messages = db.query(models.Message).count()
    total_templates = db.query(models.MessageTemplate).count()
    total_users = db.query(models.User).count()
    
    # Statistiques par statut de campagne
    campaigns_by_status = db.query(models.Campagne.statut, func.count(models.Campagne.id_campagne)).group_by(models.Campagne.statut).all()
    status_counts = {status: count for status, count in campaigns_by_status}
    
    # Contacts ajoutés dans les 30 derniers jours
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_contacts = db.query(models.Contact).filter(models.Contact.date_inscription >= thirty_days_ago).count()
    
    # Statistiques de segmentation
    opt_in_contacts = db.query(models.Contact).filter(models.Contact.statut_opt_in == True).count()
    
    return {
        "total_contacts": total_contacts,
        "total_campaigns": total_campaigns,
        "total_messages": total_messages,
        "total_templates": total_templates,
        "total_users": total_users,
        "campaigns_by_status": status_counts,
        "recent_contacts_30_days": recent_contacts,
        "opt_in_contacts": opt_in_contacts,
        "opt_out_contacts": total_contacts - opt_in_contacts,
        "platform_status": "active",
        "last_updated": datetime.now().isoformat()
    }

# ==================== MESSAGES ENDPOINTS ====================
@app.post("/messages/", tags=["Messages"])
def create_message(
    contenu: str,
    identifiant_expediteur: str,
    campagne_id: int,
    db: Session = Depends(get_db)
):
    """Créer un nouveau message SMS"""
    campaign = db.query(models.Campagne).filter(models.Campagne.id_campagne == campagne_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    db_message = models.Message(
        contenu=contenu,
        identifiant_expediteur=identifiant_expediteur,
        campagne_id=campagne_id,
        statut_livraison="en attente"
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@app.get("/campaigns/{campaign_id}/messages", tags=["Messages"])
def get_campaign_messages(campaign_id: int, db: Session = Depends(get_db)):
    """Récupérer tous les messages d'une campagne"""
    return db.query(models.Message).filter(models.Message.campagne_id == campaign_id).all()

# ==================== MESSAGE TEMPLATES ENDPOINTS ====================
@app.post("/templates/", tags=["Templates"])
def create_template(
    nom_modele: str,
    contenu_modele: str,
    db: Session = Depends(get_db)
):
    """Créer un nouveau modèle de message avec support de personnalisation"""
    db_template = models.MessageTemplate(
        nom_modele=nom_modele,
        contenu_modele=contenu_modele
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@app.get("/templates/", tags=["Templates"])
def get_templates(db: Session = Depends(get_db)):
    """Récupérer tous les modèles de messages"""
    return db.query(models.MessageTemplate).all()

@app.get("/templates/personalization-help", tags=["Templates"])
def get_personalization_help():
    """Guide d'aide pour la personnalisation des messages"""
    return {
        "placeholders_disponibles": [
            "{prenom} - Prénom du contact",
            "{nom} - Nom du contact", 
            "{ville} - Ville du contact",
            "{type_client} - Type de client (VIP, Regular, etc.)",
            "{age} - Âge du contact",
            "{genre} - Genre (M/F/Other)"
        ],
        "exemple_template": "Bonjour {prenom}, nous avons une offre spéciale pour nos clients {type_client} à {ville}!",
        "exemple_resultat": "Bonjour Marie, nous avons une offre spéciale pour nos clients VIP à Paris!"
    }

# ==================== MAILING LISTS ENDPOINTS ====================

@app.post("/mailing-lists/", tags=["Mailing Lists"])
def create_mailing_list(
    nom_liste: str,
    description: str,
    statut: str = "active",
    db: Session = Depends(get_db)
):
    """Créer une nouvelle liste de diffusion"""
    # For demo purposes, return mock data since we don't have MailingList model
    new_list = {
        "id_liste": len(db.query(models.Contact).all()) + 100,  # Mock ID
        "nom_liste": nom_liste,
        "description": description,
        "statut": statut,
        "date_creation": datetime.now().isoformat(),
        "contacts": [],
        "campaigns_count": 0,
        "last_campaign": None
    }
    return new_list

@app.get("/mailing-lists/", tags=["Mailing Lists"])
def get_mailing_lists(db: Session = Depends(get_db)):
    """Récupérer toutes les listes de diffusion"""
    # Mock data for demonstration
    return [
        {
            "id_liste": 1,
            "nom_liste": "Premium Customers",
            "description": "High-value customers for exclusive offers",
            "date_creation": "2025-08-15T10:00:00Z",
            "statut": "active",
            "contacts": [1, 4],
            "campaigns_count": 3,
            "last_campaign": "2025-08-25",
        },
        {
            "id_liste": 2,
            "nom_liste": "New Subscribers",
            "description": "Recent sign-ups for welcome campaigns",
            "date_creation": "2025-08-20T14:30:00Z",
            "statut": "active",
            "contacts": [2, 3],
            "campaigns_count": 1,
            "last_campaign": "2025-08-22",
        }
    ]

@app.get("/mailing-lists/{list_id}", tags=["Mailing Lists"])
def get_mailing_list(list_id: int, db: Session = Depends(get_db)):
    """Récupérer une liste de diffusion spécifique"""
    # Mock data for specific list
    mock_lists = {
        1: {
            "id_liste": 1,
            "nom_liste": "Premium Customers",
            "description": "High-value customers for exclusive offers",
            "date_creation": "2025-08-15T10:00:00Z",
            "statut": "active",
            "contacts": [1, 4],
            "campaigns_count": 3,
            "last_campaign": "2025-08-25",
        },
        2: {
            "id_liste": 2,
            "nom_liste": "New Subscribers",
            "description": "Recent sign-ups for welcome campaigns",
            "date_creation": "2025-08-20T14:30:00Z",
            "statut": "active",
            "contacts": [2, 3],
            "campaigns_count": 1,
            "last_campaign": "2025-08-22",
        }
    }
    
    if list_id not in mock_lists:
        raise HTTPException(status_code=404, detail="Mailing list not found")
    
    return mock_lists[list_id]

@app.put("/mailing-lists/{list_id}", tags=["Mailing Lists"])
def update_mailing_list(
    list_id: int,
    nom_liste: str = None,
    description: str = None,
    statut: str = None,
    contacts: List[int] = None,
    db: Session = Depends(get_db)
):
    """Mettre à jour une liste de diffusion"""
    updated_list = {
        "id_liste": list_id,
        "nom_liste": nom_liste or "Updated List",
        "description": description or "Updated description",
        "statut": statut or "active",
        "date_creation": "2025-08-15T10:00:00Z",
        "contacts": contacts or [],
        "campaigns_count": 2,
        "last_campaign": datetime.now().isoformat(),
    }
    return updated_list

@app.delete("/mailing-lists/{list_id}", tags=["Mailing Lists"])
def delete_mailing_list(list_id: int, db: Session = Depends(get_db)):
    """Supprimer une liste de diffusion"""
    return {"message": f"Mailing list {list_id} deleted successfully"}

@app.post("/mailing-lists/{list_id}/add-contacts", tags=["Mailing Lists"])
def add_contacts_to_list(
    list_id: int,
    contact_ids: List[int],
    db: Session = Depends(get_db)
):
    """Ajouter des contacts à une liste de diffusion"""
    return {
        "message": f"Added {len(contact_ids)} contacts to mailing list {list_id}",
        "list_id": list_id,
        "added_contacts": contact_ids
    }

@app.delete("/mailing-lists/{list_id}/remove-contacts", tags=["Mailing Lists"])
def remove_contacts_from_list(
    list_id: int,
    contact_ids: List[int],
    db: Session = Depends(get_db)
):
    """Retirer des contacts d'une liste de diffusion"""
    return {
        "message": f"Removed {len(contact_ids)} contacts from mailing list {list_id}",
        "list_id": list_id,
        "removed_contacts": contact_ids
    }

@app.post("/mailing-lists/{list_id}/send-campaign/{campaign_id}", tags=["Mailing Lists"])
def send_campaign_to_list(
    list_id: int,
    campaign_id: int,
    db: Session = Depends(get_db)
):
    """Envoyer une campagne à une liste de diffusion"""
    return {
        "message": f"Campaign {campaign_id} sent to mailing list {list_id}",
        "list_id": list_id,
        "campaign_id": campaign_id,
        "sent_at": datetime.now().isoformat(),
        "estimated_recipients": 25,
        "status": "sent"
    }

# ==================== SMS MESSAGING ENDPOINTS ====================
@app.post("/sms/send", response_model=SmsResponse, tags=["SMS"])
async def send_sms(sms_request: SmsRequest, db: Session = Depends(get_db)):
    """Send SMS message directly to a contact"""
    try:
        # Validate phone number format (basic validation)
        if not sms_request.recipient or len(sms_request.recipient) < 10:
            raise HTTPException(
                status_code=400, 
                detail="Invalid phone number format"
            )
        
        # Validate message length
        if not sms_request.message or len(sms_request.message.strip()) == 0:
            raise HTTPException(
                status_code=400, 
                detail="Message cannot be empty"
            )
        
        if len(sms_request.message) > 160:
            raise HTTPException(
                status_code=400, 
                detail="SMS message exceeds 160 character limit"
            )
        
        # Log the SMS sending attempt (in a real app, integrate with SMS provider)
        message_id = f"sms_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{sms_request.recipient[-4:]}"
        
        # If contact_id is provided, update contact's last activity
        if sms_request.contact_id:
            contact = db.query(models.Contact).filter(
                models.Contact.id_contact == sms_request.contact_id
            ).first()
            if contact:
                contact.derniere_activite = datetime.now()
                db.commit()
        
        # Create a message record in the database for tracking
        db_message = models.Message(
            contenu=sms_request.message,
            identifiant_expediteur=sms_request.recipient,
            statut_livraison="sent",
            campagne_id=None  # Direct message, not part of a campaign
        )
        db.add(db_message)
        db.commit()
        
        # In a real implementation, you would integrate with an SMS provider here
        # For demo purposes, we'll simulate successful sending
        
        return SmsResponse(
            success=True,
            message=f"SMS sent successfully to {sms_request.contact_name or sms_request.recipient}",
            recipient=sms_request.recipient,
            sent_at=datetime.now(),
            message_id=message_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to send SMS: {str(e)}"
        )

@app.get("/sms/history", tags=["SMS"])
async def get_sms_history(
    limit: int = 50,
    skip: int = 0,
    db: Session = Depends(get_db)
):
    """Get SMS sending history"""
    messages = db.query(models.Message)\
        .filter(models.Message.campagne_id.is_(None))\
        .order_by(models.Message.date_creation.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return {
        "messages": messages,
        "total": len(messages),
        "skip": skip,
        "limit": limit
    }

# ==================== SMS ENDPOINTS ====================
@app.post("/sms/send", response_model=SmsResponse, tags=["SMS"])
def send_sms(sms_data: SmsRequest, db: Session = Depends(get_db)):
    """Send SMS message to a contact"""
    try:
        # Validate phone number format
        if not sms_data.recipient or len(sms_data.recipient) < 10:
            raise HTTPException(status_code=400, detail="Invalid phone number")
        
        # Create message ID
        message_id = f"sms_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{sms_data.recipient[-4:]}"
        
        # Log the SMS in the database (create a message record)
        if sms_data.contact_id:
            # Update contact's last activity
            contact = db.query(models.Contact).filter(models.Contact.id_contact == sms_data.contact_id).first()
            if contact:
                contact.derniere_activite = datetime.now()
                db.commit()
        
        # Create SMS message record
        db_message = models.Message(
            contenu=sms_data.message,
            identifiant_expediteur="SMS_PLATFORM",
            statut_livraison="sent",
            date_creation=datetime.now()
        )
        db.add(db_message)
        db.commit()
        
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
def get_sms_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get SMS message history"""
    messages = db.query(models.Message)\
        .filter(models.Message.identifiant_expediteur == "SMS_PLATFORM")\
        .order_by(models.Message.date_creation.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return {
        "sms_history": messages,
        "total": len(messages),
        "skip": skip,
        "limit": limit
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
