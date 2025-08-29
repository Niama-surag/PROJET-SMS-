from datetime import datetime
from sqlalchemy import (
    Integer, String, Text, DateTime, ForeignKey, Table, Column, Boolean
)
from sqlalchemy.orm import relationship
from database import Base


# ---------- Utilisateur ----------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    pass_word = Column(String, nullable=False)
    role = Column(String(50), nullable=False, default="agent")


# ---------- Table d'association MailingList <-> Contact ----------
mailinglist_contact = Table(
    "mailinglist_contact",
    Base.metadata,
    Column("mailinglist_id", ForeignKey("mailing_lists.id_liste"), primary_key=True),
    Column("contact_id", ForeignKey("contacts.id_contact"), primary_key=True),
)


# ---------- Message ----------
class Message(Base):
    __tablename__ = "messages"

    id_message = Column(Integer, primary_key=True)
    contenu = Column(Text)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_envoi = Column(DateTime, default=datetime.utcnow)
    statut_livraison = Column(String(50))
    identifiant_expediteur = Column(String(100))
    
    campagne_id = Column(ForeignKey("campagnes.id_campagne"))
    campagne = relationship("Campagne", back_populates="messages")


# Association table for Campaign <-> Contact many-to-many
campagne_contact = Table(
    "campagne_contact",
    Base.metadata,
    Column("campagne_id", ForeignKey("campagnes.id_campagne"), primary_key=True),
    Column("contact_id", ForeignKey("contacts.id_contact"), primary_key=True),
)


# ---------- MailingList ----------
class MailingList(Base):
    __tablename__ = "mailing_lists"

    id_liste = Column(Integer, primary_key=True)
    nom_liste = Column(String(100))
    description = Column(Text, nullable=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    
    contacts = relationship(
        "Contact",
        secondary=mailinglist_contact,
        back_populates="listes_diffusion"
    )


# ---------- Contact ----------
class Contact(Base):
    __tablename__ = "contacts"

    id_contact = Column(Integer, primary_key=True)
    nom = Column(String(100))
    prenom = Column(String(100))
    numero_telephone = Column(String(50), unique=True)
    email = Column(String(100), nullable=True)
    statut_opt_in = Column(Boolean, default=True)
    
    ville = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    code_postal = Column(String(10), nullable=True)
    type_client = Column(String(50), nullable=True)
    age = Column(Integer, nullable=True)
    genre = Column(String(1), nullable=True)
    
    date_inscription = Column(DateTime, default=datetime.utcnow)
    derniere_activite = Column(DateTime, nullable=True)
    source = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    
    listes_diffusion = relationship(
        "MailingList",
        secondary=mailinglist_contact,
        back_populates="contacts"
    )
    
    campagnes = relationship(
        "Campagne",
        secondary=campagne_contact,
        back_populates="contacts"
    )


# ---------- Campagne ----------
class Campagne(Base):
    __tablename__ = "campagnes"

    id_campagne = Column(Integer, primary_key=True)
    nom_campagne = Column(String(100))
    type_campagne = Column(String(50))
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_debut = Column(DateTime)
    date_fin = Column(DateTime, nullable=True)
    
    message_template = Column(Text)
    personnalisation_active = Column(Boolean, default=False)
    segment_cible = Column(String(100), nullable=True)
    statut = Column(String(50), default="draft")
    
    messages = relationship("Message", back_populates="campagne")
    contacts = relationship(
        "Contact",
        secondary=campagne_contact,
        back_populates="campagnes"
    )
    
    def personnaliser_message(self, contact):
        """Personalize message for a specific contact"""
        if not self.personnalisation_active or not self.message_template:
            return self.message_template
        
        message = self.message_template
        
        placeholders = {
            '{prenom}': contact.prenom or '',
            '{nom}': contact.nom or '',
            '{nom_complet}': f"{contact.prenom or ''} {contact.nom or ''}".strip(),
            '{ville}': contact.ville or '',
            '{region}': contact.region or '',
            '{type_client}': contact.type_client or '',
            '{age}': str(contact.age) if contact.age else '',
        }
        
        for placeholder, value in placeholders.items():
            message = message.replace(placeholder, value)
        
        return message


# ---------- Statut Livraison ----------
class StatutLivraison(Base):
    __tablename__ = "statuts_livraison"

    id_statut = Column(Integer, primary_key=True)
    nom_statut = Column(String(50))
    description = Column(Text, nullable=True)


# ---------- Expéditeur ----------
class Expediteur(Base):
    __tablename__ = "expediteurs"

    id_expediteur = Column(Integer, primary_key=True)
    nom = Column(String(100))
    numero_telephone = Column(String(50))
    api_key = Column(String(255), nullable=True)
    service_provider = Column(String(50), nullable=True)


# ---------- Logs ----------
class Log(Base):
    __tablename__ = "logs"

    id_log = Column(Integer, primary_key=True)
    action = Column(String(100))
    utilisateur_id = Column(ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    details = Column(Text, nullable=True)
    
    utilisateur = relationship("User")


# ---------- Message Template ----------
class MessageTemplate(Base):
    __tablename__ = "message_templates"

    id = Column(Integer, primary_key=True, index=True)
    nom_modele = Column(String(100), nullable=False)
    contenu_modele = Column(Text, nullable=False)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    actif = Column(Boolean, default=True)


# ---------- Campaign Report ----------
class CampaignReport(Base):
    __tablename__ = "campaign_reports"

    id_report = Column(Integer, primary_key=True, index=True)
    campagne_id = Column(ForeignKey("campagnes.id_campagne"), nullable=False)
    
    # Report metadata
    date_generation = Column(DateTime, default=datetime.utcnow)
    type_rapport = Column(String(50), default="standard")  # standard, detailed, summary
    
    # Campaign execution stats
    total_contacts_cibles = Column(Integer, default=0)
    messages_envoyes = Column(Integer, default=0)
    messages_livres = Column(Integer, default=0)
    messages_echues = Column(Integer, default=0)
    messages_en_attente = Column(Integer, default=0)
    
    # Performance metrics
    taux_livraison = Column(String(10), nullable=True)  # "95.5%"
    taux_ouverture = Column(String(10), nullable=True)  # "87.2%"
    taux_clic = Column(String(10), nullable=True)      # "12.8%"
    taux_opt_out = Column(String(10), nullable=True)   # "0.5%"
    
    # Cost analysis
    cout_total = Column(String(20), nullable=True)     # "€125.50"
    cout_par_message = Column(String(20), nullable=True)  # "€0.05"
    cout_par_conversion = Column(String(20), nullable=True)  # "€2.15"
    
    # Timing information
    heure_debut = Column(DateTime, nullable=True)
    heure_fin = Column(DateTime, nullable=True)
    duree_campagne = Column(String(50), nullable=True)  # "2h 35m"
    
    # Geographic breakdown (JSON format stored as text)
    repartition_geographique = Column(Text, nullable=True)  # JSON: {"Paris": 450, "Lyon": 230, ...}
    
    # Device/Channel breakdown
    repartition_canaux = Column(Text, nullable=True)  # JSON: {"SMS": 890, "Email": 123, ...}
    
    # Additional metrics
    conversions = Column(Integer, default=0)
    revenus_generes = Column(String(20), nullable=True)  # "€2,450.00"
    roi_campagne = Column(String(10), nullable=True)    # "195%"
    
    # Error tracking
    erreurs_techniques = Column(Integer, default=0)
    details_erreurs = Column(Text, nullable=True)  # JSON format for error details
    
    # Report status
    statut_rapport = Column(String(20), default="generated")  # generated, archived, exported
    genere_par_user_id = Column(ForeignKey("users.id"), nullable=True)
    
    # Notes and comments
    commentaires = Column(Text, nullable=True)
    tags = Column(String(200), nullable=True)  # Comma-separated tags
    
    # Relationships
    campagne = relationship("Campagne", backref="reports")
    genere_par = relationship("User")
