from src.check_alerts import check_threshold


def test_check_threshold_warning_triggered():
    assert check_threshold(80, 75, ">=") is True


def test_check_threshold_warning_not_triggered():
    assert check_threshold(70, 75, ">=") is False


def test_check_threshold_exact_boundary():
    assert check_threshold(75, 75, ">=") is True


def test_check_threshold_gt_operator():
    assert check_threshold(75, 75, ">") is False
    assert check_threshold(76, 75, ">") is True
