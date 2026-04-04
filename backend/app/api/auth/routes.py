from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.core.loggin import setup_logger
from app.schemas.auth import RegisterUser, RefreshToken
from app.services.auth.auth import (
    __login_account__,
    __register_account__,
    __refresh_token__
)

logger = setup_logger(__name__)

router = APIRouter()


@router.post("/register")
def register_account(data: RegisterUser, db: Session = Depends(get_db)):
    """
    Register a new user.

    Parameters
    ----------
    data : RegisterUser
        Credentials from request body (*args, **kwargs).
    db : Session
        Database session for registration.

    Returns
    -------
    dict
        Success message.

    Raises
    ------
    HTTPException
        409: User already exists
    """
    return __register_account__(data, db)


@router.post("/login")
def login_account(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Log in a user using email and password.

    Parameters
    ----------
    form_data : OAuth2PasswordRequestForm
        Credentials from request body (*args, **kwargs).
    db : Session
        Database session for authentication.

    Returns
    -------
    dict
        User data and auth tokens.

    Raises
    ------
    HTTPException
        401: Invalid credentials
        500: Token creation failed
    """
    return __login_account__(form_data, db)


@router.post("/refresh-token")
def refresh_token(
    token: RefreshToken,
    db: Session = Depends(get_db),
):
    return __refresh_token__(token, db)
