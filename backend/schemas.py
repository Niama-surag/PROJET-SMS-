from pydantic import BaseModel, EmailStr, Field

# ---- User ----
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    email: EmailStr
    role: str = Field("Agent", regex="^(Admin|Agent|Superviseur)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRead(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True  # Pydantic v1

# ---- Token ----
class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ---- JWT Settings ----
class Settings(BaseModel):
    authjwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"   # idéalement via .env
    authjwt_token_location: set = {"headers"}
    authjwt_access_token_expires: int = 60 * 60 * 12  # 12h (en secondes)

