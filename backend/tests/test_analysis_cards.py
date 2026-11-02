from types import SimpleNamespace

from app.api.v1.endpoints.analyze import _ayurvedic_citations, _build_wellness_cards


def passage(category, content="Retrieved guidance", source="AYUSH", grounded=True, document_id=None):
    return SimpleNamespace(
        category=category,
        content=content,
        source_name=source,
        source_grounded=grounded,
        source_id="source-1",
        url="https://example.test/source",
        document_id=document_id or f"{category}-1",
    )


def test_all_five_cards_are_returned_in_required_order():
    cards = _build_wellness_cards([
        passage("food", "Use the retrieved food guidance."),
        passage("lifestyle", "Use the retrieved lifestyle guidance."),
        passage("yoga", "Use the retrieved yoga guidance."),
    ])

    assert [card.id for card in cards] == [
        "traditional_food", "herbal_support", "daily_lifestyle",
        "yoga_pranayama", "ayurvedic_wisdom",
    ]
    assert [card.title for card in cards] == [
        "Food and hydration",
        "Traditional options",
        "Daily lifestyle",
        "Gentle movement",
        "Traditional perspective",
    ]
    assert all(card.evidence_status == "unavailable" for card in cards)


def test_cards_omit_categories_without_source_grounded_evidence():
    cards = _build_wellness_cards([
        passage("traditional_options", "Discuss traditional options with a qualified practitioner.", grounded=False),
    ])

    assert len(cards) == 5
    assert all(card.evidence_status == "unavailable" for card in cards)
    assert cards[0].recommendation.startswith("Choose balanced meals")


def test_cards_use_generic_guidance_when_rag_returns_no_passages():
    cards = _build_wellness_cards([])
    assert len(cards) == 5
    assert all(card.evidence_status == "unavailable" for card in cards)
    assert all(not card.citations for card in cards)


def test_generated_card_requires_matching_grounded_retrieved_citation():
    cards = _build_wellness_cards(
        [passage("food", "Retrieved food guidance", document_id="food-42")],
        [{
            "id": "traditional_food",
            "recommendation": "Gemini's plain-language food explanation.",
            "citation_document_ids": ["food-42"],
        }],
    )
    assert len(cards) == 5
    assert cards[0].recommendation.startswith("Gemini's")
    assert cards[0].evidence_status == "supported"
    assert all(card.evidence_status == "unavailable" for card in cards[1:])


def test_generated_card_is_omitted_for_wrong_category_or_unknown_citation():
    passages = [passage("food", document_id="food-42")]
    cards = _build_wellness_cards(passages, [{
        "id": "yoga_pranayama",
        "recommendation": "Unsupported yoga claim",
        "citation_document_ids": ["food-42"],
    }, {
        "id": "traditional_food",
        "recommendation": "Unknown source claim",
        "citation_document_ids": ["missing"],
    }])
    assert len(cards) == 5
    assert all(card.evidence_status == "unavailable" for card in cards)
    assert cards[0].recommendation.startswith("Choose balanced meals")


def test_explicitly_empty_gemini_cards_remain_visible_but_unavailable():
    cards = _build_wellness_cards([passage("food")], [])
    assert len(cards) == 5
    assert all(card.evidence_status == "unavailable" for card in cards)


def test_source_document_id_alias_is_accepted_when_metadata_uses_that_identifier():
    cards = _build_wellness_cards([passage("food", document_id="rag-food-42")], [{
        "id": "traditional_food",
        "recommendation": "Gemini-generated explanation.",
        "citation_document_ids": ["source-1"],
    }])
    assert cards[0].evidence_status == "supported"


def test_traditional_perspective_citations_require_grounded_matching_passages():
    perspective = passage("ayurvedic_perspective", document_id="perspective-1")
    food = passage("food", document_id="food-1")
    citations, urls = _ayurvedic_citations([perspective, food], ["perspective-1", "food-1"])
    assert citations == ["AYUSH"]
    assert urls == ["https://example.test/source"]
