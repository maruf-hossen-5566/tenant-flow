import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.member.deps import (
    can_create_member,
    can_read_members,
    can_remove_member,
    can_update_member,
)
from app.core.deps import (
    get_current_membership,
    get_db,
    verify_and_get_membership,
)
from app.models.invitation import Invitation
from app.models.membership import (
    Membership,
)
from app.models.membership import (
    MembershipRole as MembershipRole,
)
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.invitation import InvitationResponse
from app.schemas.membership import (
    MemberCreate,
    MemberProjectsResponse,
    MemberResponse,
    MemberUpdate,
)
from app.schemas.pagination import PaginatedResponse
from app.services.member.member import (
    __add_member__,
    __change_member_role__,
    __get_active_members__,
    __remove_member_or_leave__,
    __update_member__,
)
from app.utils.mails import send_invitation_mail

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[MemberProjectsResponse])
def get_active_members(
    query: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_read_members),
    db: Session = Depends(get_db),
):
    """
    Get all the active members for the current tenant.

    Parameters
    ----------
    query : str
        Search query for filtering the members
    skip : int
        Limit the number of members to skip
    limit : int
        Limit the number of members to return
    member_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant
    db : Session
        Database session

    Returns
    -------
    PaginatedResponse[MemberProjectsResponse]
        Paginated response containing the active members
    """
    return __get_active_members__(query, skip, limit, member_and_tenant, db)


@router.get("/current-member", response_model=MemberResponse)
def get_member_details(
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
):
    """
    Get details of the current authenticated member

    Parameters
    ----------
    member_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant

    Returns
    -------
    MemberResponse
        The current member's details
    """

    member, _ = member_and_tenant
    return member


@router.post("/")
async def add_member(
    data: MemberCreate,
    background_tasks: BackgroundTasks,
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_create_member),
    db: Session = Depends(get_db),
):
    """
    Add new members to a tenant by sending invitations.

    Parameters
    ----------
    data : MemberCreate
        MemberCreate containing a list of email addresses and the role to assign
    background_tasks : BackgroundTasks
        FastAPI background tasks for sending invitation emails asynchronously
    member_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant
    db : Session
        Database session

    Returns
    -------
    dict
        Dict containing:
            - errors: List of error messages for failed invitations (e.g., duplicates)
            - success: Success message with count of invitations sent, or None if no invitations sent
    """
    return __add_member__(data, background_tasks, member_and_tenant, db)


@router.put("/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: uuid.UUID,
    data: MemberUpdate,
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_update_member),
    db: Session = Depends(get_db),
):
    """
    Update a member's details in a tenant.

    Parameters
    ----------
    member_id : uuid.UUID
        The ID of the member to update
    data : MemberUpdate
        The updated member details
    member_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant
    db : Session
        Database session

    Returns
    -------
    MemberResponse
        The updated member's details
    """

    return __update_member__(member_id, data, member_and_tenant, db)


@router.delete("/{member_id}")
def remove_member_or_leave(
    member_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_remove_member),
    db: Session = Depends(get_db),
):
    """
    Member remove or leave a tenant.

    Parameters
    ----------
    member_id : uuid.UUID
        ID of the member to remove or leave
    member_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant
    db : Session
        Database session

    Returns
    -------
    dict:
        - detail: Success message
    """
    return __remove_member_or_leave__(member_id, member_and_tenant, db)


@router.put("/{member_id}/change-role", response_model=MemberResponse)
def change_member_role(
    member_id: uuid.UUID,
    data: MemberUpdate,
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_update_member),
    db: Session = Depends(get_db),
):
    """
    Change a member's role.

    Parameters
    ----------
    member_id: uuid.UUID
        The ID of the member to change role
    data: MemberUpdate
        The updated member details
    member_and_tenant: tuple[Membership, Tenant]
        The current membership and tenant
    db:
        Database session

    Returns
    -------
    MemberResponse:
        The updated member's details

    """

    return __change_member_role__(member_id, data, member_and_tenant, db)
