from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "agent"  # <--- nouveau champ exposé côté API

class UserCreate(UserBase):
    password: str = Field(min_length=6)


class UserResponse(UserBase):
    id: int

    class Config:
         from_attributes= True
