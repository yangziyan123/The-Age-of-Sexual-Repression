import { buildQuoteCardHtml, buildTopicFacets, escapeHtml, getFeaturedQuote, loadQuotes } from "./data.js";

function renderFeatured(quote) {
  const container = document.querySelector("#featured-quote");
  if (!container) {
    return;
  }

  if (!quote) {
    container.innerHTML = "<p>暂无语录数据。</p>";
    return;
  }

  container.innerHTML = `
    <span class="featured-label">Featured</span>
    <blockquote>“${escapeHtml(quote.text)}”</blockquote>
    <footer>
      <span>${escapeHtml(quote.source)}</span>
      <a href="quote.html?id=${encodeURIComponent(quote.id)}">阅读全文</a>
    </footer>
  `;
}

function renderTopics(quotes) {
  const container = document.querySelector("#topic-grid");
  if (!container) {
    return;
  }

  const facets = buildTopicFacets(quotes).slice(0, 6);
  container.innerHTML = facets
    .map(
      (topic) => `
        <a class="topic-card" href="quotes.html?topic=${encodeURIComponent(topic.name)}">
          <strong>${escapeHtml(topic.name)}</strong>
          <span>${topic.count} 条语录</span>
        </a>
      `
    )
    .join("");
}

function renderRecent(quotes) {
  const container = document.querySelector("#recent-grid");
  if (!container) {
    return;
  }

  container.innerHTML = quotes.slice(0, 6).map((quote) => buildQuoteCardHtml(quote)).join("");
}

async function bootstrap() {
  try {
    const quotes = await loadQuotes();
    renderFeatured(getFeaturedQuote(quotes));
    renderTopics(quotes);
    renderRecent(quotes);
  } catch (error) {
    console.error(error);
    const featured = document.querySelector("#featured-quote");
    if (featured) {
      featured.innerHTML = "<p>数据加载失败，请稍后重试。</p>";
    }
  }
}

bootstrap();
