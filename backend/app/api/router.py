from fastapi import APIRouter

from app.api.auth.routes import router as auth_router
from app.api.invitation.routes import router as invitations_router
from app.api.member.routes import router as members_router
from app.api.project.routes import router as projects_router
from app.api.task.routes import router as task_router
from app.api.tenant.routes import router as tenants_router
from app.api.user.routes import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(tenants_router, prefix="/tenants", tags=["Tenants"])
api_router.include_router(members_router, prefix="/members", tags=["Members"])
api_router.include_router(
    invitations_router, prefix="/invitations", tags=["Invitations"],
)
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(task_router, prefix="/tasks", tags=["Tasks"])
