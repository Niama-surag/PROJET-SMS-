
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from models import User, Contact, Campagne, MailingList, Message
from schemas import UserCreate, ContactCreate, ContactUpdate, CampagneCreate, CampagneUpdate, SegmentationCriteria
from security import hash_password
from typing import List, Optional
from datetime import datetime

# ==================== USER CRUD ====================
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate) -> User:
    print(f"🔍 Creating user: {user.username} with email: {user.email}")
    
    if get_user_by_email(db, user.email):
        raise ValueError("Email déjà utilisé")
    if get_user_by_username(db, user.username):
        raise ValueError("Username déjà utilisé")

    db_user = User(
        username=user.username,
        email=user.email,
        pass_word=hash_password(user.password),
        role=user.role
    )
    
    print(f"✅ Adding user to database...")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    print(f"🎉 User created successfully with ID: {db_user.id}")
    return db_user

# ==================== CONTACT CRUD ====================
def create_contact(db: Session, contact: ContactCreate) -> Contact:
    """Créer un nouveau contact"""
    # Vérifier si le numéro de téléphone existe déjà
    existing_contact = db.query(Contact).filter(Contact.numero_telephone == contact.numero_telephone).first()
    if existing_contact:
        raise ValueError(f"Le numéro {contact.numero_telephone} existe déjà")
    
    db_contact = Contact(
        nom=contact.nom,
        prenom=contact.prenom,
        numero_telephone=contact.numero_telephone,
        email=contact.email,
        statut_opt_in=contact.statut_opt_in,
        ville=contact.ville,
        region=contact.region,
        code_postal=contact.code_postal,
        type_client=contact.type_client,
        age=contact.age,
        genre=contact.genre,
        source=contact.source,
        notes=contact.notes
    )
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact

def get_contacts(db: Session, skip: int = 0, limit: int = 100) -> List[Contact]:
    """Récupérer tous les contacts avec pagination"""
    return db.query(Contact).offset(skip).limit(limit).all()

def get_contact_by_id(db: Session, contact_id: int) -> Optional[Contact]:
    """Récupérer un contact par ID"""
    return db.query(Contact).filter(Contact.id_contact == contact_id).first()

def update_contact(db: Session, contact_id: int, contact_update: ContactUpdate) -> Optional[Contact]:
    """Mettre à jour un contact"""
    db_contact = get_contact_by_id(db, contact_id)
    if not db_contact:
        return None
    
    update_data = contact_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_contact, field, value)
    
    db_contact.derniere_activite = datetime.utcnow()
    db.commit()
    db.refresh(db_contact)
    return db_contact

def delete_contact(db: Session, contact_id: int) -> bool:
    """Supprimer un contact"""
    db_contact = get_contact_by_id(db, contact_id)
    if db_contact:
        db.delete(db_contact)
        db.commit()
        return True
    return False

def search_contacts(db: Session, query: str) -> List[Contact]:
    """Rechercher des contacts par nom, prénom ou téléphone"""
    return db.query(Contact).filter(
        or_(
            Contact.nom.ilike(f"%{query}%"),
            Contact.prenom.ilike(f"%{query}%"),
            Contact.numero_telephone.ilike(f"%{query}%"),
            Contact.email.ilike(f"%{query}%")
        )
    ).all()

def get_contacts_by_segmentation(db: Session, criteria: SegmentationCriteria) -> List[Contact]:
    """Récupérer des contacts selon des critères de segmentation"""
    query = db.query(Contact)
    
    if criteria.type_client:
        query = query.filter(Contact.type_client.in_(criteria.type_client))
    
    if criteria.ville:
        query = query.filter(Contact.ville.in_(criteria.ville))
    
    if criteria.region:
        query = query.filter(Contact.region.in_(criteria.region))
    
    if criteria.age_min is not None:
        query = query.filter(Contact.age >= criteria.age_min)
    
    if criteria.age_max is not None:
        query = query.filter(Contact.age <= criteria.age_max)
    
    if criteria.genre:
        query = query.filter(Contact.genre.in_(criteria.genre))
    
    if criteria.statut_opt_in is not None:
        query = query.filter(Contact.statut_opt_in == criteria.statut_opt_in)
    
    return query.all()

# ==================== CAMPAIGN CRUD ====================
def create_campaign(db: Session, campaign: CampagneCreate, created_by: Optional[int] = None) -> Campagne:
    """Créer une nouvelle campagne"""
    db_campaign = Campagne(
        nom_campagne=campaign.nom_campagne,
        type_campagne=campaign.type_campagne,
        date_debut=campaign.date_debut,
        date_fin=campaign.date_fin,
        message_template=campaign.message_template,
        personnalisation_active=campaign.personnalisation_active,
        segment_cible=campaign.segment_cible,
        zone_geographique=campaign.zone_geographique,
        criteres_age=campaign.criteres_age,
        statut="créée",
        created_by=created_by
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaigns(db: Session, skip: int = 0, limit: int = 100) -> List[Campagne]:
    """Récupérer toutes les campagnes"""
    return db.query(Campagne).offset(skip).limit(limit).all()

def get_campaign_by_id(db: Session, campaign_id: int) -> Optional[Campagne]:
    """Récupérer une campagne par ID"""
    return db.query(Campagne).filter(Campagne.id_campagne == campaign_id).first()

def update_campaign(db: Session, campaign_id: int, campaign_update: CampagneUpdate) -> Optional[Campagne]:
    """Mettre à jour une campagne"""
    db_campaign = get_campaign_by_id(db, campaign_id)
    if not db_campaign:
        return None
    
    update_data = campaign_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_campaign, field, value)
    
    db_campaign.date_modification = datetime.utcnow()
    db.commit()
    db.refresh(db_campaign)
    return db_campaign

def get_campaigns_by_status(db: Session, status: str) -> List[Campagne]:
    """Récupérer les campagnes par statut"""
    return db.query(Campagne).filter(Campagne.statut == status).all()

# ==================== BULK OPERATIONS ====================
def bulk_create_contacts(db: Session, contacts: List[ContactCreate], source: str = "Import") -> dict:
    """Créer plusieurs contacts en lot"""
    results = {
        "total": len(contacts),
        "success": 0,
        "errors": [],
        "created_contacts": []
    }
    
    for i, contact_data in enumerate(contacts):
        try:
            contact_data.source = source
            db_contact = create_contact(db, contact_data)
            results["created_contacts"].append(db_contact)
            results["success"] += 1
        except Exception as e:
            results["errors"].append(f"Ligne {i+1}: {str(e)}")
    
    return results

