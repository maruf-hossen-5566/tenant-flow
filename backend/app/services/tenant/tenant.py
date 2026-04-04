import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.loggin import setup_logger
from app.models.membership import Membership, MembershipRole
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.tenant import TenantCreate, TenantUpdate
from app.utils.helpers import create_slug

logger = setup_logger(__name__)


def __get_working_tenants__(
    user: User,
    db: Session,
):
    tenants = (
        db.query(Tenant)
        .join(Membership)
        .filter(
            Membership.user_id == user.id,
            Membership.is_active == True,
        )
        .order_by(Tenant.created_at.desc())
        .all()
    )

    return tenants


def __get_created_tenants__(
    user: User,
    db: Session,
):
    tenants = (
        db.query(Tenant)
        .filter(Tenant.created_by == user.id)
        .order_by(Tenant.created_at.desc())
        .all()
    )
    return tenants


def __create_tenant__(data: TenantCreate, user: User, db: Session):
    logger.info(f"Tenant creation attempts by <{user.email}>")

    tenant = Tenant(
        id=uuid.uuid4(),
        name=data.name,
        slug=create_slug(data.name),
        created_by=user.id,
    )
    member = Membership(
        user_id=user.id,
        tenant_id=tenant.id,
        role=MembershipRole.admin,
        is_active=True,
    )

    try:
        db.add_all([tenant, member])
        db.commit()
    except (SQLAlchemyError, Exception) as e:
        logger.error(f"Failed to create tenant by <{user.email}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return tenant


def __update_tenant__(data: TenantUpdate, tenant: Tenant, db: Session):
    logger.info(f"Attempt to update tenant <{tenant.id}>")

    try:
        if data.name is not None:
            tenant.name = data.name

        db.commit()
    except (SQLAlchemyError, Exception) as e:
        logger.error(f"Failed to update tenant <{tenant.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, Please try again later",
        )

    return tenant


def __delete_tenant__(tenant: Tenant, db: Session):
    logger.info(f"Tenant deletion attempt <{tenant.id}>")

    try:
        db.delete(tenant)
        db.commit()
    except (SQLAlchemyError, Exception) as e:
        logger.error(f"Failed to delete tenant <{tenant.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, Please try again later",
        )
    return {"detail": "Tenant has been deleted"}
