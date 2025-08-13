from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Table
from sqlalchemy.sql import func
from database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    pass_word = Column(String, nullable=False)


# Association table pour MailingList ↔ Contact

mailinglist_contact = Table(
    "mailinglist_contact",
    Base.metadata,
    mapped_column("mailinglist_id", ForeignKey("mailing_lists.id_liste"), primary_key=True),
    mapped_column("contact_id", ForeignKey("contacts.id_contact"), primary_key=True)
)

class Message(Base):
    __tablename__ = "messages"

    id_message: Mapped[int] = mapped_column(primary_key=True)
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


class MailingList(Base):
    __tablename__ = "mailing_lists"

    id_liste: Mapped[int] = mapped_column(primary_key=True)
    nom_liste: Mapped[str] = mapped_column(String(100))

    contacts: Mapped[list["Contact"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="mailing_lists"
    )

    def ajouter_contact_a_liste(self, contact):
        self.contacts.append(contact)

    def retirer_contact_de_liste(self, contact):
        self.contacts.remove(contact)

    def segmenter_liste(self):
        return [c for c in self.contacts if c.statut_opt_in]


class Contact(Base):
    __tablename__ = "contacts"

    id_contact: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str]
    prenom: Mapped[str]
    numero_telephone: Mapped[str]
    statut_opt_in: Mapped[bool]

    mailing_lists: Mapped[list["MailingList"]] = relationship(
        secondary=mailinglist_contact,
        back_populates="contacts"
    )

    def ajouter_contact(self):
        pass  # logique à définir

    def modifier_contact(self, nom=None, prenom=None, numero=None):
        if nom: self.nom = nom
        if prenom: self.prenom = prenom
        if numero: self.numero_telephone = numero

    def supprimer_contact(self):
        pass  # logique à définir


class Campagne(Base):
    __tablename__ = "campagnes"

    id_campagne: Mapped[int] = mapped_column(primary_key=True)
    nom_campagne: Mapped[str]
    date_debut: Mapped[datetime]
    date_fin: Mapped[datetime]
    statut: Mapped[str]

    messages: Mapped[list["Message"]] = relationship(back_populates="campagne")

    def creer_campagne(self):
        self.statut = "créée"

    def lancer_campagne(self):
        self.statut = "en cours"

    def suspendre_campagne(self):
        self.statut = "suspendue"

    def terminer_campagne(self):
        self.statut = "terminée"


class CampaignReport(Base):
    __tablename__ = "rapports"

    id_rapport: Mapped[int] = mapped_column(primary_key=True)
    taux_ouverture: Mapped[float]
    taux_clics: Mapped[float]
    taux_conversion: Mapped[float]
    nombre_desabonnements: Mapped[int]

    def generer_rapport(self):
        return {
            "ouverture": self.taux_ouverture,
            "clics": self.taux_clics,
            "conversion": self.taux_conversion,
            "désabonnements": self.nombre_desabonnements
        }


class Agent(Base):
    __tablename__ = "agents"

    id_agent: Mapped[int] = mapped_column(primary_key=True)
    nom_agent: Mapped[str]
    identifiant: Mapped[str]
    mot_de_passe: Mapped[str]

    def se_connecter(self, identifiant, mot_de_passe):
        return self.identifiant == identifiant and self.mot_de_passe == mot_de_passe

    def gerer_campagnes(self):
        pass  # logique à définir


class MessageTemplate(Base):
    __tablename__ = "templates"

    id_modele: Mapped[int] = mapped_column(primary_key=True)
    nom_modele: Mapped[str]
    contenu_modele: Mapped[str] = mapped_column(Text)

    def creer_modele(self, nom, contenu):
        self.nom_modele = nom
        self.contenu_modele = contenu

    def modifier_modele(self, nouveau_contenu):
        self.contenu_modele = nouveau_contenu















    




