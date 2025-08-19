
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi_jwt_auth.exceptions import AuthJWTException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

import database, models, crud
from auth import router as auth_router, role_required, get_current_user
from schemas import UserRead
# Créer tables si besoin (dev)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="PROJET SMS API")

@app.get("/test")
def test():
    return {"hello": "world"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
@app.exception_handler(AuthJWTException)
def authjwt_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
app.include_router(auth_router)

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok"}

# Route protégée par rôle Admin
@app.get("/admin-only", dependencies=[Depends(role_required("Admin"))])
def admin_only():
    return {"ok": True, "area": "admin"}

# Route protégée par rôle (Admin ou Superviseur)
@app.get("/supervise", dependencies=[Depends(role_required("Admin", "Superviseur"))])
def supervise_zone():
    return {"ok": True, "area": "supervise"}
