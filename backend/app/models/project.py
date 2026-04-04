import uuid
from enum import Enum

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    Table,
    Text, text,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class ProjectMembers(Base):
    __tablename__ = "project_members"
    project_id = Column(
        UUID(as_uuid=True),
        ForeignKey("projects.id", ondelete="CASCADE"),
        primary_key=True,
    )
    member_id = Column(
        UUID(as_uuid=True),
        ForeignKey("memberships.id", ondelete="CASCADE"),
        primary_key=True,
    )


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, default=uuid.uuid4)
    slug = Column(String(299), nullable=False, unique=True, index=True)
    name = Column(String(99), nullable=False)
    desc = Column(String(999), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False)
    lead_id = Column(UUID(as_uuid=True), ForeignKey("memberships.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("memberships.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    start_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    members = relationship(
        "Membership",
        secondary="project_members",
        back_populates="member_projects",
        order_by="Membership.created_at",
    )
    creator = relationship(
        "Membership", foreign_keys=[created_by], back_populates="created_projects"
    )
    lead = relationship(
        "Membership", foreign_keys=[lead_id], back_populates="leading_projects"
    )
    tasks = relationship(
        "Task",
        foreign_keys="[Task.project_id]",
        back_populates="project",
        cascade="all, delete",
        order_by="Task.created_at",
    )
    tenant = relationship("Tenant", foreign_keys=[tenant_id], back_populates="projects")
