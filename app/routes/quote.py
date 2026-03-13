from flask import Blueprint, abort, render_template, request

from app.services.quote_service import (
    build_facets,
    filter_quotes,
    get_prev_next_quote,
    get_quote_by_id,
    get_related_quotes,
)

quote_bp = Blueprint("quote", __name__)


def _get_positive_int(value: str, default: int = 1) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return parsed if parsed > 0 else default


@quote_bp.get("/quotes")
def quote_list():
    keyword = request.args.get("q", "").strip()
    topic = request.args.get("topic", "").strip()
    mood = request.args.get("mood", "").strip()
    era = request.args.get("era", "").strip()
    page = _get_positive_int(request.args.get("page", "1"), default=1)

    result = filter_quotes(keyword=keyword, topic=topic, mood=mood, era=era, page=page, per_page=9)
    facets = build_facets()

    filters = {"q": keyword, "topic": topic, "mood": mood, "era": era}
    return render_template("quotes.html", quotes=result["items"], pagination=result, filters=filters, facets=facets)


@quote_bp.get("/quotes/<quote_id>")
def quote_detail(quote_id: str):
    quote = get_quote_by_id(quote_id)
    if not quote:
        abort(404)

    related_quotes = get_related_quotes(quote, limit=3)
    prev_quote, next_quote = get_prev_next_quote(quote_id)

    return render_template(
        "quote_detail.html",
        quote=quote,
        related_quotes=related_quotes,
        prev_quote=prev_quote,
        next_quote=next_quote,
    )

