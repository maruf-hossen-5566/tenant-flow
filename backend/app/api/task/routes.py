from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.project.deps import can_read_project
from app.api.task.deps import (
    can_delete_task,
    can_update_task,
)
from app.core.deps import (
    get_db,
    is_role_member,
)
from app.models.membership import Membership
from app.models.project import Project
from app.models.task import Task
from app.models.tenant import Tenant
from app.schemas.pagination import PaginatedResponse
from app.schemas.task import (
    FilterBy,
    TaskAllResponse,
    TaskCreate,
    TaskUpdate,
)
from app.services.task.task import (
    __create_task__,
    __delete_task__,
    __get_all_tasks__,
    __get_tasks__,
    __update_task__,
)

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[TaskAllResponse])
def get_all_tasks(
    query: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=20),
    filter_by: FilterBy = Query(FilterBy.all),
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
    db: Session = Depends(get_db),
):
    """
    Retrieve all tasks across projects with optional filtering.

    Parameters
    ----------
    query : str
        Search query to filter tasks.
    skip : int
        Number of tasks to skip.
    limit : int
        Maximum number of tasks to return.
    filter_by : FilterBy
        Criteria to filter tasks (e.g., by status).
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.
    db : Session
        Database session.

    Returns
    -------
    PaginatedResponse[TaskAllResponse]
        Paginated response containing tasks.
    """
    return __get_all_tasks__(query, skip, limit, filter_by, member_and_tenant, db)


@router.get("/{project_id}", response_model=PaginatedResponse[TaskAllResponse])
def get_tasks(
    query: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=20),
    project_and_tenant: tuple[Project, Tenant] = Depends(can_read_project),
    db: Session = Depends(get_db),
):
    """
    Retrieve tasks for a specific project.

    Parameters
    ----------
    query : str
        Search query to filter tasks.
    skip : int
        Number of tasks to skip.
    limit : int
        Maximum number of tasks to return.
    project_and_tenant : tuple[Project, Tenant]
        Current project and tenant.
    db : Session
        Database session.

    Returns
    -------
    PaginatedResponse[TaskAllResponse]
        Paginated response containing project tasks.
    """
    return __get_tasks__(query, skip, limit, project_and_tenant, db)


@router.post("/", response_model=TaskAllResponse)
def create_task(
    data: TaskCreate,
    member_and_tenant: tuple[Membership, Tenant] = Depends(is_role_member),
    db: Session = Depends(get_db),
):
    """
    Create a new task.

    Parameters
    ----------
    data : TaskCreate
        Data required to create a new task.
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.
    db : Session
        Database session.

    Returns
    -------
    TaskAllResponse
        Response containing details of the created task.
    """
    return __create_task__(data, member_and_tenant, db)


@router.put("/{task_id}/{project_id}", response_model=TaskAllResponse)
def update_task(
    data: TaskUpdate,
    member_and_task: tuple[Membership, Task] = Depends(can_update_task),
    db: Session = Depends(get_db),
):
    """
    Update an existing task.

    Parameters
    ----------
    data : TaskUpdate
        Data required to update a task.
    member_and_task : tuple[Membership, Task]
        Current membership and task details.
    db : Session
        Database session.

    Returns
    -------
    TaskAllResponse
        Response containing details of the updated task.
    """
    return __update_task__(data, member_and_task, db)


@router.delete("/{task_id}/{project_id}")
def delete_task(
    member_and_task: tuple[Membership, Task] = Depends(can_delete_task),
    db: Session = Depends(get_db),
):
    """
    Delete a specific task.

    Parameters
    ----------
    member_and_task : tuple[Membership, Task]
        Current membership and task details.
    db : Session
        Database session.

    Returns
    -------
    dict
        Response confirming the deletion of the task.
    """
    return __delete_task__(member_and_task, db)
