import { buildQuoteCardHtml, buildTopicFacets, filterQuotes, loadQuotes, paginate } from "./data.js";

function getFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get("q") || "",
    topic: params.get("topic") || "",
    page: Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1),
  };
}

function updateUrl({ q, topic, page }) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (topic) {
    params.set("topic", topic);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  window.location.search = query ? `?${query}` : "";
}

function renderTopicSelect(topics, selectedTopic) {
  const select = document.querySelector("#topic");
  if (!select) {
    return;
  }

  const options = [
    `<option value="">全部主题</option>`,
    ...topics.map(
      (topic) =>
        `<option value="${topic.name}"${topic.name === selectedTopic ? " selected" : ""}>${topic.name}（${topic.count}）</option>`
    ),
  ];
  select.innerHTML = options.join("");
}

function renderCards(quotes) {
  const container = document.querySelector("#quote-grid");
  if (!container) {
    return;
  }

  if (!quotes.length) {
    container.innerHTML = '<p class="empty-state">没有匹配结果，试试更少筛选条件。</p>';
    return;
  }

  container.innerHTML = quotes.map((quote) => buildQuoteCardHtml(quote)).join("");
}

function buildPageLink(filters, page) {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.topic) {
    params.set("topic", filters.topic);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `quotes.html?${query}` : "quotes.html";
}

function renderPagination(pagination, filters) {
  const container = document.querySelector("#pagination");
  if (!container) {
    return;
  }

  const prevLink =
    pagination.page > 1
      ? `<a href="${buildPageLink(filters, pagination.page - 1)}">上一页</a>`
      : "";
  const nextLink =
    pagination.page < pagination.totalPages
      ? `<a href="${buildPageLink(filters, pagination.page + 1)}">下一页</a>`
      : "";

  container.innerHTML = `${prevLink}<span>第 ${pagination.page} / ${pagination.totalPages} 页</span>${nextLink}`;
}

function bindForm(initialFilters) {
  const form = document.querySelector("#filter-form");
  const inputQ = document.querySelector("#q");
  const selectTopic = document.querySelector("#topic");
  if (!form || !inputQ || !selectTopic) {
    return;
  }

  inputQ.value = initialFilters.q;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateUrl({
      q: inputQ.value.trim(),
      topic: selectTopic.value,
      page: 1,
    });
  });
}

async function bootstrap() {
  try {
    const allQuotes = await loadQuotes();
    const filters = getFiltersFromUrl();
    const topics = buildTopicFacets(allQuotes);
    renderTopicSelect(topics, filters.topic);
    bindForm(filters);

    const filtered = filterQuotes(allQuotes, { keyword: filters.q, topic: filters.topic });
    const pagination = paginate(filtered, filters.page, 9);

    const result = document.querySelector("#result-count");
    if (result) {
      result.textContent = `共找到 ${pagination.total} 条语录`;
    }

    renderCards(pagination.items);
    renderPagination(pagination, filters);
  } catch (error) {
    console.error(error);
    const container = document.querySelector("#quote-grid");
    if (container) {
      container.innerHTML = '<p class="empty-state">数据加载失败，请稍后重试。</p>';
    }
  }
}

bootstrap();

