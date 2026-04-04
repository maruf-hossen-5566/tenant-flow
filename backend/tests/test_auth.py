def test_register_success(client):
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "testuser@gmail.com",
            "password": "testpass1234",
        },
    )
    assert res.status_code == 200
    assert (
        res.json()["detail"]
        == "Account created successfully, Now please log in with the credentials"
    )


def test_register_duplicate_email_fails(client, test_user):
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "testuser@gmail.com",
            "password": "testuser1234",
        },
    )
    assert res.status_code == 409
    assert res.json()["detail"] == "Email already taken, please use a different email"


def test_register_invalid_email_fails(client):
    res = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "testuser",
            "password": "testpass1234",
        },
    )
    assert res.status_code == 422


def test_login_success(client, test_user):
    res = client.post(
        "/api/auth/login",
        data={"username": "testuser@gmail.com", "password": "testuser1234"},
    )
    assert res.status_code == 200
    assert res.json()["user"]["email"] == "testuser@gmail.com"
    assert "access_token" in res.json()["tokens"]
    assert "refresh_token" in res.json()["tokens"]


def test_login_invalid_password_fails(client, test_user):
    res = client.post(
        "/api/auth/login",
        data={"username": "testuser@gmail.com", "password": "not_a_valid_password"},
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid credentials"


def test_login_nonexistent_user_fails(client):
    res = client.post(
        "/api/auth/login",
        data={"username": "testuser@gmail.com", "password": "testuser1234"},
    )
    assert res.status_code == 404
    assert res.json()["detail"] == "Invalid credentials"


def test_access_protected_route_without_token_fails(client):
    res = client.get(
        "/api/tenants/",
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Not authenticated"


def test_access_protected_route_with_valid_token_succeeds(client, user_token):
    res = client.get(
        "/api/tenants/",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res.status_code == 200
    assert type(res.json()) == list


def test_invalid_token_cannot_access_anything(client, user_token, tenant):
    res = client.get(
        "/api/tenants/details/",
        headers={
            "Authorization": f"Bearer invalid_token",
            "X-Tenant-ID": tenant["id"],
        },
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid auth credentials"
