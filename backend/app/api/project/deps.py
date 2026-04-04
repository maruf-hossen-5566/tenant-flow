import uuid

from fastapi import Depends, HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session, contains_eager, joinedload, with_loader_criteria

from app.core.deps import is_role_member, get_db, get_current_membership
from app.models.membership import Membership
from app.models.membership import MembershipRole
from app.models.project import Project
from app.models.tenant import Tenant
from app.models.user import User


def can_read_project(
    project_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
    db: Session = Depends(get_db),
) -> tuple[Project, Membership]:
    """Restrict `READ` operations to members of the project or admins."""
    member, tenant = member_and_tenant

    project = (
        db.query(Project)
        .options(
            with_loader_criteria(
                Membership,
                Membership.is_active == True,
            ),
        )
        .get(project_id)
    )

    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    project_member = member in project.members
    tenant_admin = member.role.value == MembershipRole.admin.value

    if not (project_member or tenant_admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unauthorized")

    return project, member


def can_create_project(
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
) -> tuple[Membership, Tenant]:
    """Restrict `CREATE` operations to admins only."""
    member, tenant = member_and_tenant
    return member, tenant


def can_update_or_delete_project(
    project_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
    db: Session = Depends(get_db),
) -> tuple[Project, Membership]:
    """Restrict `UPDATE/DELETE` operations to project creator, lead, or admins."""
    member, _ = member_and_tenant

    project = (
        db.query(Project)
        .options(
            with_loader_criteria(
                Membership,
                Membership.is_active == True,
            ),
        )
        .get(project_id)
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    project_creator = project.created_by == member.id
    project_lead = project.lead_id == member.id
    tenant_admin = member.role.value == MembershipRole.admin.value

    if not (project_creator or project_lead or tenant_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
        )
    return project, member


def can_remove_member(
    project_id: uuid.UUID,
    member_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
    db: Session = Depends(get_db),
) -> tuple[Project, Membership]:
    """Restrict `DELETE` operations for admins or self to leave the project."""
    member, tenant = member_and_tenant

    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.tenant_id == tenant.id)
        .first()
    )
    if not project:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Project not found")

    member_to_remove = (
        db.query(Membership)
        .filter(Membership.id == member_id, Membership.tenant_id == project.tenant_id)
        .first()
    )
    if not member_to_remove:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

    if member_to_remove not in project.members:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Member is not a project member")

    is_self = member_to_remove == member
    project_creator = project.created_by == member.id
    project_lead = project.lead_id == member.id
    tenant_admin = member.role.value == MembershipRole.admin.value

    if not (is_self or project_creator or project_lead or tenant_admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unauthorized")

    return project, member_to_remove
