# Minimal pytest mirror of the validated detection logic.
import detect

def test_guilty_plea_is_conviction():
    assert detect.classify_disposition("pleaded guilty")[0] == "CONVICTED"

def test_forward_move_proposes():
    p = detect.detect_change("CHARGED", "pleaded guilty", "https://c/1")
    assert p and p.proposed_legal_status == "CONVICTED"

def test_regression_ignored():
    assert detect.detect_change("CONVICTED", "charges filed") is None

def test_noop_ignored():
    assert detect.detect_change("CONVICTED", "convicted") is None
