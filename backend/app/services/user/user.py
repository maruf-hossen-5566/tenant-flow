from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.loggin import setup_logger
from app.models.membership import Membership
from app.models.user import User
from app.schemas.user import UpdatePassword, UpdateUser
from app.utils.hash import hash_password, verify_password

logger = setup_logger(__name__)


def __update_account__(
	data: UpdateUser,
	user: User,
	db: Session,
):
	logger.info(f"Attempt account update for user <{user.email}>")
	if data.name is not None:
		user.name = data.name

	try:
		db.commit()
	except Exception as e:
		logger.error(f"Failed to update account <{user.id}: {e}")
		raise HTTPException(
			status.HTTP_500_INTERNAL_SERVER_ERROR, "Something went wrong, please try again later",
		)

	return user


def _change_password_(
	data: UpdatePassword,
	user: User,
	db: Session,
):
	logger.info(f"Attempt account password change for user <{user.email}>")
	if not verify_password(data.password, user.hashed_password):  # type: ignore
		raise HTTPException(
			status.HTTP_400_BAD_REQUEST, detail="Invalid current password",
		)

	if not data.new_password == data.conf_password:
		raise HTTPException(
			status.HTTP_400_BAD_REQUEST, detail="New passwords don't match",
		)

	user.hashed_password = hash_password(data.new_password)  # type: ignore

	try:
		db.commit()
	except Exception as e:
		logger.error(f"Failed to change account password for user <{user.email}>: {e}")
		raise HTTPException(
			status.HTTP_500_INTERNAL_SERVER_ERROR,
			"Something went wrong, please try again later",
		)

	return {
		"detail": "Password changed successfully, Now please log in with new credentials"
	}


def _delete_account_(
	user: User,
	db: Session,
):
	logger.info(f"Attempt account delete for user <{user.email}>")
	try:
		db.delete(user)
		# TODO: It's also good to use background_task for this
		delete_count = (
			db.query(Membership)
			.filter(
				Membership.user_id == user.id,
				Membership.is_active == True,
			)
			.delete(synchronize_session=False)
		)
		db.commit()
		logger.info(
			f"Deleted account for user <{user.email}>, deleted {delete_count} memberships",
		)
	except Exception as e:
		logger.error(f"Failed to delete account for user <{user.email}>: {e}")
		raise HTTPException(
			status.HTTP_500_INTERNAL_SERVER_ERROR,
			"Something went wrong, please try again later",
		)

	return {"detail": "Account has been deleted"}
