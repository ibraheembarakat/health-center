"""Face detection and recognition utilities using OpenCV YuNet and SFace."""

import io
import threading
import uuid
from pathlib import Path

import cv2
import numpy as np
from django.conf import settings
from django.core.files.base import ContentFile
from PIL import Image, ImageOps, UnidentifiedImageError


class FaceProcessingError(Exception):
    """Represent a safe, user-facing face processing error."""

    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(message)


_detector = None
_recognizer = None
_models_lock = threading.RLock()


def _get_models():
    """Load the face models lazily once per application process."""
    global _detector, _recognizer

    with _models_lock:
        if _detector is not None and _recognizer is not None:
            return _detector, _recognizer

        detector_path = Path(settings.FACE_DETECTOR_MODEL)
        recognizer_path = Path(settings.FACE_RECOGNIZER_MODEL)

        if not detector_path.is_file() or not recognizer_path.is_file():
            raise FaceProcessingError(
                'model_unavailable',
                'The face verification service is currently unavailable.',
            )

        try:
            detector = cv2.FaceDetectorYN.create(
                str(detector_path),
                '',
                (320, 320),
                settings.FACE_DETECTION_THRESHOLD,
                0.3,
                5000,
            )
            recognizer = cv2.FaceRecognizerSF.create(
                str(recognizer_path),
                '',
            )
        except (cv2.error, AttributeError, TypeError) as exc:
            raise FaceProcessingError(
                'model_unavailable',
                'The face verification service is currently unavailable.',
            ) from exc

        if detector is None or recognizer is None:
            raise FaceProcessingError(
                'model_unavailable',
                'The face verification service is currently unavailable.',
            )

        _detector = detector
        _recognizer = recognizer

        return _detector, _recognizer


def _read_upload_bytes(image_file):
    """Read an uploaded image safely and reset its file pointer."""
    if image_file is None:
        raise FaceProcessingError(
            'image_required',
            'A face image is required.',
        )

    max_bytes = int(settings.FACE_MAX_UPLOAD_SIZE)
    declared_size = getattr(image_file, 'size', None)

    if declared_size is not None and declared_size > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise FaceProcessingError(
            'image_too_large',
            f'The image is too large. Maximum allowed size is {limit_mb} MB.',
        )

    try:
        image_file.seek(0)
        data = image_file.read(max_bytes + 1)
        image_file.seek(0)
    except (AttributeError, OSError, TypeError, ValueError) as exc:
        raise FaceProcessingError(
            'invalid_image',
            'The uploaded file could not be read as an image.',
        ) from exc

    if not data:
        raise FaceProcessingError(
            'invalid_image',
            'The uploaded file is empty or is not a valid image.',
        )

    if len(data) > max_bytes:
        limit_mb = max_bytes // (1024 * 1024)
        raise FaceProcessingError(
            'image_too_large',
            f'The image is too large. Maximum allowed size is {limit_mb} MB.',
        )

    return data


def _load_pil_image(image_file):
    """Decode an image, apply EXIF orientation, and convert it to RGB."""
    data = _read_upload_bytes(image_file)

    try:
        with Image.open(io.BytesIO(data)) as source_image:
            width, height = source_image.size

            if width <= 0 or height <= 0:
                raise FaceProcessingError(
                    'invalid_image',
                    'The uploaded file is not a valid image.',
                )

            if width * height > settings.FACE_MAX_IMAGE_PIXELS:
                raise FaceProcessingError(
                    'image_dimensions_too_large',
                    'The image dimensions are too large.',
                )

            oriented_image = ImageOps.exif_transpose(source_image)
            rgb_image = oriented_image.convert('RGB')
            rgb_image.load()

        return rgb_image

    except FaceProcessingError:
        raise
    except (
        UnidentifiedImageError,
        Image.DecompressionBombError,
        OSError,
        SyntaxError,
        TypeError,
        ValueError,
    ) as exc:
        raise FaceProcessingError(
            'invalid_image',
            'The uploaded file is not a valid image.',
        ) from exc


def _read_opencv_image(image_file):
    """Convert an uploaded image into an OpenCV BGR image."""
    pil_image = _load_pil_image(image_file)
    rgb_image = np.asarray(pil_image, dtype=np.uint8)

    try:
        return cv2.cvtColor(
            np.ascontiguousarray(rgb_image),
            cv2.COLOR_RGB2BGR,
        )
    except cv2.error as exc:
        raise FaceProcessingError(
            'invalid_image',
            'The uploaded file is not a valid image.',
        ) from exc


def extract_encoding(image_file):
    """Extract a 128-value face encoding from an image containing one face."""
    image = _read_opencv_image(image_file)
    height, width = image.shape[:2]

    with _models_lock:
        detector, recognizer = _get_models()

        try:
            detector.setInputSize((width, height))
            _, faces = detector.detect(image)
        except cv2.error as exc:
            raise FaceProcessingError(
                'face_processing_failed',
                'The face image could not be processed.',
            ) from exc

        face_count = 0 if faces is None else len(faces)

        if face_count == 0:
            raise FaceProcessingError(
                'no_face_detected',
                'No clear face was detected. Use a well-lit front-facing photo.',
            )

        if face_count > 1:
            raise FaceProcessingError(
                'multiple_faces_detected',
                'The image must contain exactly one person.',
            )

        try:
            aligned_face = recognizer.alignCrop(image, faces[0])
            feature = recognizer.feature(aligned_face)
        except cv2.error as exc:
            raise FaceProcessingError(
                'face_processing_failed',
                'The face image could not be processed.',
            ) from exc

    encoding = np.asarray(feature, dtype=np.float32).reshape(-1)

    if (
        encoding.size != 128
        or not np.isfinite(encoding).all()
        or float(np.linalg.norm(encoding)) == 0.0
    ):
        raise FaceProcessingError(
            'face_processing_failed',
            'The face image could not be processed.',
        )

    return encoding.tolist()


def _validate_encoding(encoding):
    """Validate and reshape an encoding for OpenCV comparison."""
    if encoding is None:
        raise FaceProcessingError(
            'face_encoding_missing',
            'A face encoding is missing.',
        )

    try:
        array = np.asarray(encoding, dtype=np.float32).reshape(-1)
    except (TypeError, ValueError) as exc:
        raise FaceProcessingError(
            'invalid_face_encoding',
            'The stored face encoding is invalid.',
        ) from exc

    if (
        array.size != 128
        or not np.isfinite(array).all()
        or float(np.linalg.norm(array)) == 0.0
    ):
        raise FaceProcessingError(
            'invalid_face_encoding',
            'The stored face encoding is invalid.',
        )

    return array.reshape(1, 128)


def compare(stored_encoding, live_encoding):
    """Compare two encodings and return a match result and cosine score."""
    stored = _validate_encoding(stored_encoding)
    live = _validate_encoding(live_encoding)

    with _models_lock:
        _, recognizer = _get_models()

        try:
            score = recognizer.match(
                stored,
                live,
                cv2.FaceRecognizerSF_FR_COSINE,
            )
        except cv2.error as exc:
            raise FaceProcessingError(
                'face_comparison_failed',
                'The face encodings could not be compared.',
            ) from exc

    score = float(score)

    return (
        score >= settings.FACE_MATCH_THRESHOLD,
        round(score, 6),
    )


def compress_photo(image_file):
    """Resize and convert a profile photo to an optimized JPEG file."""
    image = _load_pil_image(image_file)
    image.thumbnail(
        settings.FACE_PHOTO_MAX_SIZE,
        Image.Resampling.LANCZOS,
    )

    output = io.BytesIO()

    try:
        image.save(
            output,
            format='JPEG',
            quality=settings.FACE_PHOTO_QUALITY,
            optimize=True,
        )
    except (OSError, TypeError, ValueError) as exc:
        raise FaceProcessingError(
            'photo_compression_failed',
            'The profile photo could not be prepared for storage.',
        ) from exc

    filename = f'{uuid.uuid4().hex}.jpg'

    return ContentFile(
        output.getvalue(),
        name=filename,
    )