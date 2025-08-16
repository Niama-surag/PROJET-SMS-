from __future__ import annotations

from datetime import datetime
from sqlalchemy import (
    Integer, String, Text, DateTime, ForeignKey, Table, Column, Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


# ---------- Utilisateur ----------
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    # mot de passe stocké hashé
    pass_word: Mapped[str] = mapped_column(String, nullable=False)
    # nouveau champ rôle
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="agent")


# ---------- Table d’association MailingList <-> Contact ----------
mailinglist_contact = Table(
    "mailinglist_contact",
    Base.metadata,
    Column("mailinglist_id", ForeignKey("mailing_lists.id_liste"), primary_key=True),
    Column("contact_id", ForeignKey("contacts.id_contact"), primary_key=True),
)


# ---------- Message ----------
class Message(Base):
    __tablename__ = "messages"

    id_message: Mapped[int] = mapped_column(Integer, primary_key=True)
    contenu: Mapped[str] = mapped_column(Text)
    date_envoi: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    statut_livraison: Mapped[str] = mapped_column(String(50))
    identifiant_expediteur: Mapped[str] = mapped_column(String(100))

    campagne_id: Mapped[int] = mapped_column(ForeignKey("campagnes.id_campagne"))
    campagne: Mapped["Campagne"] = relationship(back_populates="messages")

    def envoyer_message(self):
        self.date_envoi = datetime.utcnow()
        self.statut_livraison = "envoyé"

    def verifier_statut_livraison(self):
        return self.statut_livraison


# ---------- MailingList ----------
class MailingList(Base):
    __tablename__ = "mailing_lists"

    id_liste: Mapped[int] = mapped_column(Integer, primary_key=True)
    nom_liste: Mapped[str] = mapped_column(String(100))

    contacts: Mapped[list["Contact"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="mailing_lists",
    )

    def ajouter_contact_a_liste(self, contact: "Contact"):
        self.contacts.append(contact)

    def retirer_contact_de_liste(self, contact: "Contact"):
        self.contacts.remove(contact)

    def segmenter_liste(self):
        return [c for c in self.contacts if c.statut_opt_in]


# ---------- Contact ----------
class Contact(Base):
    __tablename__ = "contacts"

    id_contact: Mapped[int] = mapped_column(Integer, primary_key=True)
    nom: Mapped[str] = mapped_column(String(100))
    prenom: Mapped[str] = mapped_column(String(100))
    numero_telephone: Mapped[str] = mapped_column(String(50))
    statut_opt_in: Mapped[bool] = mapped_column(Boolean, default=True)

    mailing_lists: Mapped[list["MailingList"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="contacts",  # côté opposé s'appelle "contacts" dans MailingList
    )


# ---------- Campagne ----------
class Campagne(Base):
    __tablename__ = "campagnes"

    id_campagne: Mapped[int] = mapped_column(Integer, primary_key=True)
    nom_campagne: Mapped[str] = mapped_column(String(150))
    date_debut: Mapped[datetime] = mapped_column(DateTime)
    date_fin: Mapped[datetime] = mapped_column(DateTime)
    statut: Mapped[str] = mapped_column(String(50))

    messages: Mapped[list["Message"]] = relationship(back_populates="campagne")

    def creer_campagne(self):
        self.statut = "créée"

    def lancer_campagne(self):
        self.statut = "en cours"

    def suspendre_campagne(self):
        self.statut = "suspendue"

    def terminer_campagne(self):
        self.statut = "terminée"


# ---------- Rapport de campagne ----------
class CampaignReport(Base):
    __tablename__ = "rapports"

    id_rapport: Mapped[int] = mapped_column(Integer, primary_key=True)
    taux_ouverture: Mapped[float] = mapped_column()
    taux_clics: Mapped[float] = mapped_column()
    taux_conversion: Mapped[float] = mapped_column()
    nombre_desabonnements: Mapped[int] = mapped_column(Integer)

    def generer_rapport(self):
        return {
            "ouverture": self.taux_ouverture,
            "clics": self.taux_clics,
            "conversion": self.taux_conversion,
            "désabonnements": self.nombre_desabonnements,
        }


# ---------- Modèles de message ----------
class MessageTemplate(Base):
    __tablename__ = "templates"

    id_modele: Mapped[int] = mapped_column(Integer, primary_key=True)
    nom_modele: Mapped[str] = mapped_column(String(150))
    contenu_modele: Mapped[str] = mapped_column(Text)

    def creer_modele(self, nom: str, contenu: str):
        self.nom_modele = nom
        self.contenu_modele = contenu

    def modifier_modele(self, nouveau_contenu: str):
        self.contenu_modele = nouveau_contenu











    




