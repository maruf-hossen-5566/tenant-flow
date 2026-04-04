import uuid
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.api.member.deps import can_read_members
from app.api.project.deps import (
    can_create_project,
    can_read_project,
    can_remove_member,
    can_update_or_delete_project,
)
from app.core.deps import (
    get_current_membership,
    get_current_tenant,
    get_current_user,
    get_db,
    is_role_member,
    verify_and_get_membership,
    verify_and_get_project,
    verify_and_get_task,
)
from app.models.membership import Membership, MembershipRole
from app.models.project import Project, ProjectMembers
from app.models.tenant import Tenant
from app.models.user import User
from app.schemas.membership import MemberResponse
from app.schemas.pagination import PaginatedResponse
from app.schemas.project import (
    ProjectAllResponse,
    ProjectCreate,
    ProjectMembersResponse,
    ProjectResponse,
    ProjectTenantResponse,
    ProjectUpdate,
)
from app.schemas.task import TaskAssigneeResponse
from app.services.project.project import (
    __create_project__,
    __delete_project__,
    __get_project_members__,
    __get_tenant_projects__,
    __get_working_projects__,
    __join_project__,
    __remove_project_member__,
    __update_project__,
)
from app.utils.helpers import create_slug

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[ProjectMembersResponse])
def get_tenant_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=20),
    query: str = Query(""),
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    """
    Get all the projects for the current tenant.

    Parameters
    ----------
    skip : int
        Number of projects to skip.
    limit : int
        Maximum number of projects to return.
    query : str
        Search query to filter projects.
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.
    db : Session
        Database session.

    Returns
    -------
    PaginatedResponse[ProjectMembersResponse]
        Paginated response containing the projects.
    """
    return __get_tenant_projects__(skip, limit, query, member_and_tenant, db)


@router.get("/working", response_model=list[ProjectAllResponse])
def get_working_projects(
    member_and_tenant: tuple[Membership, Tenant] = Depends(get_current_membership),
):
    """
    Get all projects where the current member is working.

    Parameters
    ----------
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.

    Returns
    -------
    list[ProjectAllResponse]
        List of projects where the member is working.
    """
    return __get_working_projects__(member_and_tenant)


@router.get("/leading", response_model=list[ProjectMembersResponse])
def get_leading_projects(
    member_and_tenant: tuple[type[Membership], Tenant] = Depends(
        get_current_membership,
    ),
):
    """
    Get all projects where the current member has a leading role.

    Parameters
    ----------
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.

    Returns
    -------
    list[ProjectMembersResponse]
        List of projects where the member is leading.
    """
    member, _ = member_and_tenant
    return member.leading_projects


@router.get("/{project_id}/members", response_model=PaginatedResponse[MemberResponse])
def get_project_members(
    project_id: str,
    query: str = Query(""),
    skip: int = Query(0, ge=0),
    limit: int = Query(
        10,
        ge=1,
    ),
    project_and_member: tuple[Project, Membership] = Depends(can_read_project),
    db: Session = Depends(get_db),
):
    """
    Get members of a specific project.

    Parameters
    ----------
    query : str
        Search query to filter members.
    skip : int
        Number of members to skip.
    limit : int
        Maximum number of members to return.
    project_and_member : tuple[Project, Membership]
        Current project and membership.
    db : Session
        Database session.

    Returns
    -------
    PaginatedResponse[MemberResponse]
        Paginated response containing the project members.
    """
    return __get_project_members__(query, skip, limit, project_and_member, db)


@router.get("/{project_id}", response_model=ProjectAllResponse)
def get_project_details(
    project_id: UUID,
    project_and_member: tuple[Project, Membership] = Depends(can_read_project),
):
    """
    Get details of a specific project.

    Parameters
    ----------
    project_and_member : tuple[Project, Membership]
        Current project and membership.

    Returns
    -------
    ProjectAllResponse
        Response containing the project details.
    """
    project, _ = project_and_member
    return project


@router.post("/", response_model=ProjectMembersResponse)
def create_project(
    data: ProjectCreate,
    member_and_tenant: tuple[Membership, Tenant] = Depends(can_create_project),
    db: Session = Depends(get_db),
):
    """
    Create a new project.

    Parameters
    ----------
    data : ProjectCreate
        Data required to create a new project.
    member_and_tenant : tuple[Membership, Tenant]
        Current membership and tenant.
    db : Session
        Database session.

    Returns
    -------
    ProjectMembersResponse
        Response containing the created project details.
    """
    return __create_project__(data, member_and_tenant, db)


@router.put("/{project_id}", response_model=ProjectAllResponse)
def update_project(
    project_id: UUID,
    data: ProjectUpdate,
    project_and_member: tuple[Project, Membership] = Depends(can_update_or_delete_project),
    db: Session = Depends(get_db),
):
    """
    Update an existing project.

    Parameters
    ----------
    data : ProjectUpdate
        Data required to update the project.
    project_and_member : tuple[Project, Membership]
        Current project and membership.
    db : Session
        Database session.

    Returns
    -------
    ProjectAllResponse
        Response containing the updated project details.
    """
    return __update_project__(data, project_and_member, db)


@router.delete("/{project_id}")
def delete_project(
    project_id: UUID,
    project_and_member: tuple[Project, Membership] = Depends(
        can_update_or_delete_project,
    ),
    db: Session = Depends(get_db),
):
    """
    Delete a specific project.

    Parameters
    ----------
    project_and_member : tuple[Project, Membership]
        Current project and membership.
    db : Session
        Database session.

    Returns
    -------
    dict
        Response confirming the deletion of the project.
    """
    return __delete_project__(project_and_member, db)


@router.put("/{project_id}/join", response_model=ProjectMembersResponse)
def join_project(
    project_id: uuid.UUID,
    member_and_tenant: Membership = Depends(get_current_membership),
    db: Session = Depends(get_db),
):
    """
    Join a specific project.

    Parameters
    ----------
    project_id : uuid.UUID
        Unique identifier of the project.
    member_and_tenant : Membership
        Current membership.
    db : Session
        Database session.

    Returns
    -------
    ProjectMembersResponse
        Response containing the project membership details.
    """
    return __join_project__(project_id, member_and_tenant, db)


@router.delete("/{project_id}/member/{member_id}")
def remove_project_member(
    project_id: UUID,
    member_id: UUID,
    project_and_member: tuple[Project, Membership] = Depends(can_remove_member),
    db: Session = Depends(get_db),
):
    """
    Remove a member from a specific project.

    Parameters
    ----------
    project_and_member : tuple[Project, Membership]
        Current project and membership.
    db : Session
        Database session.

    Returns
    -------
    dict
        Response confirming the removal of the member.
    """
    return __remove_project_member__(project_and_member, db)
