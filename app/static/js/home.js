import { buildQuoteCardHtml, buildTopicFacets, escapeHtml, getFeaturedQuote, loadQuotes } from "./data.js";

function renderFeatured(quote) {
  const container = document.querySelector("#featured-quote");
  if (!container) {
    return;
  }

  if (!quote) {
    container.innerHTML = "<p>暂无问答数据。</p>";
    return;
  }

  container.innerHTML = `
    <blockquote>“${escapeHtml(quote.question || quote.text)}”</blockquote>
    <footer>
      <a href="quote.html?id=${encodeURIComponent(quote.id)}">点击查看答案</a>
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
          <span>${topic.count} 个问题</span>
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
