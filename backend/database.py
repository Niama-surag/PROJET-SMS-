from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

# Charger les variables d'environnement
load_dotenv()

# URL de connexion à PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

# Créer l'engine
engine = create_engine(DATABASE_URL)

# Créer la session
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# Base pour les modèles
Base = declarative_base()

if __name__ == "__main__":
    print("Connexion réussie à la base de données")
