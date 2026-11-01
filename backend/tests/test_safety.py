import pytest
from app.services.safety_service import SafetyService

def test_emergency_chest_pain_english():
    is_emergency, msg, urgency = SafetyService.evaluate_emergency("I have crushing chest pain radiating to my arm")
    assert is_emergency is True
    assert urgency == "emergency"
    assert "cardiac" in msg.lower() or "emergency" in msg.lower()

def test_emergency_chest_pain_hinglish():
    is_emergency, msg, urgency = SafetyService.evaluate_emergency("mere chhati me tez dard ho raha hai")
    assert is_emergency is True
    assert urgency == "emergency"
    assert "आपातकाल" in msg or "112" in msg

def test_negated_emergency_phrase_is_not_escalated():
    is_emergency, _, urgency = SafetyService.evaluate_emergency("I do not have severe chest pain")
    assert is_emergency is False
    assert urgency == "low"

def test_emergency_respiratory_arrest():
    is_emergency, msg, urgency = SafetyService.evaluate_emergency("Patient is unable to breathe and has blue lips")
    assert is_emergency is True
    assert urgency == "emergency"

def test_emergency_stroke():
    is_emergency, msg, urgency = SafetyService.evaluate_emergency("Sudden weakness on one side and slurred speech")
    assert is_emergency is True
    assert urgency == "emergency"

def test_non_emergency_symptoms():
    is_emergency, msg, urgency = SafetyService.evaluate_emergency("Mild headache and feeling tired since yesterday")
    assert is_emergency is False
    assert urgency == "low"
    assert msg is None

def test_pregnancy_safeguard():
    alerts = SafetyService.evaluate_vulnerability("I am 6 months pregnant with slight nausea")
    assert len(alerts) > 0
    assert any("pregnancy" in a.lower() or "pediatric" in a.lower() for a in alerts)
