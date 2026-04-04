import uuid
from enum import Enum

from sqlalchemy import (
    UUID,
    Column,
    DateTime,
    ForeignKey,
    String,
)
from sqlalchemy import (
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, unique=True, default=uuid.uuid4)
    name = Column(String(299), nullable=False)
    slug = Column(String(299), nullable=False, unique=True, index=True)
    created_by = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    invitations = relationship(
        "Invitation", cascade="all, delete", back_populates="tenant"
    )
    creator = relationship("User", back_populates="created_tenants")
    members = relationship(
        "Membership",
        cascade="all, delete",
        back_populates="tenant",
        order_by="Membership.created_at",
    )
    projects = relationship(
        "Project",
        cascade="all, delete",
        back_populates="tenant",
        order_by="Project.created_at",
    )
