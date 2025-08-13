from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# URL de connexion à la base PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

# Créer l'engine SQLAlchemy
engine = create_engine(DATABASE_URL)

# Créer la session
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base pour les modèles
Base = declarative_base()
# Création des tables dans la base
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("Tables créées avec succès")

from models import user

