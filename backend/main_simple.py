from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import io

import database, models, crud
import file_import
from database import get_db
from schemas import (
    ContactCreate, ContactRead, ContactUpdate, 
    CampagneCreate, CampagneRead, CampagneUpdate,
    FileImportResult, SegmentationCriteria
)

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
    total_contacts = db.query(models.Contact).count()
    total_campaigns = db.query(models.Campagne).count()
    total_messages = db.query(models.Message).count()
    total_templates = db.query(models.MessageTemplate).count()
    total_users = db.query(models.User).count()
    
    # Statistiques par statut de campagne
    campaigns_by_status = db.query(models.Campagne.statut, db.func.count(models.Campagne.id_campagne)).group_by(models.Campagne.statut).all()
    status_counts = {status: count for status, count in campaigns_by_status}
    
    # Contacts ajoutés dans les 30 derniers jours
    from datetime import timedelta
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
