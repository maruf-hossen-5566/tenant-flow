import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.user import UserResponse


class TenantBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=299, description="Tenant name")


class TenantCreate(TenantBase):
    model_config = ConfigDict(from_attributes=True)


class TenantUpdate(TenantBase):
    pass


class TenantResponse(TenantBase):
    id: uuid.UUID = Field(description="ID of the tenant")
    slug: str = Field(description="Slug of the tenant")
    created_by: uuid.UUID | None = Field(description="Creator of the tenant")
    created_at: datetime = Field(description="Creation time of the tenant")
    updated_at: datetime = Field(description="Last updated time of the tenant")
    # Relationships
    creator: Optional[UserResponse] = Field(description="Creator of the tenant")
    # members: list[MemberResponse]
