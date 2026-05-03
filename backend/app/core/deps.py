import uuid
from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import SessionLocal
from app.core.loggin import setup_logger
from app.models.invitation import Invitation
from app.models.membership import Membership, MembershipRole
from app.models.project import Project
from app.models.task import Task
from app.models.tenant import Tenant
from app.models.user import User
from app.utils.validators import email_validate

logger = setup_logger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    """Create and close a database session."""
    db = SessionLocal()
    try:
        yield db
    except:
        db.rollback()
        raise
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Retrieve the current user based on the provided token."""
    try:
        payload = jwt.decode(
            token, settings.ACCESS_SECRET_KEY, settings.TOKEN_ALGORITHM,
        )
        user_id = payload.get("sub")
        if user_id is None:
            logger.error("Failed to decode token: Invalid payload")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid auth credentials",
            )
    except JWTError as e:
        logger.error(f"Failed to decode token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid auth credentials",
        )

    user = db.get(User, UUID(user_id))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid auth credentials",
        )
    return user


def get_current_tenant(
    user: User = Depends(get_current_user),
    tenant_id: uuid.UUID = Header(alias="X-Tenant-ID"),
    db: Session = Depends(get_db),
) -> Tenant:
    """Retrieve the current tenant based on the provided user and tenant ID."""
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tenant not found")

    return tenant


def get_current_membership(
    user: User = Depends(get_current_user),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db),
) -> tuple[Membership, Tenant]:
    """Retrieve the current membership within the current tenant."""

    membership = (
        db.query(Membership)
        .filter(
            Membership.user_id == user.id,
            Membership.tenant_id == tenant.id,
            Membership.is_active == True,
        )
        .first()
    )

    if not membership:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Member not found")

    return membership, tenant


def get_current_project(
    project_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
    db: Session = Depends(get_db),
) -> tuple[Project, Membership]:
    """Retrieve the current project within the current tenant."""
    _, tenant = member_and_tenant
    project = (
        db.query(Project)
        .filter(Project.tenant_id == tenant.id, Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    return member_and_tenant


def is_role_admin(
    membership_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
) -> tuple[Membership, Tenant]:
    """Verify that the current user has admin role in the tenant."""
    membership, _ = membership_and_tenant

    if not (membership.role.value == MembershipRole.admin.value):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized",
        )
    return membership_and_tenant


def is_role_member(
    membership_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
) -> tuple[Membership, Tenant]:
    """Verify that the current user has member role in the tenant."""
    membership, tenant = membership_and_tenant

    if membership.role.value not in (
            MembershipRole.member.value,
            MembershipRole.admin.value,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized",
        )
    return membership, tenant


def verify_and_get_tenant(
    tenant_id: uuid.UUID | str,
    db: Session,
    error_msg: str = "Tenant not found",
) -> Tenant:
    """Verify and retrieve a tenant by ID."""
    tenant = db.get(Tenant, tenant_id)

    if not tenant:
        raise HTTPException(status.HTTP_404_NOT_FOUND, error_msg)

    return tenant


def verify_and_get_user(
    mdel: User,
    obj_email: str,
    db: Session,
) -> User:
    """Verify and retrieve a user by email."""
    email = email_validate(obj_email)
    user = db.query(mdel).filter(mdel.email == email).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"{mdel.__name__} not found")

    return user


def verify_and_get_membership(
    membership_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: Session,
    error_msg: str = "Member not found",
) -> Membership:
    """Verify and retrieve a membership by ID within a tenant."""
    member = (
        db.query(Membership)
        .filter(
            Membership.tenant_id == tenant_id,
            Membership.id == membership_id,
            Membership.is_active == True,
        )
        .first()
    )
    if not member:
        raise HTTPException(status.HTTP_404_NOT_FOUND, error_msg)

    return member


def verify_and_get_project(
    project_id: uuid.UUID | str,
    tenant_id: uuid.UUID | str,
    db: Session,
    error_msg: str = "Project not found",
) -> Project:
    """Verify and retrieve a project by ID within a tenant."""
    project = (
        db.query(Project)
        .filter(
            Project.tenant_id == tenant_id,
            Project.id == project_id,
        )
        .first()
    )
    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, error_msg)

    return project


def verify_and_get_task(
    task_id: uuid.UUID,
    project_id: uuid.UUID,
    db: Session,
    error_msg: str = "Task not found",
) -> Task:
    """Verify and retrieve a task by ID within a project."""
    task = (
        db.query(Task)
        .filter(
            Task.project_id == project_id,
            Task.id == task_id,
        )
        .first()
    )
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND, error_msg)

    return task


def verify_and_get_invitation(
    invite_id: uuid.UUID,
    tenant_id: uuid.UUID,
    db: Session,
    error_msg: str = "Invitation not found",
) -> Invitation:
    """Verify and retrieve an invitation by ID within a tenant."""
    invite = (
        db.query(Invitation)
        .filter(
            Invitation.tenant_id == tenant_id,
            Invitation.id == invite_id,
            Invitation.is_pending == True,
        )
        .first()
    )
    if not invite:
        raise HTTPException(status.HTTP_404_NOT_FOUND, error_msg)

    return invite
