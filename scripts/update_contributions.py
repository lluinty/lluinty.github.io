#!/usr/bin/env python3
"""Download the public contribution calendar for the luinty profile."""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

USERNAME = "lluinty"
API_URL = f"https://github-contributions-api.jogruber.de/v4/{USERNAME}?y=last"
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "contributions.json"


def main() -> int:
    request = Request(
        API_URL,
        headers={
            "User-Agent": "luinty-personal-profile/1.0",
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8"))
            upstream_age = response.headers.get("Age")
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
        print(f"Could not retrieve GitHub contributions: {error}", file=sys.stderr)
        return 1

    if not isinstance(payload, dict) or not isinstance(payload.get("contributions"), list):
        print("The contributions API returned an unexpected response.", file=sys.stderr)
        return 1

    days: list[dict[str, object]] = []
    for item in payload["contributions"]:
        if not isinstance(item, dict):
            continue
        date = item.get("date")
        if not isinstance(date, str) or len(date) != 10:
            continue
        try:
            count = max(0, int(item.get("count", 0)))
            level = min(4, max(0, int(item.get("level", 0))))
        except (TypeError, ValueError):
            continue
        days.append({"date": date, "count": count, "level": level})

    if not days:
        print("The API returned no valid contribution days; keeping the previous data.", file=sys.stderr)
        return 1

    result = {
        "username": USERNAME,
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "upstreamAgeSeconds": int(upstream_age) if upstream_age and upstream_age.isdigit() else None,
        "source": API_URL,
        "contributions": days,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temporary_file = OUTPUT.with_suffix(".json.tmp")
    temporary_file.write_text(json.dumps(result, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    temporary_file.replace(OUTPUT)

    print(f"Updated {OUTPUT.relative_to(Path(__file__).resolve().parents[1])}: {len(days)} days for @{USERNAME}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
