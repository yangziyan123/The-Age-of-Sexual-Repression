import { buildQuoteCardHtml, loadQuotes, setPageTitle } from "./data.js";

function getQuoteId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || "";
}

function getPrevNext(quotes, currentId) {
  const index = quotes.findIndex((quote) => quote.id === currentId);
  if (index === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: index > 0 ? quotes[index - 1] : null,
    next: index < quotes.length - 1 ? quotes[index + 1] : null,
  };
}

function getRelated(quotes, currentQuote, limit = 3) {
  const currentTopics = new Set(currentQuote.topics);
  const currentEra = currentQuote.era;

  const scored = quotes
    .filter((quote) => quote.id !== currentQuote.id)
    .map((quote) => {
      const overlap = quote.topics.filter((topic) => currentTopics.has(topic)).length;
      const score = overlap * 3 + (quote.era === currentEra ? 1 : 0);
      return { score, quote };
    })
    .sort((a, b) => b.score - a.score || (b.quote.created_at || "").localeCompare(a.quote.created_at || ""));

  const nonZero = scored.filter((item) => item.score > 0).slice(0, limit).map((item) => item.quote);
  if (nonZero.length) {
    return nonZero;
  }

  return quotes.filter((quote) => quote.id !== currentQuote.id).slice(0, limit);
}

function renderNotFound() {
  const detail = document.querySelector("#detail-text");
  const topics = document.querySelector("#detail-topics");
  if (detail) {
    detail.textContent = "未找到对应语录。";
  }
  if (topics) {
    topics.textContent = "-";
  }
  setPageTitle("语录不存在 | 峰哥亡命天涯语录");
}

function renderNavigation(prev, next) {
  const prevLink = document.querySelector("#prev-link");
  const nextLink = document.querySelector("#next-link");
  if (!prevLink || !nextLink) {
    return;
  }

  if (prev) {
    prevLink.hidden = false;
    prevLink.href = `quote.html?id=${encodeURIComponent(prev.id)}`;
    prevLink.textContent = `上一篇：${prev.text.slice(0, 24)}${prev.text.length > 24 ? "..." : ""}`;
  } else {
    prevLink.hidden = true;
  }

  if (next) {
    nextLink.hidden = false;
    nextLink.href = `quote.html?id=${encodeURIComponent(next.id)}`;
    nextLink.textContent = `下一篇：${next.text.slice(0, 24)}${next.text.length > 24 ? "..." : ""}`;
  } else {
    nextLink.hidden = true;
  }
}

function renderRelated(relatedQuotes) {
  const container = document.querySelector("#related-grid");
  if (!container) {
    return;
  }
  container.innerHTML = relatedQuotes.map((quote) => buildQuoteCardHtml(quote)).join("");
}

async function bootstrap() {
  try {
    const quoteId = getQuoteId();
    const quotes = await loadQuotes();
    const currentQuote = quotes.find((quote) => quote.id === quoteId);
    if (!currentQuote) {
      renderNotFound();
      return;
    }

    const detailText = document.querySelector("#detail-text");
    const detailTopics = document.querySelector("#detail-topics");
    if (detailText) {
      detailText.textContent = `“${currentQuote.text}”`;
    }
    if (detailTopics) {
      detailTopics.textContent = currentQuote.topics.join("、");
    }

    setPageTitle(`语录详情 | ${currentQuote.text.slice(0, 16)}`);
    const { prev, next } = getPrevNext(quotes, currentQuote.id);
    renderNavigation(prev, next);
    renderRelated(getRelated(quotes, currentQuote, 3));
  } catch (error) {
    console.error(error);
    renderNotFound();
  }
}

bootstrap();
