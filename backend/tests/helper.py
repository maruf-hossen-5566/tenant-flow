import uuid

from app.models.membership import Membership
from app.models.user import User
from app.utils.hash import hash_password


def create_user(db, **kwargs) -> dict:
    user = User(
        email=kwargs["email"],
        name=kwargs["name"],
        hashed_password=hash_password(kwargs["password"]),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    assert user.email == kwargs["email"]
    return user.__dict__


def get_user_token(client, **kwargs) -> str:
    res = client.post(
        "/api/auth/login/",
        data={
            "username": kwargs["username"],
            "password": kwargs["password"],
        },
    )
    assert res.status_code == 200
    return res.json()["tokens"]["access_token"]


def create_tenant(client, user_token, **kwargs) -> dict:
    tenant = client.post(
        "/api/tenants/",
        json={
            "name": kwargs["name"],
        },
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert tenant.status_code == 200
    return tenant.json()


def create_member(db, **kwargs) -> dict:
    member_id = uuid.uuid4()
    member = Membership(
        id=member_id,
        user_id=kwargs["user_id"],
        tenant_id=kwargs["tenant_id"],
        role=kwargs["role"],
        is_active=True,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    assert member.id == member_id
    return member.__dict__


def create_project(client, user_token, tenant, **kwargs) -> dict:
    project = client.post(
        "/api/projects/",
        json={
            "name": kwargs["name"],
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-Id": tenant["id"],
        },
    )
    return project.json()
