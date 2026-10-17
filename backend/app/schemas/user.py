from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    is_onboarded: bool = False
    user: "UserResponse"


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    is_onboarded: bool = False
    created_at: Optional[datetime] = None


Token.model_rebuild()
