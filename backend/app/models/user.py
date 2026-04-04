import datetime
import uuid

from sqlalchemy import UUID, Boolean, Column, DateTime, String, func, text
from sqlalchemy.orm import relationship

from app.core.db import Base
from app.models.membership import Membership


class User(Base):
    __tablename__ = "users"
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        index=True,
        unique=True,
        default=uuid.uuid4,
    )
    name = Column(String(99), nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String(299), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_superuser = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=text("now()"))
    updated_at = Column(
        DateTime, nullable=False, server_default=text("now()"), onupdate=text("now()")
    )

    created_tenants = relationship("Tenant", back_populates="creator")
    memberships = relationship("Membership", back_populates="user")
