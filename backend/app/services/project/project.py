import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import verify_and_get_membership
from app.core.loggin import setup_logger
from app.models.membership import Membership
from app.models.project import Project, ProjectMembers
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.utils.helpers import create_slug

logger = setup_logger(__name__)


def __get_tenant_projects__(
    skip: int,
    limit: int,
    query: str,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    try:
        _, tenant = member_and_tenant

        base_project_query = (
            db.query(Project)
            .filter(
                Project.tenant_id == tenant.id,
                Project.name.icontains(query),
            )
            .order_by(Project.created_at.desc())
        )
        total = base_project_query.count()
        projects = base_project_query.offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(
            f"Failed to get projects for tenant <{member_and_tenant[-1].id}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"items": projects, "total": total, "skip": skip, "limit": limit}


def __get_working_projects__(
    member_and_tenant: tuple[Membership, Tenant],
):
    try:
        member, _ = member_and_tenant
        return member.member_projects
    except Exception as e:
        logger.error(
            f"Failed to get projects for member <{member_and_tenant[0].id}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )


def __create_project__(
    data: ProjectCreate,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    member, tenant = member_and_tenant
    project = Project(
        name=data.name,
        desc=data.desc,
        tenant_id=tenant.id,
        slug=create_slug(data.name),
        created_by=member.id,
    )

    if data.start_date is not None:
        project.start_date = data.start_date  # type: ignore

    if data.due_date is not None:
        project.due_date = data.due_date  # type: ignore

    data.members.add(member.id)

    member_ids = set(data.members)
    if data.lead_id is not None:
        lead = verify_and_get_membership(data.lead_id, tenant.id, db, "Lead not found")  # type: ignore
        project.lead_id = lead.id
        member_ids.add(lead.id)

    for m_id in member_ids:
        _member = verify_and_get_membership(m_id, tenant.id, db)
        project.members.append(_member)

    try:
        db.add(project)
        db.commit()
    except Exception as e:
        logger.error(
            f"Failed to create project in tenant <{member_and_tenant[-1].id}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return project


def __update_project__(
    data: ProjectUpdate,
    project_and_member: tuple[Project, Membership],
    db: Session,
):
    project, _ = project_and_member

    project.name = data.name
    project.slug = create_slug(data.name)

    project.desc = data.desc

    project.start_date = data.start_date
    project.due_date = data.due_date

    member_ids = set(data.members)

    if data.lead_id is not None:
        lead = verify_and_get_membership(
            data.lead_id, project.tenant_id, db, "Lead not found",
        )
        project.lead_id = lead.id
        member_ids.add(lead.id)
    else:
        project.lead_id = None

    project.members.clear()
    for m_id in member_ids:
        _member = verify_and_get_membership(m_id, project.tenant_id, db)
        if _member not in member_ids:
            project.members.append(_member)

    try:
        db.commit()
    except Exception as e:
        logger.error(f"Failed to update project <{project_and_member[0].id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )
    return project


def __delete_project__(
    project_and_member: tuple[Project, Membership],
    db: Session,
):
    logger.info(f"Attempt to delete project <{project_and_member[0].id}>")
    try:
        project, _ = project_and_member

        db.delete(project)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to delete project <{project_and_member[0].id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"detail": "Project deleted successfully"}


def __get_project_members__(
    query: str,
    skip: int,
    limit: int,
    project_and_member: tuple[Project, Membership],
    db: Session,
):
    try:
        project, _ = project_and_member

        # This suggestion I got from AI/Mistral
        base_member_query = (
            db.query(Membership)
            .join(ProjectMembers, ProjectMembers.member_id == Membership.id)
            .join(Project, ProjectMembers.project_id == project.id)
            .join(User)
            .filter(
                Project.id == project.id,
                User.name.icontains(query),
                Membership.is_active == True,
            )
            .order_by(Membership.updated_at)
        )
        members = base_member_query.offset(skip).limit(limit).all()
        total_members = base_member_query.count()
    except Exception as e:
        logger.error(
            f"Failed to get members of project <{project_and_member[0].id}>:{e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"items": members, "total": total_members, "skip": skip, "limit": limit}


def __join_project__(
    project_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    member, tenant = member_and_tenant
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.tenant_id == tenant.id)
        .first()
    )

    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    try:
        if member in project.members:
            project.members.remove(member)
        else:
            project.members.append(member)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to join project <{project_id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return project


def __remove_project_member__(
    project_and_member: tuple[Project, Membership],
    db: Session,
):
    project, member = project_and_member

    project.members.remove(member)

    try:
        db.commit()
        return {"detail": "Member removed successfully"}
    except Exception as e:
        logger.error(f"Failed to remove/leave member <{member.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )
