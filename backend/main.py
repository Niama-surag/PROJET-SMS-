
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

import database, models, crud
from auth import router as auth_router, role_required, get_current_user
from schemas import UserRead
from database import get_db

# Créer tables si besoin (dev)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SMS Campaign Platform API",
    description="API complète pour la gestion de campagnes SMS",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )

app.include_router(auth_router)

@app.get("/", tags=["Health"])
def root():
    return {
        "message": "SMS Campaign Platform API", 
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/test", tags=["Health"])
def test():
    return {"message": "API is working!", "timestamp": datetime.now().isoformat()}

# ==================== CONTACTS ENDPOINTS ====================
@app.post("/contacts/", tags=["Contacts"])
def create_contact(
    nom: str, 
    prenom: str, 
    numero_telephone: str,
    statut_opt_in: bool = True,
    db: Session = Depends(get_db)
):
    """Créer un nouveau contact"""
    db_contact = models.Contact(
        nom=nom,
        prenom=prenom,
        numero_telephone=numero_telephone,
        statut_opt_in=statut_opt_in
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

@app.get("/contacts/", tags=["Contacts"])
def get_contacts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer tous les contacts"""
    contacts = db.query(models.Contact).offset(skip).limit(limit).all()
    return contacts

@app.get("/contacts/{contact_id}", tags=["Contacts"])
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    """Récupérer un contact par ID"""
    contact = db.query(models.Contact).filter(models.Contact.id_contact == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    return contact

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

@app.post("/mailing-lists/{list_id}/contacts/{contact_id}", tags=["Mailing Lists"])
def add_contact_to_list(list_id: int, contact_id: int, db: Session = Depends(get_db)):
    """Ajouter un contact à une liste de diffusion"""
    mailing_list = db.query(models.MailingList).filter(models.MailingList.id_liste == list_id).first()
    contact = db.query(models.Contact).filter(models.Contact.id_contact == contact_id).first()
    
    if not mailing_list:
        raise HTTPException(status_code=404, detail="Liste de diffusion non trouvée")
    if not contact:
        raise HTTPException(status_code=404, detail="Contact non trouvé")
    
    if contact not in mailing_list.contacts:
        mailing_list.contacts.append(contact)
        db.commit()
    
    return {"message": "Contact ajouté à la liste avec succès"}

# ==================== CAMPAIGNS ENDPOINTS ====================
@app.post("/campaigns/", tags=["Campaigns"])
def create_campaign(
    nom_campagne: str,
    date_debut: datetime,
    date_fin: datetime,
    db: Session = Depends(get_db)
):
    """Créer une nouvelle campagne SMS"""
    db_campaign = models.Campagne(
        nom_campagne=nom_campagne,
        date_debut=date_debut,
        date_fin=date_fin,
        statut="créée"
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

@app.get("/campaigns/", tags=["Campaigns"])
def get_campaigns(db: Session = Depends(get_db)):
    """Récupérer toutes les campagnes"""
    return db.query(models.Campagne).all()

@app.get("/campaigns/{campaign_id}", tags=["Campaigns"])
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    """Récupérer une campagne par ID"""
    campaign = db.query(models.Campagne).filter(models.Campagne.id_campagne == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    return campaign

@app.put("/campaigns/{campaign_id}/status", tags=["Campaigns"])
def update_campaign_status(
    campaign_id: int, 
    status: str, 
    db: Session = Depends(get_db)
):
    """Mettre à jour le statut d'une campagne (créée, en cours, suspendue, terminée)"""
    campaign = db.query(models.Campagne).filter(models.Campagne.id_campagne == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campagne non trouvée")
    
    valid_statuses = ["créée", "en cours", "suspendue", "terminée"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs acceptées: {valid_statuses}")
    
    campaign.statut = status
    db.commit()
    return campaign

# ==================== MESSAGES ENDPOINTS ====================
@app.post("/messages/", tags=["Messages"])
def create_message(
    contenu: str,
    identifiant_expediteur: str,
    campagne_id: int,
    db: Session = Depends(get_db)
):
    """Créer un nouveau message SMS"""
    # Vérifier que la campagne existe
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
    """Créer un nouveau modèle de message"""
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

# ==================== ADMIN ROUTES ====================
@app.get("/admin-only", dependencies=[Depends(role_required("Admin"))], tags=["Admin"])
def admin_only():
    return {"ok": True, "area": "admin", "message": "Accès administrateur autorisé"}

@app.get("/supervise", dependencies=[Depends(role_required("Admin", "Superviseur"))], tags=["Admin"])
def supervise_zone():
    return {"ok": True, "area": "supervise", "message": "Accès supervision autorisé"}

@app.get("/dashboard", tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Statistiques du tableau de bord"""
    total_contacts = db.query(models.Contact).count()
    total_campaigns = db.query(models.Campagne).count()
    total_messages = db.query(models.Message).count()
    total_templates = db.query(models.MessageTemplate).count()
    
    return {
        "total_contacts": total_contacts,
        "total_campaigns": total_campaigns,
        "total_messages": total_messages,
        "total_templates": total_templates,
        "platform_status": "active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
