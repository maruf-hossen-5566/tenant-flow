from datetime import datetime, timezone

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.loggin import setup_logger
from app.core.security import authenticate_user, create_tokens
from app.models.user import User
from app.schemas.auth import RegisterUser, RefreshToken
from app.schemas.user import UserResponse
from app.utils.hash import hash_password

logger = setup_logger(__name__)


def __register_account__(data: RegisterUser, db: Session):
    logger.info(f"Attempt account registration for <{data.email}>")

    new_user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )

    try:
        db.add(new_user)
        db.commit()
    except IntegrityError as e:
        logger.error(f"Failed to register account for <{data.email}>: {e}")
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "Email already taken, please use a different email",
        )
    except Exception as e:
        logger.error(f"Failed to register account for <{data.email}>: {e}")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    return {
        "detail": "Account created successfully, Now please log in with the credentials",
    }


def __login_account__(
    form_data: OAuth2PasswordRequestForm,
    db: Session,
):
    logger.info(f"Attempt account login for user <{form_data.username}>")

    user = authenticate_user(db, form_data)

    try:
        tokens = create_tokens({"sub": str(user.id)})
    except Exception as e:
        logger.error(
            f"Failed to create auth tokens for user <{form_data.username}>: {e}",
        )
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Something went wrong, please try again later",
        )

    logger.info(f"User <{user.email}> logged in successfully")
    return {"tokens": tokens, "user": UserResponse.model_validate(user)}


# def __refresh_token__(
#     user: User,
#     db: Session,
# ):
#     logger.info(f"Attempt refresh token for user <{user.email}>")
#     try:
#         tokens = create_tokens({"sub": str(user.id)})
#     except Exception as e:
#         logger.error(
#             f"Failed to create auth tokens for user <{user.email}>: {e}",
#         )
#         raise HTTPException(
#             status.HTTP_500_INTERNAL_SERVER_ERROR,
#             "Failed to refresh token, please try again later",
#         )
#
#     logger.info(f"User <{user.email}> logged in successfully")
#     return {"tokens": tokens, "user": UserResponse.model_validate(user)}


def __refresh_token__(
    token: RefreshToken,
    db: Session,
):
    exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token, please log in again",
    )
    try:
        payload = jwt.decode(
            token.refresh_token, settings.REFRESH_SECRET_KEY, algorithms=[settings.TOKEN_ALGORITHM],
        )
        user_id = payload.get("sub")
        token_type = payload.get("type")
        token_exp = payload.get("exp")
        token_exp_utc = datetime.fromtimestamp(token_exp, timezone.utc)
        now = datetime.now(timezone.utc)

        if not user_id:
            raise exception
        if not token_type == "refresh":
            raise exception
        if not token_exp_utc > now:
            raise exception

        logger.info(f"Attempt refresh token for user <{user_id}>")

        user_exists = db.query(User).filter(User.id == user_id).first()
        if not user_exists:
            raise exception

    except JWTError:
        raise exception

    tokens = create_tokens({"sub": str(user_id)})
    if not tokens:
        logger.info(f"Failed to create auth tokens for user <{user_id}>")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Something went wrong, please try again later",
        )

    return {"tokens": tokens}
