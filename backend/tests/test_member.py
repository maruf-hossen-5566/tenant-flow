from app.models.membership import Membership, MembershipRole
from tests.helper import create_user, get_user_token, create_member


def test_admin_can_add_member(client, user_token, tenant):
    res = client.post(
        "/api/members/",
        json={
            "emails": ["testmember@gmail.com"],
            "role": "member",
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 200
    assert len(res.json()["errors"]) == 0
    assert res.json()["success"] == "1 Invitation sent successfully"


def test_admin_can_remove_member(client, user_token, tenant, db):
    user2 = create_user(
        db,
        email="testuser2@gmail.com",
        name="Test User 2",
        password="testuser2",
    )
    member2 = create_member(
        db,
        user_id=user2["id"],
        tenant_id=tenant["id"],
        role=MembershipRole.member,
    )

    res = client.delete(
        f"/api/members/{member2['id']}",
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": f"{tenant['id']}",
        },
    )
    assert res.status_code == 200
    assert res.json()["detail"] == "Member leaved/removed successfully"


def test_member_cannot_remove_admin(client, user_token, tenant, db):
    user2 = create_user(
        db,
        email="testuser2@gmail.com",
        name="Test User 2",
        password="testuser2",
    )
    create_member(
        db,
        user_id=user2["id"],
        tenant_id=tenant["id"],
        role=MembershipRole.member,
    )

    user2_token = get_user_token(client, username=user2["email"], password="testuser2")

    tenant_admin = (
        db.query(Membership)
        .filter(
            Membership.tenant_id == tenant["id"],
            Membership.role == MembershipRole.admin,
            Membership.is_active == True,
        )
        .first()
    )

    res = client.delete(
        f"/api/members/{tenant_admin.id}",
        headers={
            "Authorization": f"Bearer {user2_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "Unauthorized"


def test_member_cannot_escalate_role(client, user_token, tenant, db):
    user2 = create_user(
        db,
        name="Test User 2",
        email="testuser2@gmail.com",
        password="testuser2",
    )
    user2_token = get_user_token(client, username=user2["email"], password="testuser2")
    member2 = create_member(
        db,
        user_id=user2["id"],
        tenant_id=tenant["id"],
        role=MembershipRole.member,
    )

    res = client.put(
        f"api/members/{member2['id']}/change-role",
        json={
            "role": "admin",
        },
        headers={
            "Authorization": f"Bearer {user2_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "Unauthorized"
