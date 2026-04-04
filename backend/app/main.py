from app.core.config import settings
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.db import Base, engine

app = FastAPI()
app.include_router(api_router, prefix="/api")

Base.metadata.create_all(bind=engine)

# CORS
origins = settings.ALLOWED_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error = exc.errors()[0]
    field = error["loc"][-1]
    message = error["msg"]
    error_msg = None
    if isinstance(field, str):
        error_msg = f"{field}: {message}"

    return JSONResponse(
        status_code=422,
        content={"detail": error_msg if error_msg else message},
    )


# alembic revision --autogenerate -m "Initial migration"
# alembic upgrade head
