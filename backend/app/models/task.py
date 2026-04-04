from __future__ import annotations
from enum import Enum
import uuid

from sqlalchemy import (
    String,
    UUID,
    DateTime,
    Column,
    ForeignKey,
    Enum as SQLAlchemyEnum,
    Text, text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


# TODO : Change name to "TaskStatus"
class TaskStatus(Enum):
    todo = "todo"
    doing = "doing"
    done = "done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, default=uuid.uuid4)
    name = Column(String(99), nullable=False)
    desc = Column(String(999), nullable=True)
    slug = Column(String(299), nullable=False, unique=True, index=True)
    tenant_id = Column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
    )
    status = Column(SQLAlchemyEnum(TaskStatus), nullable=False, default=TaskStatus.todo)
    assignee_id = Column(
        UUID(as_uuid=True),
        ForeignKey("memberships.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("memberships.id", ondelete="SET NULL"),
        nullable=True,
    )
    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    assigned = relationship(
        "Membership", foreign_keys=[assignee_id], back_populates="tasks"
    )
    creator = relationship(
        "Membership", foreign_keys=[created_by], back_populates="tasks"
    )
    project = relationship("Project", foreign_keys=[project_id], back_populates="tasks")
