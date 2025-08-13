from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from passlib.hash import bcrypt

# Créer les tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dépendance pour récupérer une session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Route d'inscription
@app.post("/register")
def register(username: str, email: str, password: str, db: Session = Depends(get_db)):
    # Vérifier si email existe déjà
    user_exist = db.query(models.User).filter(models.User.email == email).first()
    if user_exist:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    # Hacher le mot de passe
    pass_word = bcrypt.hash(password)

    # Créer l'utilisateur
    new_user = models.User(username=username, email=email, password=pass_word)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "Utilisateur créé avec succès", "user_id": new_user.id}




