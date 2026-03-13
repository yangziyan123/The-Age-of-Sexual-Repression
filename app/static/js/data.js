const DATA_URL = "app/data/quotes.json";
let cachedQuotes = null;

function normalizeQuote(rawQuote) {
  const quote = { ...rawQuote };
  quote.id = quote.id || "";
  quote.text = quote.text || "";
  quote.author = quote.author || "峰哥";
  quote.source = quote.source || "未标注来源";
  quote.created_at = quote.created_at || "";
  quote.era = quote.era || "未分期";
  quote.topics = Array.isArray(quote.topics) ? quote.topics : [];
  quote.mood = quote.mood || "未标注";
  quote.commentary = quote.commentary || "";
  quote.is_featured = Boolean(quote.is_featured);
  return quote;
}

export async function loadQuotes() {
  if (cachedQuotes) {
    return cachedQuotes;
  }

  const response = await fetch(DATA_URL, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load quotes: ${response.status}`);
  }

  const data = await response.json();
  cachedQuotes = data.map(normalizeQuote).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return cachedQuotes;
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getFeaturedQuote(quotes, today = new Date()) {
  if (!quotes.length) {
    return null;
  }

  const featured = quotes.filter((quote) => quote.is_featured);
  const pool = featured.length ? featured : quotes;
  const epochDays = Math.floor(today.getTime() / 86400000);
  return pool[epochDays % pool.length];
}

export function buildTopicFacets(quotes) {
  const counts = new Map();
  quotes.forEach((quote) => {
    quote.topics.forEach((topic) => {
      counts.set(topic, (counts.get(topic) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function buildEraCount(quotes) {
  const eras = new Set(quotes.map((quote) => quote.era).filter(Boolean));
  return eras.size;
}

export function filterQuotes(quotes, { keyword = "", topic = "" }) {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return quotes.filter((quote) => {
    if (topic && !quote.topics.includes(topic)) {
      return false;
    }

    if (!normalizedKeyword) {
      return true;
    }

    const haystack = [
      quote.text,
      quote.source,
      quote.commentary,
      quote.era,
      quote.mood,
      quote.topics.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedKeyword);
  });
}

export function paginate(items, page = 1, perPage = 9) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const normalizedPage = Math.min(Math.max(1, page), totalPages);
  const start = (normalizedPage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    total,
    page: normalizedPage,
    totalPages,
    perPage,
  };
}

export function buildQuoteCardHtml(quote) {
  const tagsHtml = quote.topics.map((topic) => `<span class="tag">${escapeHtml(topic)}</span>`).join("");

  return `
    <article class="quote-card">
      <a class="quote-card-link" href="quote.html?id=${encodeURIComponent(quote.id)}">
        <blockquote class="quote-text">“${escapeHtml(quote.text)}”</blockquote>
        <div class="quote-tags">${tagsHtml}</div>
      </a>
    </article>
  `;
}

export function setPageTitle(title) {
  document.title = title;
}
