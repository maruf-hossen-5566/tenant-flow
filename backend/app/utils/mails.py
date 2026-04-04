import asyncio

from fastapi_mail import FastMail, ConnectionConfig, MessageType

from app.core.config import settings
from app.models.invitation import Invitation
from app.models.tenant import Tenant
from app.schemas.mail import EmailSchema
from fastapi_mail.schemas import MessageSchema

conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAIL_ADDRESS,
    MAIL_PASSWORD=settings.EMAIL_PASSWORD,  # type: ignore
    MAIL_FROM=settings.EMAIL_ADDRESS,
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
)


async def send_invitation_mail(invite_ins: Invitation):
    html_body = f"""
    <div>
        <h1><span style="color:blue;">{invite_ins.inviter}</span> invited you to join <span style="color:blue;">{invite_ins.tenant.name}</span> on X.app</h1>
        <a href="http://localhost:5173/workspaces/invitation?token={invite_ins.id}"><button style="padding: 0.5rem; background: black; color: white;">Join now</button></a>
        <a href="http://localhost:5173/workspaces/invitation?token={invite_ins.id}" style="max-width: 30rem; display: block; margin-top: 1rem;">http://localhost:5173/workspaces/accept-invitation?token={invite_ins.id}</a>
        <p margin-top: 1rem;">This link will expire in 24 hours</p>
    </div>
    """
    message = MessageSchema(
        subject=f"{invite_ins.inviter} invited you to join {invite_ins.tenant.name} on X.app",
        recipients=[invite_ins.email],  # type: ignore
        body=html_body,
        subtype=MessageType.html,
    )
    fm = FastMail(conf)
    await fm.send_message(message)


def send_pass_reset_mail():
    pass
