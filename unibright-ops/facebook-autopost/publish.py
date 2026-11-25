#!/usr/bin/env python3
"""Publish one approved Facebook Page photo per run using Meta Graph API."""
import json
import mimetypes
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from uuid import uuid4

HERE = Path(__file__).resolve().parent
QUEUE = HERE / "queue.json"
STATE = HERE / "published.json"
ASSETS = (HERE / "assets").resolve()
DRY_RUN = os.getenv("DRY_RUN", "true").lower() not in ("false", "0", "no")
VERSION = os.getenv("FB_GRAPH_VERSION", "v27.0")


def read_json(file, default):
    return json.loads(file.read_text(encoding="utf-8")) if file.exists() else default


def due(item):
    when = item.get("publish_after")
    if when is None:
        return True
    time = datetime.fromisoformat(when.replace("Z", "+00:00"))
    if time.tzinfo is None:
        raise ValueError("publish_after must include timezone offset")
    return time <= datetime.now(timezone.utc)


def image_file(item):
    if not item.get("image_path"):
        return None
    p = (HERE / item["image_path"]).resolve()
    if ASSETS not in p.parents or not p.is_file():
        raise ValueError("Image missing from assets: " + str(item["image_path"]))
    if p.suffix.lower() not in (".jpg", ".jpeg", ".png"):
        raise ValueError("Image must be JPG or PNG")
    return p


def make_multipart(fields, file):
    boundary = "Unibright" + uuid4().hex
    payload = bytearray()
    for k, v in fields.items():
        payload.extend(("--" + boundary + "\r\n").encode())
        payload.extend(('Content-Disposition: form-data; name="' + k + '"\r\n\r\n').encode())
        payload.extend(str(v).encode("utf-8"))
        payload.extend(b"\r\n")
    payload.extend(("--" + boundary + "\r\n").encode())
    payload.extend(('Content-Disposition: form-data; name="source"; filename="' + file.name + '"\r\n').encode())
    payload.extend(("Content-Type: " + (mimetypes.guess_type(file.name)[0] or "image/jpeg") + "\r\n\r\n").encode())
    payload.extend(file.read_bytes())
    payload.extend(b"\r\n")
    payload.extend(("--" + boundary + "--\r\n").encode())
    return bytes(payload), "multipart/form-data; boundary=" + boundary


def post(item, page, token):
    fields = {"access_token": token, "message": item["message"], "published": "true"}
    local = image_file(item)
    remote = item.get("image_url")
    if local:
        body, content_type = make_multipart(fields, local)
    elif isinstance(remote, str) and remote.startswith("https://"):
        body = urlencode({**fields, "url": remote}).encode("utf-8")
        content_type = "application/x-www-form-urlencoded"
    else:
        raise ValueError("Approved post must have assets/ image_path or HTTPS image_url")
    req = Request("https://graph.facebook.com/" + VERSION + "/" + page + "/photos",
                  data=body, headers={"Content-Type": content_type}, method="POST")
    try:
        with urlopen(req, timeout=90) as response:
            output = json.load(response)
    except HTTPError as e:
        raise RuntimeError("Meta Graph API rejected photo upload (HTTP " + str(e.code) + ")") from e
    except URLError as e:
        raise RuntimeError("Could not connect to Meta Graph API") from e
    if not output.get("id"):
        raise RuntimeError("Meta did not return confirmed photo ID")
    return output


def main():
    queue, sent = read_json(QUEUE, []), read_json(STATE, {})
    if not isinstance(queue, list) or not isinstance(sent, dict):
        raise ValueError("Invalid queue.json / published.json structure")
    ready = [x for x in queue if x.get("approved") is True and x.get("id")
             and x["id"] not in sent and due(x)]
    if not ready:
        print("No due approved unpublished posts.")
        return
    item = ready[0]  # At most one per day.
    if DRY_RUN:
        print("DRY RUN; would publish: " + item["id"])
        return
    page = os.getenv("FB_PAGE_ID", "").strip()
    token = os.getenv("FB_PAGE_ACCESS_TOKEN", "").strip()
    if not page or not token:
        raise RuntimeError("Set GitHub Actions secrets FB_PAGE_ID and FB_PAGE_ACCESS_TOKEN")
    if not item.get("message", "").strip():
        raise ValueError("Approved post has empty message")
    result = post(item, page, token)
    sent[item["id"]] = {
        "photo_id": result["id"],
        "post_id": result.get("post_id"),
        "published_at_utc": datetime.now(timezone.utc).isoformat()
    }
    STATE.write_text(json.dumps(sent, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Photo posted and publication recorded: " + item["id"])


if __name__ == "__main__":
    main()
