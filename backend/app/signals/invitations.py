from fastapi import FastAPI
from async_signals import Signal

invitation_created = Signal()


# @invitation_created.connect
# async def send_invitations_email(sender, instance, **kwargs):
#     print("-"*100)
#     # I will use fastapi background_task
#     print(f"Sending invitations email to {instance.email}")
#     print("-"*100)
