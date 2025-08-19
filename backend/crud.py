
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate
from security  import hash_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, user: UserCreate) -> User:
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
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
