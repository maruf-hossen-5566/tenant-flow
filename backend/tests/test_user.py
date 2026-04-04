def test_get_current_user_success(client, user_token):
    res = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {user_token}"},
    )
    assert res.status_code == 200
    assert res.json()["email"] == "testuser@gmail.com"


def test_get_current_user_invalid_token_fails(client):
    res = client.get(
        "/api/users/me",
        headers={"Authorization": "Bearer invalid_token"},
    )
    assert res.status_code == 401
    assert res.json()["detail"] == "Invalid auth credentials"
