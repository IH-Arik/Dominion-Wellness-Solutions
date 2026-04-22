"""Authentication regression tests."""

from datetime import timedelta
from types import SimpleNamespace

import pytest

from app.schemas.auth import VerifyResetCodeRequest
from app.services.auth_service import AuthService
from app.utils.helpers import utc_now


@pytest.mark.asyncio
async def test_verify_reset_code_marks_user_as_verified(monkeypatch: pytest.MonkeyPatch) -> None:
    """Reset code verification should mark the account as verified."""
    service = AuthService()
    user = SimpleNamespace(
        id="user-1",
        email="arik@example.com",
        password_reset_code="1234",
        password_reset_expires_at=utc_now() + timedelta(minutes=10),
        is_verified=False,
    )
    captured_update: dict[str, object] = {}

    async def fake_get_by_email(email: str) -> SimpleNamespace:
        assert email == "arik@example.com"
        return user

    async def fake_update_user(user_id: str, data: dict[str, object]) -> SimpleNamespace:
        captured_update["user_id"] = user_id
        captured_update["data"] = data
        user.is_verified = bool(data.get("is_verified"))
        return user

    monkeypatch.setattr(service.user_repository, "get_by_email", fake_get_by_email)
    monkeypatch.setattr(service.user_repository, "update_user", fake_update_user)

    payload = VerifyResetCodeRequest(email="arik@example.com", code="1234")

    response = await service.verify_reset_code(payload)

    assert response == {}
    assert captured_update == {"user_id": "user-1", "data": {"is_verified": True}}
    assert user.is_verified is True
