from enum import Enum
import uuid

from sqlalchemy import (
    Boolean,
    String,
    UUID,
    DateTime,
    Column,
    Text,
    ForeignKey,
    Enum as SQLAlchemyEnum,
    UniqueConstraint,
    Integer, text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.db import Base


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(199), nullable=False)
    inviter = Column(String(199), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    membership_id = Column(UUID(as_uuid=True), ForeignKey("memberships.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))
    expires_at = Column(DateTime(timezone=True), server_default=text("now() + interval '1 day'"))
    resend_count = Column(Integer, default=0)
    is_pending = Column(Boolean, nullable=False, default=True)

    tenant = relationship("Tenant", foreign_keys=[tenant_id], back_populates="invitations")
    membership = relationship("Membership", foreign_keys=[membership_id], back_populates="invitation")

    # __table_args__ = (UniqueConstraint("email", "tenant_id", "status"),)
