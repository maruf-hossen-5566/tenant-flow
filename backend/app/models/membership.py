import uuid
from enum import Enum

from sqlalchemy import (
    UUID,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint, text,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class MembershipRole(Enum):
    admin = "admin"
    member = "member"
    guest = "guest"


class Membership(Base):
    __tablename__ = "memberships"

    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    tenant_id = Column(
        UUID(as_uuid=True), ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    role = Column(
        SQLAlchemyEnum(MembershipRole), nullable=False, default=MembershipRole.member
    )
    is_active = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    updated_at = Column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

    tenant = relationship("Tenant", foreign_keys=[tenant_id], back_populates="members")
    user = relationship("User", foreign_keys=[user_id], back_populates="memberships")
    invitation = relationship("Invitation", back_populates="membership")
    member_projects = relationship(
        "Project",
        secondary="project_members",
        back_populates="members",
        order_by="Project.updated_at.desc()",
    )
    created_projects = relationship(
        "Project",
        foreign_keys="[Project.created_by]",
        back_populates="creator",
        order_by="Project.created_at",
    )
    leading_projects = relationship(
        "Project",
        foreign_keys="[Project.lead_id]",
        back_populates="lead",
        order_by="Project.created_at",
    )
    tasks = relationship(
        "Task",
        foreign_keys="[Task.assignee_id]",
        back_populates="assigned",
        order_by="Task.created_at",
    )

    # __table_args__ = (UniqueConstraint("user_id", "tenant_id"),)
