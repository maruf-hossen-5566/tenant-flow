import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import verify_and_get_invitation, verify_and_get_tenant
from app.core.loggin import setup_logger
from app.models.invitation import Invitation
from app.models.membership import Membership
from app.models.tenant import Tenant
from app.models.user import User

logger = setup_logger(__name__)


def __get_pending_invites__(
    query: str,
    skip: int,
    limit: int,
    membership_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    try:
        _, tenant = membership_and_tenant

        base_invite_query = (
            db.query(Invitation)
            .filter(
                Invitation.tenant_id == tenant.id,
                Invitation.email.icontains(query),
                Invitation.is_pending == True,
            )
            .order_by(Invitation.created_at.desc())
        )
        total_invites = base_invite_query.count()
        invites = base_invite_query.offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(
            f"Failed to get pending invites for tenant <{membership_and_tenant[-1].id}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"items": invites, "total": total_invites, "skip": skip, "limit": limit}


def __get_my_invitations__(
    current_user: User,
    db: Session,
):
    try:
        invites = (
            db.query(Invitation)
            .filter(
                Invitation.email == current_user.email,
                Invitation.is_pending == True,
                datetime.now(timezone.utc) < Invitation.expires_at,
            )
            .all()
        )
    except Exception as e:
        logger.error(f"Failed to get invitations for user <{current_user.email}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return invites


def __accept_invite__(
    invitation_id: uuid.UUID,
    current_user: User,
    db: Session,
):
    invite_ins = (
        db.query(Invitation)
        .filter(
            Invitation.id == invitation_id,
            Invitation.email == current_user.email,
            Invitation.is_pending == True,
        )
        .with_for_update()
        .first()
    )

    if not invite_ins:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid invitation link")
    if datetime.now(timezone.utc) > invite_ins.expires_at:
        raise HTTPException(status.HTTP_410_GONE, "Invalid invitation link")

    tenant = verify_and_get_tenant(invite_ins.tenant_id, db)
    membership = (
        db.query(Membership)
        .filter(
            Membership.tenant_id == tenant.id,
            Membership.id == invite_ins.membership_id,
            Membership.is_active == False,
        )
        .first()
    )
    if not membership:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Membership not found")

    try:
        membership.user_id = current_user.id
        membership.is_active = True

        invite_ins.is_pending = False
        db.delete(invite_ins)
        db.commit()
    except Exception as e:
        logger.error(
            f"Failed to accept invitation for user <{current_user.email}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return tenant


def __get_invite_info__(
    invitation_id: uuid.UUID,
    current_user: User,
    db: Session,
):
    invitation = (
        db.query(Invitation)
        .filter(
            Invitation.id == invitation_id,
            Invitation.email == current_user.email,
            Invitation.is_pending == True,
            datetime.now(timezone.utc) < Invitation.expires_at,
        )
        .first()
    )

    if not invitation:
        logger.error(
            f"Failed to get invitation info for user <{current_user.email}>: Invitation not found",
        )
        raise HTTPException(status.HTTP_410_GONE, "Invalid invitation link")

    return invitation


def __delete_invite__(
    invitation_id: uuid.UUID,
    membership_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    logger.info(f"Attempt to delete invitation <{invitation_id}>")
    _, tenant = membership_and_tenant

    invitation = verify_and_get_invitation(invitation_id, tenant.id, db)
    member = (
        db.query(Membership)
        .join(Invitation)
        .filter(
            Membership.id == invitation.membership_id,
            Membership.is_active == False,
            Invitation.is_pending == True,
        )
        .first()
    )

    try:
        invitation.is_pending = False
        db.delete(member)
        db.delete(invitation)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to delete invitation <{invitation_id}>: {e}")
    return {"detail": "Invitation deleted successfully"}
