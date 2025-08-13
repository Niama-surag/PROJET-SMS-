from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"  # Nom de la table dans PostgreSQL

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    pass_word = Column(String(255), nullable=False)
