from tests.helper import create_project, create_tenant, create_user, get_user_token


def test_create_project_in_tenant(client, user_token, tenant):
    res = client.post(
        "/api/projects/",
        json={
            "name": f"Project {tenant['name']}",
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 200
    assert res.json()["tenant_id"] == tenant["id"]


def test_user_cannot_access_other_tenant_project(client, user_token, tenant, db):
    user1_token = user_token
    user1_tenant = tenant

    user2 = create_user(
        db, name="User2", email="testuser2@gmail.com", password="testuser2",
    )

    user2_token = get_user_token(client, username=user2["email"], password="testuser2")
    user2_tenant = create_tenant(client, user2_token, name="User2's Tenant")

    # user1_project
    create_project(
        client, user1_token, user1_tenant, name="User1's Project in User1's Tenant",
    )
    # user2_project
    create_project(
        client, user2_token, user2_tenant, name="User2's Project in User2's Tenant",
    )

    # user2 trying to access user1's project
    res = client.get(
        "/api/projects/",
        headers={
            "Authorization": f"Bearer {user2_token}",
            "X-Tenant-ID": user1_tenant["id"],
        },
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "Member not found"


# Opposite of `test_user_cannot_access_other_tenant_project` test
def test_user_can_only_see_projects_in_their_tenant():
    pass


def test_update_project_success(client, user_token, tenant):
    new_project = create_project(client, user_token, tenant, name="New Project")
    res = client.put(
        f"/api/projects/{new_project['id']}",
        json={
            "name": f"New Project Updated",
        },
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 200
    assert res.json()["name"] == f"New Project Updated"


def test_delete_project_success(client, user_token, tenant, project):
    res = client.delete(
        f"/api/projects/{project['id']}",
        headers={
            "Authorization": f"Bearer {user_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 200
    assert res.json()["detail"] == "Project deleted successfully"


def test_non_owner_cannot_delete_project(client, user_token, tenant, project, db):
    user2 = create_user(db, name="User2", email="testuser2@gmail.com", password="testuser2")
    user2_token = get_user_token(client, username=user2["email"], password="testuser2")

    res = client.delete(
        f"/api/projects/{project['id']}",
        headers={
            "Authorization": f"Bearer {user2_token}",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 403
    assert res.json()["detail"] == "Member not found"
