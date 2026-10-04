import math

from django.conf import settings
from django.core.signing import (
    BadSignature,
    SignatureExpired,
    TimestampSigner,
)


TOKEN_SALT = 'aid-face-verification'
_signer = TimestampSigner(salt=TOKEN_SALT)


def issue_token(schedule_id, employee_id, matched, score):
    """Issue a signed face-verification token."""
    schedule_id = int(schedule_id)
    employee_id = int(employee_id)

    if schedule_id <= 0:
        raise ValueError('schedule_id must be a positive integer.')

    if employee_id <= 0:
        raise ValueError('employee_id must be a positive integer.')

    if not isinstance(matched, bool):
        raise ValueError('matched must be a boolean.')

    if isinstance(score, bool):
        raise ValueError('score must be a valid number.')

    try:
        score = float(score)
    except (TypeError, ValueError) as error:
        raise ValueError('score must be a valid number.') from error

    if not math.isfinite(score):
        raise ValueError('score must be a finite number.')

    payload = {
        'schedule_id': schedule_id,
        'employee_id': employee_id,
        'matched': matched,
        'score': score,
    }

    return _signer.sign_object(payload)


def read_token(
    token,
    schedule_id,
    employee_id,
    max_age=None,
):
    """Read and validate a signed face-verification token."""
    if not isinstance(token, str) or not token.strip():
        return None

    try:
        schedule_id = int(schedule_id)
        employee_id = int(employee_id)
    except (TypeError, ValueError):
        return None

    if max_age is None:
        max_age = settings.AID_FACE_VERIFICATION_TOKEN_MAX_AGE

    try:
        payload = _signer.unsign_object(
            token,
            max_age=max_age,
        )
    except (
        BadSignature,
        SignatureExpired,
        TypeError,
        ValueError,
    ):
        return None

    if not isinstance(payload, dict):
        return None

    token_schedule_id = payload.get('schedule_id')
    token_employee_id = payload.get('employee_id')
    matched = payload.get('matched')
    score = payload.get('score')

    if isinstance(token_schedule_id, bool):
        return None

    if isinstance(token_employee_id, bool):
        return None

    if token_schedule_id != schedule_id:
        return None

    if token_employee_id != employee_id:
        return None

    if not isinstance(matched, bool):
        return None

    if isinstance(score, bool):
        return None

    if not isinstance(score, (int, float)):
        return None

    score = float(score)

    if not math.isfinite(score):
        return None

    return {
        'schedule_id': token_schedule_id,
        'employee_id': token_employee_id,
        'matched': matched,
        'score': score,
    }