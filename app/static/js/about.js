import { buildEraCount, buildTopicFacets, loadQuotes } from "./data.js";

async function bootstrap() {
  try {
    const quotes = await loadQuotes();
    const total = quotes.length;
    const topics = buildTopicFacets(quotes).length;
    const eras = buildEraCount(quotes);

    const totalNode = document.querySelector("#about-total");
    const topicNode = document.querySelector("#about-topics");
    const eraNode = document.querySelector("#about-eras");

    if (totalNode) {
      totalNode.textContent = String(total);
    }
    if (topicNode) {
      topicNode.textContent = String(topics);
    }
    if (eraNode) {
      eraNode.textContent = String(eras);
    }
  } catch (error) {
    console.error(error);
  }
}

bootstrap();

