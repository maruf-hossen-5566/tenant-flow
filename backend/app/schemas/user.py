import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, EmailStr


class BaseUser(BaseModel):
    name: str = Field(..., min_length=3, max_length=299, description="User name")
    email: EmailStr = Field(..., max_length=299, description="User email")

    class Config:
        from_attributes = True


class UpdateUser(BaseModel):
    name: Optional[str] = Field(
        None, min_length=3, max_length=299, description="Update user name"
    )


class UpdatePassword(BaseModel):
    password: str = Field(..., description="Current password", alias="pass")
    new_password: str = Field(
        ..., min_length=8, max_length=16, description="New password", alias="newPass"
    )
    conf_password: str = Field(
        ...,
        min_length=8,
        max_length=16,
        description="Confirm new password",
        alias="confNewPass",
    )


class UserResponse(BaseUser):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
