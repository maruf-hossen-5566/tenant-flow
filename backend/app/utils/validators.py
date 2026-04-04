from email_validator import validate_email, EmailNotValidError
from fastapi import HTTPException, status


def email_validate(email: str):
    try:
        email_info = validate_email(email.strip(), check_deliverability=False)
        normalized = email_info.normalized
        return normalized
    except EmailNotValidError as e:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"Invalid email address: {e}")
        print(f"Invalid: {e}")
