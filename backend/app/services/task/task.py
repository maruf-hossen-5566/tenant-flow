from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import verify_and_get_membership, verify_and_get_project
from app.core.loggin import setup_logger
from app.models.membership import Membership
from app.models.project import Project
from app.models.task import Task
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.task import FilterBy, TaskCreate, TaskUpdate
from app.utils.helpers import create_slug

logger = setup_logger(__name__)


def __get_all_tasks__(
    query: str,
    skip: int,
    limit: int,
    filter_by: FilterBy,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    try:
        member, tenant = member_and_tenant

        base_tasks_query = db.query(Task).filter(
            Task.tenant_id == tenant.id,
            or_(
                Task.name.icontains(query),
                Task.assigned.has(Membership.user.has(User.email.icontains(query))),
            ),
        )

        if filter_by == "created":
            task_query = base_tasks_query.filter(Task.created_by == member.id)
        elif filter_by == "assigned":
            task_query = base_tasks_query.filter(Task.assignee_id == member.id)
        else:
            task_query = base_tasks_query

        total_tasks = task_query.count()
        tasks = (
            task_query.order_by(Task.created_at.desc()).offset(skip).limit(limit).all()
        )
    except Exception as e:
        logger.error(f"Failed to get tasks of tenant <{member_and_tenant[-1].id}>:{e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again",
        )

    return {"items": tasks, "total": total_tasks, "skip": skip, "limit": limit}


def __get_tasks__(
    query: str,
    skip: int,
    limit: int,
    project_and_tenant: tuple[Project, Tenant],
    db: Session,
):
    try:
        project, _ = project_and_tenant

        base_tasks_query = (
            db.query(Task)
            .filter(
                Task.project_id == project.id,
                Task.tenant_id == project.tenant_id,
                or_(
                    Task.name.icontains(query),
                    Task.assigned.has(Membership.user.has(User.email.icontains(query))),
                ),
            )
            .order_by(Task.created_at.desc())
        )

        total_tasks = base_tasks_query.count()
        tasks = base_tasks_query.offset(skip).limit(limit).all()

    except Exception as e:
        logger.error(f"Failed to get tasks for <{project_and_tenant[0].id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )
    return {"items": tasks, "total": total_tasks, "skip": skip, "limit": limit}


def __create_task__(
    data: TaskCreate,
    member_and_tenant: tuple[Membership, Tenant],
    db: Session,
):
    logger.info(f"Attempt to create task by member <{member_and_tenant[0].id}>")
    member, tenant = member_and_tenant
    task = Task(
        name=data.name,
        slug=create_slug(data.name),
        desc=data.desc,
        tenant_id=tenant.id,
        created_by=member.id,
    )
    project = verify_and_get_project(data.project_id, tenant.id, db)
    task.project_id = project.id

    if data.assignee_id is not None:
        assignee = verify_and_get_membership(
            data.assignee_id,
            tenant.id,
            db,
            "Assignee not found",
        )
        if assignee not in project.members:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Assignee not found, Assignee must be a member of the project",
            )
        task.assignee_id = assignee.id

    task.start_date = data.start_date
    task.due_date = data.due_date

    try:
        db.add(task)
        db.commit()
    except Exception as e:
        logger.error(f"Failed to create task by <{member.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return task


def __update_task__(
    data: TaskUpdate,
    member_and_task: tuple[Membership, Task],
    db: Session,
):
    logger.info(f"Attempt to update task <{member_and_task[-1].id}>")

    _, task = member_and_task

    if data.name is not None:
        task.name = data.name

    if data.desc is not None:
        task.desc = data.desc

    if data.assignee_id is not None:
        task.assignee_id = data.assignee_id
    else:
        task.assignee_id = None

    task.start_date = data.start_date
    task.due_date = data.due_date
    task.status = data.status

    try:
        db.commit()
    except Exception as e:
        logger.error(f"Failed to update task <{task.id}>:{e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR, "Something went wrong",
        )
    return task


def __delete_task__(
    member_and_task: tuple[Membership, Task],
    db: Session,
):
    _, task = member_and_task
    logger.info(f"Attempt delete task <{task.id}>")

    try:
        db.delete(task)
        db.commit()

    except Exception as e:
        logger.error(f"Failed to delete task <{task.id}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {"detail": "Task has been deleted"}
