from fastapi import Depends

from app.core.deps import is_role_admin
from app.models.membership import Membership
from app.models.tenant import Tenant


def can_update_or_delete_tenant(
    membership_and_tenant: tuple[type[Membership], Tenant] = Depends(is_role_admin)
) -> Tenant:
    """Restrict `UPDATE/DELETE` operations to admins only."""
    _, tenant = membership_and_tenant

    return tenant
