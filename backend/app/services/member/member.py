import smtplib
import uuid

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import verify_and_get_membership
from app.core.loggin import setup_logger
from app.models.invitation import Invitation
from app.models.membership import Membership, MembershipRole
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.membership import MemberCreate, MemberUpdate
from app.utils.mails import send_invitation_mail

logger = setup_logger(__name__)


def __get_active_members__(
    query: str,
    skip: int,
    limit: int,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    try:
        _, tenant = member_and_tenant

        base_member_query = (
            db.query(Membership)
            .join(User)
            .filter(
                Membership.tenant_id == tenant.id,
                Membership.is_active == True,
                User.email.icontains(query),
            )
            .order_by(Membership.role, Membership.created_at.desc())
        )
        total_members = base_member_query.count()
        members = base_member_query.offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Failed to get active members: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"items": members, "total": total_members, "skip": skip, "limit": limit}


def __add_member__(
    data: MemberCreate,
    background_tasks: BackgroundTasks,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    current_member, tenant = member_and_tenant
    members = set()
    invites = set()
    errors = []

    for email in data.emails:
        # Check for existing member/invitation
        existing_member = (
            db.query(Membership)
            .join(User)
            .filter(
                User.email == email,
                Membership.tenant_id == tenant.id,
                Membership.is_active == True,
            )
            .first()
        )
        if existing_member:
            errors.append(f"Member already exists '{email}'")
            continue

        m_id = uuid.uuid4()
        new_member = Membership(
            id=m_id,
            tenant_id=tenant.id,
        )
        if current_member.role.value == MembershipRole.admin.value:
            new_member.role = data.role
        else:
            new_member.role = MembershipRole.member

        existing_invitation = (
            db.query(Invitation)
            .filter(
                Invitation.email == email,
                Invitation.tenant_id == tenant.id,
                Invitation.is_pending == True,
            )
            .first()
        )
        if existing_invitation:
            errors.append(f"Invitation already exists '{email}'")
            continue

        invitation = Invitation(
            email=email,
            inviter=current_member.user.email,
            tenant_id=tenant.id,
            membership_id=m_id,
        )

        invites.add(invitation)
        members.add(new_member)

    try:
        db.add_all(list(members) + list(invites))
        db.commit()

        background_tasks.add_task(send_invitation_mail, invites)
    except Exception as e:
        logger.error(f"Failed to add member to tenant <{tenant.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {
        "errors": errors,
        "success": (
            f"{len(invites)} Invitation{'s' if len(invites) > 1 else ''} sent successfully"
            if len(invites) > 0
            else None
        ),
    }


def __update_member__(
    member_id: uuid.UUID,
    data: MemberUpdate,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    _, tenant = member_and_tenant
    member = verify_and_get_membership(member_id, tenant.id, db)

    if data.role is not None:
        member.role = data.role

    try:
        db.commit()
    except Exception as e:
        logger.error(f"Failed to update member <{member_id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return member


def __remove_member_or_leave__(
    member_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    _, tenant = member_and_tenant

    member_to_remove = verify_and_get_membership(member_id, tenant.id, db)

    admins = [
        m
        for m in tenant.members
        if m.role.value == MembershipRole.admin.value and m.is_active == True
    ]

    if member_to_remove in admins and len(admins) <= 1:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "A workspace must have at least 1 `admin` to function properly",
        )

    try:
        member_to_remove.is_active = False
        db.delete(member_to_remove)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to remove member <{member_id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )
    return {"detail": "Member leaved/removed successfully"}


def __change_member_role__(
    member_id: uuid.UUID,
    data: MemberUpdate,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    _, tenant = member_and_tenant

    all_members = (
        db.query(Membership)
        .filter(
            Membership.tenant_id == tenant.id,
            Membership.is_active == True,
        )
        .all()
    )
    # members = [m for m in all_members if m.role.value == MembershipRole.member.value]
    admins = [m for m in all_members if m.role.value == MembershipRole.admin.value]

    member_to_change = [m for m in all_members if m.id == member_id][0]
    if not member_to_change:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

    if data.role is not None:
        is_last_admin = (
            member_to_change.role.value == MembershipRole.admin.value
            and data.role.value != MembershipRole.admin.value
            and len(admins) <= 1
        )

        if is_last_admin:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "A workspace must have at least 1 `Admin` to function properly",
            )

        member_to_change.role = data.role

    try:
        db.commit()
    except Exception as e:
        logger.error(f"Failed to change member role <{member_id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )
    return member_to_change
