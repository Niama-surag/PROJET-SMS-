from database import Base, engine
from models import User  # ici on peut importer nos modèles

print("Création des tables...")
Base.metadata.create_all(bind=engine)
print("Tables créées avec succès")
