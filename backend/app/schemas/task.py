from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FilterBy(str, Enum):
    all = "all"
    created = "created"
    assigned = "assigned"


class TaskStatus(str, Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


class TaskBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(..., min_length=3, max_length=299, description="Task name")
    desc: Optional[str] = Field("", description="Task description")
    assignee_id: Optional[uuid.UUID] = Field(None, description="Task assignee")
    start_date: Optional[datetime] = Field(None, description="Task start data")
    due_date: Optional[datetime] = Field(None, description="Task due data")
    status: Optional[TaskStatus] = Field(None, description="Task current status")

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


class TaskCreate(TaskBase):
    project_id: uuid.UUID = Field(description="Task belonging project")


class TaskUpdate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: uuid.UUID
    created_by: uuid.UUID
    project_id: uuid.UUID
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    start_date: Optional[datetime]
    due_date: Optional[datetime]


class TaskAssigneeResponse(TaskResponse):
    assigned: Optional["MemberResponse"] = None


class TaskCreatorResponse(TaskResponse):
    creator: Optional["MemberResponse"] = None


class TaskProjectsResponse(TaskResponse):
    project: Optional["ProjectResponse"] = None


class TaskAllResponse(TaskCreatorResponse, TaskAssigneeResponse, TaskProjectsResponse):
    pass


from app.schemas.membership import MemberResponse
from app.schemas.project import ProjectResponse

TaskResponse.model_rebuild()
TaskAssigneeResponse.model_rebuild()
TaskCreatorResponse.model_rebuild()
TaskProjectsResponse.model_rebuild()
TaskAllResponse.model_rebuild()
