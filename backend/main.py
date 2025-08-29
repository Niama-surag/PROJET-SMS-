from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import io

import database, models, crud
import file_import
from auth import router as auth_router, role_required, get_current_user
from schemas import (
    UserRead, ContactCreate, ContactRead, ContactUpdate, 
    CampagneCreate, CampagneRead, CampagneUpdate,
    FileImportResult, SegmentationCriteria
)
from database import get_db

# Créer tables si besoin (dev)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SMS Campaign Platform API",
    description="API complète pour la gestion de campagnes SMS avec import de fichiers et segmentation avancée",
    version="2.0.0"
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
        "version": "2.0.0",
        "features": [
            "Advanced Contact Management",
            "Excel/CSV Import",
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
    total_contacts = db.query(models.Contact).count()
    
    # Statistiques par type de client
    type_stats = db.query(models.Contact.type_client, db.func.count(models.Contact.id_contact)).group_by(models.Contact.type_client).all()
    
    # Statistiques par ville
    city_stats = db.query(models.Contact.ville, db.func.count(models.Contact.id_contact)).group_by(models.Contact.ville).limit(10).all()
    
    # Statistiques par genre
    gender_stats = db.query(models.Contact.genre, db.func.count(models.Contact.id_contact)).group_by(models.Contact.genre).all()
    
    # Statistiques par statut opt-in
    opt_in_stats = db.query(models.Contact.statut_opt_in, db.func.count(models.Contact.id_contact)).group_by(models.Contact.statut_opt_in).all()
    
    return {
        "total_contacts": total_contacts,
        "by_customer_type": [{"type": t[0], "count": t[1]} for t in type_stats if t[0]],
        "top_cities": [{"ville": c[0], "count": c[1]} for c in city_stats if c[0]],
        "by_gender": [{"genre": g[0], "count": g[1]} for g in gender_stats if g[0]],
        "by_opt_in_status": [{"opt_in": bool(o[0]), "count": o[1]} for o in opt_in_stats],
    }

# ==================== FILE IMPORT ENDPOINTS ====================
@app.post("/contacts/import/csv", response_model=FileImportResult, tags=["Contacts", "Import"])
async def import_csv(
    file: UploadFile = File(...),
    delimiter: str = Form(","),
    db: Session = Depends(get_db)
):
    """Importer des contacts depuis un fichier CSV"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Le fichier doit être un CSV")
    
    try:
        content = await file.read()
        import_result = file_import.process_csv_file(content, delimiter)
        
        if import_result.imported_contacts:
            db_result = file_import.import_contacts_to_database(db, import_result.imported_contacts)
            import_result.successful_imports = db_result["success"]
            import_result.failed_imports = len(db_result["errors"])
            import_result.errors.extend(db_result["errors"])
            import_result.imported_contacts = [
                ContactRead.from_orm(contact) for contact in db_result["created_contacts"]
            ]
        
        return import_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import: {str(e)}")

@app.post("/contacts/import/excel", response_model=FileImportResult, tags=["Contacts", "Import"])
async def import_excel(
    file: UploadFile = File(...),
    sheet_name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Importer des contacts depuis un fichier Excel"""
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Le fichier doit être un Excel (.xlsx ou .xls)")
    
    try:
        content = await file.read()
        import_result = file_import.process_excel_file(content, sheet_name)
        
        if import_result.imported_contacts:
            db_result = file_import.import_contacts_to_database(db, import_result.imported_contacts)
            import_result.successful_imports = db_result["success"]
            import_result.failed_imports = len(db_result["errors"])
            import_result.errors.extend(db_result["errors"])
            import_result.imported_contacts = [
                ContactRead.from_orm(contact) for contact in db_result["created_contacts"]
            ]
        
        return import_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'import: {str(e)}")

@app.get("/contacts/import/template", tags=["Contacts", "Import"])
def download_import_template():
    """Télécharger un template Excel pour l'import de contacts"""
    template_content = file_import.generate_import_template()
    
    return StreamingResponse(
        io.BytesIO(template_content),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=template_import_contacts.xlsx"}
    )

@app.post("/contacts/import", response_model=FileImportResult, tags=["Contacts", "Import"])
async def import_contacts(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Importer des contacts depuis un fichier (CSV ou Excel) - endpoint unifié"""
    filename = file.filename.lower()
    
    if filename.endswith('.csv'):
        return await import_csv(file, ",", db)
    elif filename.endswith(('.xlsx', '.xls')):
        return await import_excel(file, None, db)
    else:
        raise HTTPException(status_code=400, detail="Type de fichier non supporté. Utilisez CSV ou Excel.")

# ==================== SMS SENDING ENDPOINTS ====================
@app.post("/sms/send", tags=["SMS"])
def send_sms(
    recipient: str,
    message: str,
    contact_name: Optional[str] = None,
    contact_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Envoyer un SMS à un destinataire"""
    try:
        # Validation basique du numéro
        if not recipient or len(recipient) < 10:
            raise HTTPException(status_code=400, detail="Numéro de téléphone invalide")
        
        # Créer l'entrée du message dans la base de données
        db_message = models.Message(
            contenu=message,
            identifiant_expediteur="SYSTEM",
            statut_livraison="envoyé",
            date_creation=datetime.now()
        )
        db.add(db_message)
        db.commit()
        
        # Simuler l'envoi SMS (en production, utiliser un vrai service SMS)
        return {
            "success": True,
            "message": f"SMS envoyé avec succès à {recipient}",
            "recipient": recipient,
            "message_content": message,
            "message_id": db_message.id_message,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'envoi du SMS: {str(e)}")

# ==================== ENHANCED MAILING LISTS ENDPOINTS ====================
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

@app.put("/mailing-lists/{list_id}", tags=["Mailing Lists"])
def update_mailing_list(
    list_id: int, 
    nom_liste: str, 
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Mettre à jour une liste de diffusion"""
    mailing_list = db.query(models.MailingList).filter(models.MailingList.id_liste == list_id).first()
    if not mailing_list:
        raise HTTPException(status_code=404, detail="Liste de diffusion non trouvée")
    
    mailing_list.nom_liste = nom_liste
    if description:
        mailing_list.description = description
    db.commit()
    return mailing_list

@app.delete("/mailing-lists/{list_id}", tags=["Mailing Lists"])
def delete_mailing_list(list_id: int, db: Session = Depends(get_db)):
    """Supprimer une liste de diffusion"""
    mailing_list = db.query(models.MailingList).filter(models.MailingList.id_liste == list_id).first()
    if not mailing_list:
        raise HTTPException(status_code=404, detail="Liste de diffusion non trouvée")
    
    db.delete(mailing_list)
    db.commit()
    return {"message": "Liste de diffusion supprimée avec succès"}

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

# ==================== ENHANCED MESSAGE TEMPLATES ENDPOINTS ====================
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

@app.get("/message-templates/", tags=["Templates"])
def get_message_templates(db: Session = Depends(get_db)):
    """Récupérer tous les modèles de messages (alias pour compatibilité frontend)"""
    return db.query(models.MessageTemplate).all()

@app.post("/message-templates/", tags=["Templates"])
def create_message_template(
    nom_modele: str,
    contenu_modele: str,
    db: Session = Depends(get_db)
):
    """Créer un nouveau modèle de message (alias pour compatibilité frontend)"""
    db_template = models.MessageTemplate(
        nom_modele=nom_modele,
        contenu_modele=contenu_modele
    )
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

@app.put("/message-templates/{template_id}", tags=["Templates"])
def update_message_template(
    template_id: int,
    nom_modele: str,
    contenu_modele: str,
    db: Session = Depends(get_db)
):
    """Mettre à jour un modèle de message"""
    template = db.query(models.MessageTemplate).filter(models.MessageTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Modèle non trouvé")
    
    template.nom_modele = nom_modele
    template.contenu_modele = contenu_modele
    db.commit()
    return template

@app.delete("/message-templates/{template_id}", tags=["Templates"])
def delete_message_template(template_id: int, db: Session = Depends(get_db)):
    """Supprimer un modèle de message"""
    template = db.query(models.MessageTemplate).filter(models.MessageTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Modèle non trouvé")
    
    db.delete(template)
    db.commit()
    return {"message": "Modèle supprimé avec succès"}

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

# ==================== ADMIN ROUTES ====================
@app.get("/admin-only", dependencies=[Depends(role_required("Admin"))], tags=["Admin"])
def admin_only():
    return {"ok": True, "area": "admin", "message": "Accès administrateur autorisé"}

@app.get("/supervise", dependencies=[Depends(role_required("Admin", "Superviseur"))], tags=["Admin"])
def supervise_zone():
    return {"ok": True, "area": "supervise", "message": "Accès supervision autorisé"}

@app.get("/dashboard", tags=["Dashboard"])
def dashboard_stats(db: Session = Depends(get_db)):
    """Statistiques avancées du tableau de bord"""
    total_contacts = db.query(models.Contact).count()
    total_campaigns = db.query(models.Campagne).count()
    total_messages = db.query(models.Message).count()
    total_templates = db.query(models.MessageTemplate).count()
    total_users = db.query(models.User).count()
    
    # Statistiques par statut de campagne
    campaigns_by_status = db.query(models.Campagne.statut, db.func.count(models.Campagne.id_campagne)).group_by(models.Campagne.statut).all()
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

# --- TEST ENDPOINTS FOR ALL TABLES ---
from schemas import UserCreate, ContactCreate, CampagneCreate, MessageTemplateCreate

# User
@app.post("/test/create-user", response_model=UserRead)
def test_create_user(username: str, email: str, password: str, role: str = "agent", db: Session = Depends(get_db)):
    user_data = UserCreate(username=username, email=email, password=password, role=role)
    return crud.create_user(db, user_data)

@app.get("/test/users", response_model=List[UserRead])
def test_list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()

# Contact
@app.post("/test/create-contact")
def test_create_contact(nom: str, prenom: str, numero_telephone: str, email: str = None, db: Session = Depends(get_db)):
    contact_data = ContactCreate(nom=nom, prenom=prenom, numero_telephone=numero_telephone, email=email)
    return crud.create_contact(db, contact_data)

@app.get("/test/contacts")
def test_list_contacts(db: Session = Depends(get_db)):
    return db.query(models.Contact).all()

# MailingList
@app.post("/test/create-mailinglist")
def test_create_mailinglist(nom_liste: str, description: str = None, db: Session = Depends(get_db)):
    mailinglist = models.MailingList(nom_liste=nom_liste, description=description)
    db.add(mailinglist)
    db.commit()
    db.refresh(mailinglist)
    return mailinglist

@app.get("/test/mailinglists")
def test_list_mailinglists(db: Session = Depends(get_db)):
    return db.query(models.MailingList).all()

# Campagne
@app.post("/test/create-campagne")
def test_create_campagne(nom_campagne: str, type_campagne: str, db: Session = Depends(get_db)):
    campagne = models.Campagne(nom_campagne=nom_campagne, type_campagne=type_campagne)
    db.add(campagne)
    db.commit()
    db.refresh(campagne)
    return campagne

@app.get("/test/campagnes")
def test_list_campagnes(db: Session = Depends(get_db)):
    return db.query(models.Campagne).all()

# MessageTemplate
@app.post("/test/create-messagetemplate")
def test_create_messagetemplate(nom_modele: str, contenu_modele: str, db: Session = Depends(get_db)):
    template = models.MessageTemplate(nom_modele=nom_modele, contenu_modele=contenu_modele)
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

@app.get("/test/messagetemplates")
def test_list_messagetemplates(db: Session = Depends(get_db)):
    return db.query(models.MessageTemplate).all()

# CampaignReport
@app.post("/test/create-campaignreport")
def test_create_campaignreport(campagne_id: int, db: Session = Depends(get_db)):
    report = models.CampaignReport(campagne_id=campagne_id)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@app.get("/test/campaignreports")
def test_list_campaignreports(db: Session = Depends(get_db)):
    return db.query(models.CampaignReport).all()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
