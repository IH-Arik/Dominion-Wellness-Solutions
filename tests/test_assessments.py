"""Assessment route regression tests."""

import pytest
from types import SimpleNamespace

from app.api.v1.routes import questions as question_routes
from app.services.assessment_service import AssessmentService


@pytest.mark.asyncio
async def test_list_questions_defaults_to_five_per_page(monkeypatch: pytest.MonkeyPatch) -> None:
    """Ensure onboarding assessment questions default to 5 per page."""
    captured: dict[str, int] = {}

    async def fake_list_questions(page: int, size: int) -> dict[str, object]:
        captured["page"] = page
        captured["size"] = size
        return {
            "total": 25,
            "page": page,
            "size": size,
            "total_pages": 5,
            "questions": [],
        }

    monkeypatch.setattr(question_routes.assessment_service, "list_questions", fake_list_questions)

    response = await question_routes.list_questions()

    assert captured == {"page": 1, "size": 5}
    assert response["success"] is True
    assert response["data"]["size"] == 5
    assert response["data"]["total_pages"] == 5


def test_serialize_question_uses_stable_question_code() -> None:
    """Ensure client-facing assessment question IDs are stable codes like q01."""
    service = AssessmentService()
    question = SimpleNamespace(
        code="q01",
        text="How would you describe your energy on most days?",
        driver="RC",
        response_type="scale",
        options=["Very Low", "Low", "Average", "High", "Very High"],
        weight=1.0,
        order=1,
    )

    serialized = service._serialize_question(question)

    assert serialized["id"] == "q01"
