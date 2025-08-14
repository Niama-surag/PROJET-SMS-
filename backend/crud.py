from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate
from passlib.hash import bcrypt

def create_user(db: Session, user: UserCreate):
    # Hacher le mot de passe
    pass_word = bcrypt.hash(user.password)

    # Créer l'objet utilisateur
    db_user = User(
        username=user.username,
        email=user.email,
        pass_word=pass_word,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
