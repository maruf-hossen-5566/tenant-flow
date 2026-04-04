import uuid
from fastapi import HTTPException, status
from slugify import slugify


def create_slug(text: str):
    try:
        slug = f"{slugify(text[:50])}-{uuid.uuid4()}"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create slug, please try again",
        )

    return slug
