from pydantic import BaseModel, EmailStr


class EmailSchema(BaseModel):
    emails: list[EmailStr]
    subject: str
    # body: str
