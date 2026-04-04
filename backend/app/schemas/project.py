from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Optional
import uuid
from pydantic import BaseModel, Field, ConfigDict, field_validator


class ProjectBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(..., min_length=3, max_length=99, description="Project name")
    desc: Optional[str] = Field("", max_length=990, description=f"Project description")
    lead_id: Optional[uuid.UUID] = Field(
        None, description=f"Project lead Id", alias="lead",
    )
    start_date: Optional[datetime] = Field(
        None, description="Project start date", alias="startDate",
    )
    due_date: Optional[datetime] = Field(
        None, description="Project due date", alias="dueDate",
    )


class ProjectCreate(ProjectBase):
    members: Optional[set[uuid.UUID]] = Field(
        set(), description="Project member IDs", alias="members",
    )

    @field_validator("due_date", mode="after")
    @classmethod
    def validate_dates(cls, v: Optional[date], info: ValidationInfo) -> Optional[date]:
        start_date = info.data.get("start_date")
        if start_date and v and v < start_date:
            raise ValueError("Due date must be after start date")
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(
        None, min_length=3, max_length=99, description="Update project name",
    )
    desc: Optional[str] = Field("", max_length=999, description=f"Project description")
    lead_id: Optional[uuid.UUID] = Field(
        None, description=f"Update project lead ID", alias="lead",
    )
    members: Optional[set[uuid.UUID]] = Field(
        set(), description="Update project member IDs", alias="members",
    )
    start_date: Optional[datetime] = Field(
        None, description="Update project start date", alias="startDate",
    )
    due_date: Optional[datetime] = Field(
        None, description="Update project due date", alias="dueDate",
    )

    @field_validator("due_date", mode="after")
    @classmethod
    def validate_dates(cls, v: Optional[date], info: ValidationInfo) -> Optional[date]:
        start_date = info.data.get("start_date")
        if start_date is None:
            return v

        if v is None:
            return v

        if start_date and v and v < start_date:
            raise ValueError("Due date must be after start date")
        return v


class ProjectResponse(ProjectBase):
    id: uuid.UUID = Field(description="Project ID")
    slug: str = Field(description="Project slug")
    tenant_id: uuid.UUID = Field(description=f"Belonging tenant ID")
    lead_id: Optional[uuid.UUID] = Field(description=f"Project lead ID")
    created_by: Optional[uuid.UUID] = Field(description=f"Project creator ID")
    created_at: datetime = Field(description="Project creation time")
    start_date: Optional[datetime] = Field(description="Project start date")
    due_date: Optional[datetime] = Field(description="Project due date")
    updated_at: datetime = Field(description="Project last updated time")
    # Relationships
    lead: Optional["MemberResponse"] = None
    creator: Optional["MemberResponse"] = None


class ProjectTenantResponse(ProjectResponse):
    tenant: Optional["TenantResponse"] = None


class ProjectTasksResponse(ProjectResponse):
    tasks: Optional[list["TaskResponse"]] = Field(
        None, description="Project tasks", alias="tasks",
    )


class ProjectMembersResponse(ProjectResponse):
    members: Optional[list["MemberResponse"]] = None


class ProjectAllResponse(ProjectMembersResponse, ProjectTasksResponse):
    pass


from app.schemas.membership import MemberResponse
from app.schemas.tenant import TenantResponse

# from app.schemas.task import TaskMemberResponse
from app.schemas.task import TaskResponse

ProjectResponse.model_rebuild()
ProjectTenantResponse.model_rebuild()
ProjectTasksResponse.model_rebuild()
ProjectMembersResponse.model_rebuild()
ProjectAllResponse.model_rebuild()
