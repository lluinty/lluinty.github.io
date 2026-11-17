#!/usr/bin/env python3
"""Refresh the public Steam activity snapshot used by the GitHub Pages site."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "steam.json"
STEAM_API = "https://api.steampowered.com"
VANITY_URL = os.environ.get("STEAM_VANITY_URL", "llampillamp")


def request_json(path: str, params: dict[str, str]) -> dict[str, Any]:
    query = urllib.parse.urlencode(params)
    request = urllib.request.Request(
        f"{STEAM_API}/{path}?{query}",
        headers={"User-Agent": "luinty-profile/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"Steam API returned HTTP {error.code}") from None
    except (urllib.error.URLError, TimeoutError) as error:
        raise RuntimeError(f"Steam API request failed: {error.reason if hasattr(error, 'reason') else error}") from None
    except json.JSONDecodeError:
        raise RuntimeError("Steam API returned invalid JSON") from None

    if not isinstance(payload, dict):
        raise RuntimeError("Steam API returned an unexpected response")
    return payload


def get_response(payload: dict[str, Any]) -> dict[str, Any]:
    response = payload.get("response")
    if not isinstance(response, dict):
        raise RuntimeError("Steam API response is missing its response object")
    return response


def write_snapshot(payload: dict[str, Any]) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    api_key = os.environ.get("STEAM_API_KEY", "").strip()
    if not api_key:
        print("STEAM_API_KEY is not configured; skipping the Steam refresh.")
        return 0

    vanity = VANITY_URL.strip()
    resolved = get_response(
        request_json(
            "ISteamUser/ResolveVanityURL/v1/",
            {"key": api_key, "vanityurl": vanity},
        )
    )
    result = resolved.get("response", resolved)
    if result.get("success") != 1 or not result.get("steamid"):
        raise RuntimeError(
            f"Could not resolve the Steam vanity profile '{vanity}'."
        )
    steam_id = str(result["steamid"])

    common_params = {"key": api_key, "steamid": steam_id}
    owned_response = get_response(
        request_json(
            "IPlayerService/GetOwnedGames/v1/",
            {
                **common_params,
                "include_appinfo": "true",
                "include_played_free_games": "true",
            },
        )
    )
    recent_response = get_response(
        request_json(
            "IPlayerService/GetRecentlyPlayedGames/v1/",
            {**common_params, "count": "0"},
        )
    )

    owned_games = owned_response.get("games") or []
    recent_games = recent_response.get("games") or []
    if not isinstance(owned_games, list):
        owned_games = []
    if not isinstance(recent_games, list):
        recent_games = []

    # Merge both endpoints so the selected title has its total playtime and,
    # where available, its last-played timestamp and recent playtime.
    games_by_appid: dict[int, dict[str, Any]] = {}
    for source in (owned_games, recent_games):
        for game in source:
            if not isinstance(game, dict):
                continue
            try:
                appid = int(game.get("appid", 0))
            except (TypeError, ValueError):
                continue
            if appid <= 0:
                continue
            games_by_appid.setdefault(appid, {}).update(game)

    candidates = list(games_by_appid.values())
    candidates_with_timestamp = [
        game for game in candidates if int(game.get("rtime_last_played") or 0) > 0
    ]

    if candidates_with_timestamp:
        selected = max(
            candidates_with_timestamp,
            key=lambda game: int(game.get("rtime_last_played") or 0),
        )
    elif recent_games:
        # GetRecentlyPlayedGames returns only the recent window, ordered with
        # the most recently played title first.
        selected = recent_games[0]
    else:
        selected = None

    updated_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    if not isinstance(selected, dict) or not selected.get("appid"):
        write_snapshot(
            {
                "schemaVersion": 1,
                "status": "no_data",
                "username": vanity,
                "steamId": steam_id,
                "updatedAt": updated_at,
                "game": None,
            }
        )
        print("Steam returned no public game data.")
        return 0

    appid = int(selected["appid"])
    playtime_forever = max(0, int(selected.get("playtime_forever") or 0))
    playtime_two_weeks = max(0, int(selected.get("playtime_2weeks") or 0))
    last_played = int(selected.get("rtime_last_played") or 0)

    write_snapshot(
        {
            "schemaVersion": 1,
            "status": "ok",
            "username": vanity,
            "steamId": steam_id,
            "updatedAt": updated_at,
            "game": {
                "appid": appid,
                "name": str(selected.get("name") or f"App {appid}"),
                "playtimeForeverMinutes": playtime_forever,
                "playtimeTwoWeeksMinutes": playtime_two_weeks,
                "lastPlayedAt": last_played or None,
            },
        }
    )
    print(f"Steam activity refreshed for app {appid}.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (RuntimeError, ValueError, TypeError) as error:
        print(f"Steam refresh failed: {error}", file=sys.stderr)
        raise SystemExit(1)
