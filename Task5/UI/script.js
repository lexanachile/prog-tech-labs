const catalogFilter = document.querySelector("#catalog-filter");
const catalogCategory = document.querySelector("#catalog-category");
const catalogItems = document.querySelectorAll("#catalog-list li");
const catalogEmpty = document.querySelector("#catalog-empty");

function normalize(text) {
  return text.trim().toLowerCase().replaceAll("ё", "е");
}

catalogFilter.addEventListener("submit", (event) => {
  event.preventDefault();
  const product = normalize(catalogFilter.elements.product.value);
  const category = normalize(catalogFilter.elements.category.value);
  const categoryMatches = normalize(catalogCategory.textContent).includes(category);
  let hasResults = false;

  for (const item of catalogItems) {
    const matches = categoryMatches && normalize(item.textContent).includes(product);
    item.hidden = !matches;
    hasResults = hasResults || matches;
  }

  catalogCategory.hidden = !hasResults;
  catalogEmpty.hidden = hasResults;
});

const productNames = new Map();
for (const item of catalogItems) {
  productNames.set(item.dataset.product, item.querySelector("span").textContent);
}

// Точные даты записей. Декада вычисляется по календарю при выводе.
const priceChanges = [
  ["home", "2026-01-05", "10,99"],
  ["poteshki", "2026-01-05", "4,69"],
  ["home", "2026-03-25", "13,09"],
  ["classic", "2026-03-25", "5,79"],
  ["home", "2026-09-19", "13,45"],
  ["classic", "2026-09-19", "4,65"],
  ["poteshki", "2026-09-19", "5,92"],
  ["poteshki", "2026-11-09", "4,59"],
  ["classic", "2026-11-23", "4,39"]
];

const months = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря"
];
const historyFilter = document.querySelector("#history-filter");
const historyPeriod = document.querySelector("#history-period");
const historyRows = document.querySelector("#history-rows");

function formatDate(date) {
  return date.split("-").reverse().join(".");
}

function renderHistory(product, start, end) {
  const changes = priceChanges.filter(([id, date]) =>
    (!product || id === product) && date >= start && date <= end
  );
  const title = productNames.get(product) || "Все товары";
  historyPeriod.textContent = title + ". Период: " + formatDate(start) + "–" + formatDate(end) + ".";
  historyRows.replaceChildren();

  for (let month = 1; month <= 12; month++) {
    const lastDay = new Date(2026, month, 0).getDate();
    const monthPrefix = "2026-" + String(month).padStart(2, "0") + "-";

    for (const [first, last] of [[1, 10], [11, 20], [21, lastDay]]) {
      const firstDate = monthPrefix + String(first).padStart(2, "0");
      const lastDate = monthPrefix + last;
      if (lastDate < start || firstDate > end) {
        continue;
      }

      const row = historyRows.insertRow();
      row.insertCell().textContent = first + "–" + last + " " + months[month - 1];
      const details = row.insertCell();
      const entries = changes.filter(([, date]) => date >= firstDate && date <= lastDate);

      if (entries.length === 0) {
        details.textContent = "Нет записей";
      }

      for (const [id, date, price] of entries) {
        const entry = document.createElement("div");
        const time = document.createElement("time");
        time.dateTime = date;
        time.textContent = formatDate(date);
        entry.append(time, " · " + productNames.get(id) + " · " + price + " BYN");
        details.append(entry);
      }
    }
  }
}

historyFilter.addEventListener("submit", (event) => {
  event.preventDefault();
  const start = historyFilter.elements["start-date"].value;
  const end = historyFilter.elements["end-date"].value;

  if (start > end) {
    location.hash = "error";
    return;
  }

  renderHistory(historyFilter.elements.product.value, start, end);
  location.hash = "price-history-result";
});

renderHistory("", "2026-01-01", "2026-12-31");
