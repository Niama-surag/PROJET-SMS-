from fastapi import FastAPI, HTTPException
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str

# In-memory storage for testing
users_db = []
id_counter = 1

@app.get("/")
async def read_root():
    return {"mssg": "first app in py project"}

@app.post("/users/", response_model=User)
def create_user(user: User):
    global id_counter
    if any(u.email == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user.id = id_counter
    id_counter += 1
    users_db.append(user)
    return user

@app.get("/users/", response_model=List[User])
def get_users(skip: int = 0, limit: int = 10):
    return users_db[skip : skip + limit]

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user_update: User):
    user = next((u for u in users_db if u.id == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.name = user_update.name
    user.email = user_update.email
    return user

@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    users_db.remove(user)
    return {"message": "User deleted successfully"}
