from pathlib import PurePosixPath
from urllib.error import HTTPError, URLError
from urllib.request import urlopen
from uuid import uuid4

import cloudinary.api
import cloudinary.uploader
from cloudinary import CloudinaryImage
from cloudinary.exceptions import NotFound
from django.core.files.base import ContentFile
from django.core.files.storage import Storage


class CloudinaryMediaStorage(Storage):

    @staticmethod
    def _split_name(name):
        path = PurePosixPath(str(name).replace("\\", "/"))
        file_format = path.suffix.lstrip(".") or None

        if file_format:
            public_id = path.with_suffix("").as_posix()
        else:
            public_id = path.as_posix()

        return public_id, file_format

    def get_available_name(self, name, max_length=None):
        return name

    def _save(self, name, content):
        path = PurePosixPath(str(name).replace("\\", "/"))
        folder = path.parent.as_posix().strip("/")

        if folder == ".":
            folder = ""

        generated_id = uuid4().hex
        public_id = (
            f"{folder}/{generated_id}"
            if folder
            else generated_id
        )

        try:
            content.seek(0)
        except (AttributeError, OSError):
            pass

        result = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            resource_type="image",
            type="upload",
            overwrite=False,
            unique_filename=False,
        )

        uploaded_id = result["public_id"]
        uploaded_format = result.get("format")

        if uploaded_format:
            return f"{uploaded_id}.{uploaded_format}"

        return uploaded_id

    def _open(self, name, mode="rb"):
        if mode not in {"r", "rb"}:
            raise ValueError("Cloudinary media files are read-only.")

        try:
            with urlopen(self.url(name), timeout=30) as response:
                return ContentFile(response.read(), name=name)
        except (HTTPError, URLError) as exc:
            raise FileNotFoundError(
                f"Unable to open Cloudinary file: {name}"
            ) from exc

    def delete(self, name):
        if not name:
            return

        public_id, _ = self._split_name(name)

        cloudinary.uploader.destroy(
            public_id,
            resource_type="image",
            type="upload",
            invalidate=True,
        )

    def exists(self, name):
        public_id, _ = self._split_name(name)

        try:
            cloudinary.api.resource(
                public_id,
                resource_type="image",
                type="upload",
            )
            return True
        except NotFound:
            return False

    def size(self, name):
        public_id, _ = self._split_name(name)

        resource = cloudinary.api.resource(
            public_id,
            resource_type="image",
            type="upload",
        )

        return resource["bytes"]

    def url(self, name):
        if str(name).startswith(("http://", "https://")):
            return str(name)

        public_id, file_format = self._split_name(name)

        return CloudinaryImage(
            public_id,
            format=file_format,
        ).build_url(secure=True)