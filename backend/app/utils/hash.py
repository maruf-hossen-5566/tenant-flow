from fastapi import HTTPException, status
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using the bcrypt algorithm

    Parameters
    ----------
    password : str
        Password to hash

    Returns
    -------
    str
        Hashed password

    Raises
    ------
    HTTPException
        400: Failed to hash password
    """
    try:
        return pwd_context.hash(password)
    except (TypeError, ValueError, Exception) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to hash password: {str(e)}",
        )


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password

    Parameters
    ----------
    plain_password : str
        Password to verify
    hashed_password : str
        Hashed password to compare

    Returns
    -------
    bool
        True if password matches, False otherwise
    """
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False
