from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid
from pydantic import BaseModel, Field, EmailStr, ConfigDict


class MemberRole(str, Enum):
    admin = "admin"
    member = "member"
    guest = "guest"


class MemberBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    user_id: uuid.UUID = Field(..., description="Belonging user ID")


class MemberCreate(BaseModel):
    emails: set[EmailStr] = Field(description="Belonging user email")
    role: MemberRole = Field(
        MemberRole.member,
        description=f"Membership role: {[role.value for role in MemberRole]}",
    )


class MemberUpdate(BaseModel):
    role: Optional[MemberRole] = Field(
        None,
        description=f"Update membership role: {[role.value for role in MemberRole]}",
    )


class MemberResponse(MemberBase):
    id: uuid.UUID = Field(description="Membership ID")
    tenant_id: uuid.UUID = Field(description="Belonging tenant ID")
    role: MemberRole = Field(description="Membership role")
    created_at: datetime = Field(description="Membership creation time")
    updated_at: datetime = Field(description="Membership last updated time")
    user_id: Optional[uuid.UUID] = Field(description="Belonging user ID")
    # Relationships
    user: Optional["UserResponse"] = None


class MemberTasksResponse(MemberResponse):
    tasks: Optional[list["TaskResponse"]] = None


class MemberProjectsResponse(MemberResponse):
    member_projects: Optional[list["ProjectResponse"]] = None


from app.schemas.user import UserResponse
from app.schemas.task import TaskResponse
from app.schemas.project import ProjectResponse

MemberResponse.model_rebuild()
MemberTasksResponse.model_rebuild()
MemberProjectsResponse.model_rebuild()
