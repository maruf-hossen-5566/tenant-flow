import asyncio
from http.client import HTTPException
from smtplib import SMTPException

from app.core.loggin import setup_logger
from fastapi_mail import FastMail, ConnectionConfig, MessageType

from app.core.config import settings
from app.models.invitation import Invitation
from app.models.tenant import Tenant
from app.schemas.mail import EmailSchema
from fastapi_mail.schemas import MessageSchema

logger = setup_logger(__name__)

conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_ADDRESS,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,  # type: ignore
    MAIL_FROM=settings.EMAIL_ADDRESS,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
)


# async def send_invitation_mail(invite_ins: Invitation):
async def send_invitation_mail(invitations: list[Invitation]):
    for invite in invitations:
        mail_body = f"""
        <div>
            <h1><span style="color:blue;">{invite.inviter}</span> invited you to join <span style="color:blue;">{invite.tenant.name}</span> on Tenant Flow</h1>
            <a href="{settings.FRONTEND_URL}/workspaces/invitation?token={invite.id}"><button style="padding: 0.5rem; background: black; color: white;">Join now</button></a>
            <a href="{settings.FRONTEND_URL}/workspaces/invitation?token={invite.id}" style="max-width: 30rem; display: block; margin-top: 1rem;">{settings.FRONTEND_URL}/workspaces/accept-invitation?token={invite.id}</a>
            <p margin-top: 1rem;">This link will expire in 24 hours</p>
        </div>
        """
        message = MessageSchema(
            subject=f"{invite.inviter} invited you to join {invite.tenant.name} on Tenant Flow",
            recipients=[invite.email],
            body=mail_body,
            subtype=MessageType.html,
        )
        try:
            fm = FastMail(conf)
            await fm.send_message(message)
        except SMTPException as e:
            logger.error(f"Failed to send invitation email <{invite.email}>: {e}")
