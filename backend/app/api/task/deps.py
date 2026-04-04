import uuid

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, is_role_member
from app.models.membership import Membership, MembershipRole
from app.models.project import Project
from app.models.task import Task
from app.models.tenant import Tenant


def can_read_task(
    task_id: uuid.UUID,
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
    db: Session = Depends(get_db),
) -> tuple[Membership, Task]:
    """Restrict `READ` operations to members of the project or admins."""
    member, tenant = member_and_tenant
    task = (
        db.query(Task)
        .join(Project)
        .filter(
            Task.id == task_id,
            Task.project_id == Project.id,
            Task.tenant_id == tenant.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    project_member = member in task.project.members
    is_admin = member.role.value == MembershipRole.admin.value

    if not (project_member or is_admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Unauthorized")

    return member, task


def can_update_task(
    member_and_task: tuple[Membership, Task] = Depends(can_read_task),
) -> tuple[Membership, Task]:
    """Restrict `CREATE/UPDATE/DELETE` operations to assignee, lead, creator, or admins."""
    member, task = member_and_task

    is_admin = member.role.value == MembershipRole.admin.value
    is_lead = task.project.lead_id == member.id
    is_creator = member.id == task.created_by
    is_assignee = task.assignee_id == member.id

    if not is_admin and not is_lead and not is_creator and not is_assignee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
        )
    return member, task


def can_delete_task(member_and_task: tuple[Membership, Task] = Depends(can_read_task)):
    """Restrict `DELETE` operations to lead, creator, or admins."""
    member, task = member_and_task

    is_admin = member.role.value == MembershipRole.admin.value
    is_creator = member.id == task.created_by
    is_lead = task.project.lead_id == member.id

    if not is_admin and not is_lead and not is_creator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized"
        )
    return member, task
