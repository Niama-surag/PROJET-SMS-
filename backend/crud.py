from sqlalchemy.orm import Session
from passlib.context import CryptContext
from models import User
from schemas import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd_context.hash(p)

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        username=user.username,
        email=user.email,
        pass_word=hash_password(user.password),
        role=user.role,  # <--- important
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
