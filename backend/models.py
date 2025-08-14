from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Table, Boolean, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from database import Base
from sqlalchemy import Column

# ========================
# Utilisateur
# ========================
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)  # Mot de passe haché


# ========================
# Table d'association MailingList ↔ Contact
# ========================
mailinglist_contact = Table(
    "mailinglist_contact",
    Base.metadata,
    Column("mailinglist_id", ForeignKey("mailing_lists.id_liste"), primary_key=True),
    Column("contact_id", ForeignKey("contacts.id_contact"), primary_key=True)
)

# ========================
# Messages
# ========================
class Message(Base):
    __tablename__ = "messages"

    id_message: Mapped[int] = mapped_column(primary_key=True)
    contenu: Mapped[str] = mapped_column(Text)
    date_envoi: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    statut_livraison: Mapped[str] = mapped_column(String(50))
    identifiant_expediteur: Mapped[str] = mapped_column(String(100))

    campagne_id: Mapped[int] = mapped_column(ForeignKey("campagnes.id_campagne"))
    campagne: Mapped["Campagne"] = relationship(back_populates="messages")


# ========================
# Mailing lists
# ========================
class MailingList(Base):
    __tablename__ = "mailing_lists"

    id_liste: Mapped[int] = mapped_column(primary_key=True)
    nom_liste: Mapped[str] = mapped_column(String(100))

    contacts: Mapped[list["Contact"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="mailing_lists"
    )


# ========================
# Contacts
# ========================
class Contact(Base):
    __tablename__ = "contacts"

    id_contact: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))
    numero_telephone: Mapped[str] = mapped_column(String(20))
    statut_opt_in: Mapped[bool] = mapped_column(Boolean)

    mailing_lists: Mapped[list["MailingList"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="contacts"
    )


# ========================
# Campagnes
# ========================
class Campagne(Base):
    __tablename__ = "campagnes"

    id_campagne: Mapped[int] = mapped_column(primary_key=True)
    nom_campagne: Mapped[str] = mapped_column(String(100))
    date_debut: Mapped[datetime] = mapped_column(DateTime)
    date_fin: Mapped[datetime] = mapped_column(DateTime)
    statut: Mapped[str] = mapped_column(String(50))

    messages: Mapped[list["Message"]] = relationship(back_populates="campagne")


# ========================
# Rapports de campagnes
# ========================
class CampaignReport(Base):
    __tablename__ = "rapports"

    id_rapport: Mapped[int] = mapped_column(primary_key=True)
    taux_ouverture: Mapped[float] = mapped_column(Float)
    taux_clics: Mapped[float] = mapped_column(Float)
    taux_conversion: Mapped[float] = mapped_column(Float)
    nombre_desabonnements: Mapped[int] = mapped_column(Integer)


# ========================
# Agents
# ========================
class Agent(Base):
    __tablename__ = "agents"

    id_agent: Mapped[int] = mapped_column(primary_key=True)
    nom_agent: Mapped[str] = mapped_column(String(100))
    identifiant: Mapped[str] = mapped_column(String(100))
    mot_de_passe: Mapped[str] = mapped_column(String(255))


# ========================
# Modèles de messages
# ========================
class MessageTemplate(Base):
    __tablename__ = "templates"

    id_modele: Mapped[int] = mapped_column(primary_key=True)
    nom_modele: Mapped[str] = mapped_column(String(100))
    contenu_modele: Mapped[str] = mapped_column(Text)











    




