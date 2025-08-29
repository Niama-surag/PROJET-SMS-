from pydantic import BaseModel, EmailStr, Field
from typing import Annotated, Optional, List
from datetime import datetime
import re

# ---- Contact Schemas ----
class ContactBase(BaseModel):
    nom: str
    prenom: str
    numero_telephone: str
    email: Optional[str] = None
    statut_opt_in: bool = True
    ville: Optional[str] = None
    region: Optional[str] = None
    code_postal: Optional[str] = None
    type_client: Optional[str] = None
    age: Optional[int] = None
    genre: Optional[str] = None
    source: Optional[str] = "Manual"
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    numero_telephone: Optional[str] = None
    email: Optional[str] = None
    statut_opt_in: Optional[bool] = None
    ville: Optional[str] = None
    region: Optional[str] = None
    code_postal: Optional[str] = None
    type_client: Optional[str] = None
    age: Optional[int] = None
    genre: Optional[str] = None
    notes: Optional[str] = None

class ContactRead(ContactBase):
    id_contact: int
    date_inscription: datetime
    derniere_activite: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ---- Campaign Schemas ----
class CampagneBase(BaseModel):
    nom_campagne: str
    type_campagne: str = "promotional"
    date_debut: datetime
    date_fin: datetime
    message_template: str
    personnalisation_active: bool = True
    segment_cible: Optional[str] = None
    zone_geographique: Optional[str] = None
    criteres_age: Optional[str] = None

class CampagneCreate(CampagneBase):
    pass

class CampagneUpdate(BaseModel):
    nom_campagne: Optional[str] = None
    type_campagne: Optional[str] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    message_template: Optional[str] = None
    personnalisation_active: Optional[bool] = None
    segment_cible: Optional[str] = None
    zone_geographique: Optional[str] = None
    criteres_age: Optional[str] = None
    statut: Optional[str] = None

class CampagneRead(CampagneBase):
    id_campagne: int
    statut: str
    nombre_destinataires: int
    nombre_envoyes: int
    nombre_livres: int
    nombre_echecs: int
    date_creation: datetime
    date_modification: datetime
    created_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# ---- File Import Schemas ----
class FileImportResult(BaseModel):
    total_rows: int
    successful_imports: int
    failed_imports: int
    errors: List[str]
    imported_contacts: List[ContactRead]

class SegmentationCriteria(BaseModel):
    type_client: Optional[List[str]] = None
    ville: Optional[List[str]] = None
    region: Optional[List[str]] = None
    age_min: Optional[int] = None
    age_max: Optional[int] = None
    genre: Optional[List[str]] = None
    statut_opt_in: Optional[bool] = True

# ---- User ----
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    role: str = Field("Agent", pattern="^(Admin|Agent|Superviseur)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True  # Pydantic v2

# ---- Token ----
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- JWT Settings ----
class Settings(BaseModel):
    authjwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"   # idéalement via .env
    authjwt_token_location: set = {"headers"}
    authjwt_access_token_expires: int = 60 * 60 * 12  # 12h (en secondes)

# ---- SMS Schemas ----
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

# ---- Message Template Schemas ----
class MessageTemplateCreate(BaseModel):
    nom_modele: str
    contenu_modele: str
    actif: bool = True
    date_creation: Optional[datetime] = None

