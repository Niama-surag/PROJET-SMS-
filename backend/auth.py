from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi_jwt_auth import AuthJWT
from fastapi_jwt_auth.exceptions import AuthJWTException

import crud, database
from schemas import UserCreate, UserLogin, UserRead, TokenOut, Settings
from security import verify_password
from models import User
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Auth"])

class Settings(BaseModel):
    authjwt_secret_key: str = "supersecretkey123"  #clé secrète JWT

# Charger la config JWT depuis schemas.Settings
@AuthJWT.load_config
def get_config():
    return Settings()

# --- Register ---
@router.post("/register", response_model=UserRead)
def register(payload: UserCreate, db: Session = Depends(database.get_db)):
    try:
        user = crud.create_user(db, payload)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Login ---
@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin, Authorize: AuthJWT = Depends(), db: Session = Depends(database.get_db)):
    user: User = crud.get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.pass_word):
        raise HTTPException(status_code=401, detail="Email ou mot de passe invalide")

    # On met l'id comme subject et le rôle dans les claims
    access_token = Authorize.create_access_token(
        subject=str(user.id),
        user_claims={"role": user.role, "username": user.username}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Helper pour récupérer l'utilisateur courant ---
def get_current_user(Authorize: AuthJWT = Depends(), db: Session = Depends(database.get_db)) -> User:
    Authorize.jwt_required()
    user_id = Authorize.get_jwt_subject()
    user = db.query(User).get(int(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")
    return user

# --- Guard par rôle ---
def role_required(*roles: str):
    def _dep(Authorize: AuthJWT = Depends()):
        Authorize.jwt_required()
        claims = Authorize.get_raw_jwt()
        role = claims.get("role")
        if role not in roles:
            raise HTTPException(status_code=403, detail="Accès refusé")
    return _dep

# Exemple de route protégée
@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user

