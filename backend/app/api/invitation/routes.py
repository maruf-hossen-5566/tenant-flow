import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import (
    get_current_user,
    get_db,
    is_role_admin,
    is_role_member,
    verify_and_get_invitation,
    verify_and_get_tenant,
)
from app.models.invitation import Invitation
from app.models.membership import Membership
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.invitation import InvitationResponse
from app.schemas.pagination import PaginatedResponse
from app.schemas.tenant import TenantResponse
from app.services.invitation.invitation import (
    __get_pending_invites__,
    __accept_invite__,
    __get_my_invitations__,
    __delete_invite__,
    __get_invite_info__,
)

router = APIRouter()


@router.get("/pending", response_model=PaginatedResponse[InvitationResponse])
def get_pending_invites(
    query: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    membership_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
    db: Session = Depends(get_db),
):
    """
    Get all the pending invitations for the current tenant.

    Parameters
    ----------
    query : str
        Query for filter the invitations
    skip : int
        Limit the number of invitations to skip
    limit : int
        Limit the number of invitations to return
    membership_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant, validated by is_role_member
    db : Session
        Database session

    Returns
    -------
    PaginatedResponse[InvitationResponse]
        Paginated response containing the pending invitations
    """
    return __get_pending_invites__(query, skip, limit, membership_and_tenant, db)


@router.get("/", response_model=list[InvitationResponse])
def get_my_invitations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get all the invitations for the current user.

    Parameters
    ----------
    current_user : User,
        Current authenticated user
    db : Session
        Database session

    Returns
    -------
    list[InvitationResponse]
        List of invitations for the current user
    """
    return __get_my_invitations__(current_user, db)


@router.post("/{invitation_id}/accept-invite", response_model=TenantResponse)
def accept_invite(
    invitation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Accept an invitation for the current user.

    Parameters
    ----------
    invitation_id : uuid.UUID
        The invitation ID to accept
    current_user : User
        Current authenticated user
    db : Session, optional
        Database session

    Returns
    -------
    TenantResponse
        The tenant associated with the invitation
    """
    return __accept_invite__(invitation_id, current_user, db)


@router.get("/{invitation_id}", response_model=InvitationResponse)
def get_invite_info(
    invitation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get the invitation information for the current user.

    Parameters
    ----------
    invitation_id : uuid.UUID
        The invitation ID to get information for
    current_user : User
        Current authenticated user
    db : Session, optional
        Database session

    Returns
    -------
    InvitationResponse
        The invitation information for the current user
    """
    return __get_invite_info__(invitation_id, current_user, db)


@router.delete("/{invitation_id}")
def delete_invite(
    invitation_id: uuid.UUID,
    membership_and_tenant: tuple[Membership, Tenant] = Depends(is_role_admin),
    db: Session = Depends(get_db),
):
    """
    Delete an invitation for the current user.

    Parameters
    ----------
    invitation_id : uuid.UUID
        The invitation ID to delete
    membership_and_tenant : tuple[Membership, Tenant]
        The current membership and tenant, validated by is_role_admin
    db : Session, optional
        Database session

    Returns
    -------
    InvitationResponse
        The invitation information for the current user
    """
    return __delete_invite__(invitation_id, membership_and_tenant, db)
