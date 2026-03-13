from flask import Blueprint, redirect, render_template, url_for

from app.services.quote_service import (
    build_facets,
    build_timeline_groups,
    get_all_quotes,
    get_featured_quote,
    get_random_quotes,
)

main_bp = Blueprint("main", __name__)


@main_bp.get("/")
def guide():
    return render_template("guide.html", hide_chrome=True)


@main_bp.get("/home")
def home():
    featured_quote = get_featured_quote()
    recent_quotes = get_all_quotes()[:6]
    facets = build_facets()
    topic_cards = facets["topics"][:6]
    recommended_quotes = get_random_quotes(limit=3, exclude_id=featured_quote["id"] if featured_quote else None)

    return render_template(
        "index.html",
        featured_quote=featured_quote,
        recent_quotes=recent_quotes,
        topic_cards=topic_cards,
        recommended_quotes=recommended_quotes,
    )


@main_bp.get("/index")
def index_redirect():
    return redirect(url_for("main.home"))


@main_bp.get("/timeline")
def timeline():
    timeline_groups = build_timeline_groups()
    return render_template("timeline.html", timeline_groups=timeline_groups)


@main_bp.get("/about")
def about():
    total_quotes = len(get_all_quotes())
    facets = build_facets()
    return render_template("about.html", total_quotes=total_quotes, facets=facets)
