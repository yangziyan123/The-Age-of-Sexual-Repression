import json
import math
import random
from collections import Counter, defaultdict
from datetime import date
from functools import lru_cache
from pathlib import Path
from typing import Any

from flask import current_app


def _data_path() -> Path:
    path = current_app.config.get("QUOTES_DATA_PATH")
    if not path:
        raise RuntimeError("Missing QUOTES_DATA_PATH config")
    return Path(path)


def _normalize_quote(raw_quote: dict[str, Any]) -> dict[str, Any]:
    quote = dict(raw_quote)
    quote.setdefault("id", "")
    quote.setdefault("text", "")
    quote.setdefault("author", "峰哥")
    quote.setdefault("source", "未标注来源")
    quote.setdefault("created_at", "")
    quote.setdefault("era", "未分期")
    quote.setdefault("topics", [])
    quote.setdefault("mood", "未标注")
    quote.setdefault("commentary", "")
    quote.setdefault("is_featured", False)
    return quote


@lru_cache(maxsize=4)
def _load_quotes_cached(data_file: str) -> list[dict[str, Any]]:
    with Path(data_file).open("r", encoding="utf-8") as f:
        raw_quotes = json.load(f)

    quotes = [_normalize_quote(item) for item in raw_quotes]
    quotes.sort(key=lambda item: item.get("created_at") or "0000-00-00", reverse=True)
    return quotes


def get_all_quotes() -> list[dict[str, Any]]:
    return _load_quotes_cached(str(_data_path()))


def get_quote_by_id(quote_id: str) -> dict[str, Any] | None:
    return next((quote for quote in get_all_quotes() if quote["id"] == quote_id), None)


def _contains_keyword(quote: dict[str, Any], keyword: str) -> bool:
    if not keyword:
        return True

    keyword = keyword.lower()
    haystack = " ".join(
        [
            quote.get("text", ""),
            quote.get("source", ""),
            quote.get("commentary", ""),
            " ".join(quote.get("topics", [])),
            quote.get("era", ""),
            quote.get("mood", ""),
        ]
    ).lower()
    return keyword in haystack


def filter_quotes(
    *,
    keyword: str = "",
    topic: str = "",
    mood: str = "",
    era: str = "",
    page: int = 1,
    per_page: int = 12,
) -> dict[str, Any]:
    quotes = get_all_quotes()
    filtered = []

    for quote in quotes:
        if topic and topic not in quote.get("topics", []):
            continue
        if mood and mood != quote.get("mood"):
            continue
        if era and era != quote.get("era"):
            continue
        if not _contains_keyword(quote, keyword):
            continue
        filtered.append(quote)

    total = len(filtered)
    total_pages = max(1, math.ceil(total / per_page)) if per_page else 1
    page = max(1, min(page, total_pages))

    start = (page - 1) * per_page
    end = start + per_page
    items = filtered[start:end]

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


def build_facets(quotes: list[dict[str, Any]] | None = None) -> dict[str, list[dict[str, Any]]]:
    source_quotes = quotes if quotes is not None else get_all_quotes()
    topic_counter: Counter[str] = Counter()
    mood_counter: Counter[str] = Counter()
    era_counter: Counter[str] = Counter()

    for quote in source_quotes:
        for topic in quote.get("topics", []):
            topic_counter[topic] += 1
        mood_counter[quote.get("mood", "未标注")] += 1
        era_counter[quote.get("era", "未分期")] += 1

    return {
        "topics": [{"name": name, "count": count} for name, count in topic_counter.most_common()],
        "moods": [{"name": name, "count": count} for name, count in mood_counter.most_common()],
        "eras": [{"name": name, "count": count} for name, count in era_counter.most_common()],
    }


def get_featured_quote(today: date | None = None) -> dict[str, Any] | None:
    quotes = get_all_quotes()
    if not quotes:
        return None

    featured_quotes = [quote for quote in quotes if quote.get("is_featured")]
    pool = featured_quotes if featured_quotes else quotes

    current_day = today or date.today()
    index = current_day.toordinal() % len(pool)
    return pool[index]


def get_random_quotes(*, limit: int = 3, exclude_id: str | None = None) -> list[dict[str, Any]]:
    candidates = [quote for quote in get_all_quotes() if quote["id"] != exclude_id]
    if not candidates:
        return []

    random.shuffle(candidates)
    return candidates[: min(limit, len(candidates))]


def get_related_quotes(current_quote: dict[str, Any], *, limit: int = 3) -> list[dict[str, Any]]:
    current_id = current_quote.get("id")
    current_topics = set(current_quote.get("topics", []))
    current_mood = current_quote.get("mood")
    current_era = current_quote.get("era")

    scored: list[tuple[int, dict[str, Any]]] = []
    for candidate in get_all_quotes():
        if candidate["id"] == current_id:
            continue

        score = 0
        candidate_topics = set(candidate.get("topics", []))
        score += len(current_topics.intersection(candidate_topics)) * 3
        score += 2 if current_mood and current_mood == candidate.get("mood") else 0
        score += 1 if current_era and current_era == candidate.get("era") else 0

        scored.append((score, candidate))

    scored.sort(key=lambda item: (item[0], item[1].get("created_at", "")), reverse=True)
    related = [item[1] for item in scored if item[0] > 0]
    if not related:
        return get_random_quotes(limit=limit, exclude_id=current_id)
    return related[:limit]


def get_prev_next_quote(quote_id: str) -> tuple[dict[str, Any] | None, dict[str, Any] | None]:
    quotes = get_all_quotes()
    for index, quote in enumerate(quotes):
        if quote["id"] != quote_id:
            continue

        previous_quote = quotes[index - 1] if index - 1 >= 0 else None
        next_quote = quotes[index + 1] if index + 1 < len(quotes) else None
        return previous_quote, next_quote

    return None, None


def build_timeline_groups() -> list[dict[str, Any]]:
    groups: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for quote in get_all_quotes():
        group_name = quote.get("era") or "未分期"
        groups[group_name].append(quote)

    sorted_groups = sorted(
        groups.items(),
        key=lambda item: max((q.get("created_at") or "0000-00-00") for q in item[1]),
        reverse=True,
    )

    return [{"era": era, "quotes": quotes} for era, quotes in sorted_groups]

