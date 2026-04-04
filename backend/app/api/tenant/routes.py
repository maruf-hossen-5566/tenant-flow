from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.tenant.deps import can_update_or_delete_tenant
from app.core.deps import (
    get_current_tenant,
    get_current_user,
    get_db,
    is_role_admin,
)
from app.models.membership import (
    Membership,
)
from app.models.membership import (
    MembershipRole as MembershipRole,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tenant import TenantCreate, TenantResponse, TenantUpdate
from app.services.tenant.tenant import (
    __create_tenant__,
    __delete_tenant__,
    __get_created_tenants__,
    __get_working_tenants__,
    __update_tenant__,
)

router = APIRouter()


@router.get("/", response_model=list[TenantResponse])
def get_working_tenants(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all active tenants where the current user has an active membership.

    Parameters
    ----------
    user : User
            The currently authenticated user
    db : Session
            Database session

    Returns
    -------
    list[TenantResponse]
            List of active tenants associated with the user, ordered by creation date (newest first)
    """

    return __get_working_tenants__(user, db)


@router.get("/details", response_model=TenantResponse)
def get_current_tenant_details(
    tenant: Tenant = Depends(get_current_tenant),
    _: tuple[Membership, Tenant] = Depends(is_role_admin),
):
    """
    Get detailed information about the current tenant.

    Parameters
    ----------
    tenant : Tenant
            The current tenant from context
    _ : tuple[Membership, Tenant]
            Admin role validation dependency

    Returns
    -------
    TenantResponse
            Detailed information about the current tenant
    """

    return tenant


@router.get("/created", response_model=list[TenantResponse])
def get_created_tenants(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all active tenants created by the current user.

    Parameters
    ----------
    user : User
            The currently authenticated user
    db : Session
            Database session

    Returns
    -------
    list[TenantResponse]
            List of active tenants created by the user, ordered by creation date (newest first)
    """

    return __get_created_tenants__(user, db)


@router.post("/", response_model=TenantResponse)
def create_tenant(
    data: TenantCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a new tenant and assign the current user as admin.

    Parameters
    ----------
    data : TenantCreate
            Tenant creation data containing the name
    user : User
            The currently authenticated user
    db : Session
            Database session

    Returns
    -------
    TenantResponse
            The newly created tenant with admin membership for the user
    """

    return __create_tenant__(data, user, db)


@router.put("/", response_model=TenantResponse)
def update_tenant(
    data: TenantUpdate,
    tenant: Tenant = Depends(can_update_or_delete_tenant),
    db: Session = Depends(get_db),
):
    """
    Update the current tenant's information.

    Requires admin role on the tenant.

    Parameters
    ----------
    data : TenantUpdate
            Updated tenant data (name and/or status)
    tenant : Tenant
            The tenant to update (validated for admin access)
    db : Session
            Database session

    Returns
    -------
    TenantResponse
            The updated tenant
    """
    return __update_tenant__(data, tenant, db)


@router.delete("/")
def delete_tenant(
    tenant: Tenant = Depends(can_update_or_delete_tenant),
    db: Session = Depends(get_db),
):
    """
    Delete a tenant by marking it as deleted.

    Requires admin role on the tenant.

    Parameters
    ----------
    tenant : Tenant
            The tenant to delete (validated for admin access)
    db : Session
            Database session

    Returns
    -------
    dict
            Success message confirming tenant deletion
    """

    return __delete_tenant__(tenant, db)
