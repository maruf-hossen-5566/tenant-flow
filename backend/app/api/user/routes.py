from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette import status

from app.core.deps import get_current_user, get_db
from app.core.loggin import setup_logger
from app.models.user import User
from app.schemas.user import UpdatePassword, UserResponse
from app.schemas.user import UpdateUser
from app.services.user.user import (
	__update_account__,
	_change_password_,
	_delete_account_,
)

logger = setup_logger(__name__)

router = APIRouter()


@router.get("/", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
	"""
	Get all users data

	Parameters
	----------
	db : Session
		Database session for operations.

	Returns
	-------
	list[UserResponse]

	"""
	users = db.query(User).all()
	return users


@router.get("/me", response_model=UserResponse)
def get_current_account(user: User = Depends(get_current_user)):
	"""
	Get the current user's account details.

	Parameters
	----------
	user : User
		Current authenticated user.

	Returns
	-------
	UserResponse
		Current user's account information.
	"""
	return user


@router.put("/", response_model=UserResponse)
def update_account(
	data: UpdateUser,
	user: User = Depends(get_current_user),
	db: Session = Depends(get_db),
):
	"""
	Update the current user's account information.

	Args:
		data: UpdateUser schema containing the fields to update
		user: Current authenticated user from dependency injection
		db: Database session for updating the user

	Returns:
		User: The updated user object
	"""

	return __update_account__(data, user, db)


@router.put("/change-pass")
def change_account_password(
	data: UpdatePassword,
	user: User = Depends(get_current_user),
	db: Session = Depends(get_db),
):
	"""
	Change a user's password.

	Parameters
	----------
	data : UpdatePassword
		Data from request body (new_password, conf_password).
	user : User
		User to change password for.
	db: Database session.

	Returns
	-------
	dict
		Success message.

	Raises
	------
	HTTPException
		400: New passwords don't match
	"""

	return _change_password_(data, user, db)


@router.delete("/")
def delete_account(
	user: User = Depends(get_current_user),
	db: Session = Depends(get_db),
):
	"""
	Delete a user account.

	Parameters
	----------
	user : User
		User to delete.
	db : Session
		Database session

	Returns
	-------
	dict
		Success message.
	"""
	return _delete_account_(user, db)
