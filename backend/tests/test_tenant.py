import uuid

from tests.helper import create_user


def test_create_tenant_success(client, user_token):
    res = client.post(
        "/api/tenants/",
        json={"name": "Test_Tenant"},
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res.status_code == 200
    return res.json()["name"] == "Test_Tenant"


def test_access_to_invalid_tenant_fails(client, user_token):
    res = client.get(
        "/api/tenants/details",
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": f"{uuid.uuid4()}",
        },
    )
    assert res.status_code == 404
    return res.json()["detail"] == "Unauthorized"


def test_user_cannot_access_other_tenant_data(client, user_token):
    user2 = {
        "name": "Test User 2",
        "email": "testuser2@gmail.com",
        "password": "testuser1234_p",
    }
    register_user2 = client.post(
        "/api/auth/register/",
        json=user2,
    )
    login_user2 = client.post(
        "/api/auth/login",
        data={
            "username": user2["email"],
            "password": user2["password"],
        },
    )
    user2_token = login_user2.json()["tokens"]["access_token"]

    tenant = client.post(
        "/api/tenants/",
        json={"name": "Test Tenant"},
        headers={
            "Authorization": f"Bearer {user_token}",
        },
    )

    user2_tenant_access = client.get(
        "/api/tenants/details",
        headers={
            "Authorization": f"Bearer {user2_token}",
            "X-Tenant-ID": f"{tenant.json()['id']}",
        },
    )

    assert user2_tenant_access.status_code == 403
    assert user2_tenant_access.json()["detail"] == "Member not found"


def test_user_cannot_join_nonexistent_tenant(client, user_token, tenant, db):
    user2 = create_user(db, name="Test User 2", email="testuser2@gmail.com", password="testuser2")

    res = client.post(
        "/api/members/",
        json={
            "emails": [user2["email"]],
            "role": "member",
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": f"{uuid.uuid4()}",
        },
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Tenant not found"


def test_missing_tenant_header_fails(client, user_token):
    res = client.get(
        "/api/tenants/details",
        headers={
            "Authorization": f"Bearer {user_token}",
        },
    )
    assert res.status_code == 422
