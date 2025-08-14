from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# Schéma de base (propriétés communes)
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Schéma pour la création d'utilisateur (avec mot de passe)
class UserCreate(UserBase):
    password: str

# Schéma pour afficher un utilisateur (sans mot de passe)
class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True

