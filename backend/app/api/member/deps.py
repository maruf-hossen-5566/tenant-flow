import uuid

from fastapi import Depends, HTTPException, status

from app.core.deps import is_role_admin, get_current_membership, is_role_member
from app.models.membership import Membership, MembershipRole
from app.models.tenant import Tenant


def can_read_members(
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
) -> tuple[Membership, Tenant]:
    """Restrict `READ` operations to authenticated tenant members only."""
    return member_and_tenant


def can_create_member(
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
) -> tuple[Membership, Tenant]:
    """Restrict `CREATE` operations to members and admins only."""
    return member_and_tenant


def can_update_member(
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_admin),
) -> tuple[Membership, Tenant]:
    """Restrict `UPDATE` operations to admins only."""
    return member_and_tenant


def can_remove_member(
    member_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
) -> tuple[Membership, Tenant]:
    """Restrict `DELETE` operations for admins or self to leave."""
    member, _ = member_and_tenant

    is_admin = member.role.value == MembershipRole.admin.value
    is_self = member_id == member.id
    if not (is_self or is_admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unauthorized")

    return member_and_tenant
