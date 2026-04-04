from pydantic import BaseModel, Field, EmailStr

from app.schemas.user import BaseUser


class RegisterUser(BaseUser):
    password: str = Field(..., min_length=8, max_length=16, description="User password")


class LoginUser(BaseModel):
    email: EmailStr = Field(..., max_length=299, description="User email")
    password: str = Field(..., min_length=8, max_length=16, description="User password")


class RefreshToken(BaseModel):
    refresh_token: str = Field(..., min_length=8, description="Refresh token")
