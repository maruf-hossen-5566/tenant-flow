from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class InvitationBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class InvitationResponse(InvitationBase):
    id: uuid.UUID
    email: EmailStr
    inviter: EmailStr
    created_at: datetime
    expires_at: datetime
    is_pending: bool
    resend_count: int
    tenant: Optional["TenantResponse"] = None


from app.schemas.membership import MemberResponse
from app.schemas.tenant import TenantResponse

InvitationResponse.model_rebuild()
