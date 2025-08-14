const google_api_key = "AIzaSyC82uO3CQApsEkGAx3xoVjGm7s9BN4_Otk"
function loadDaysFromStorage() {
  try { return JSON.parse(localStorage.getItem("tripDays") || "[]"); }
  catch { return []; }
}

const days = loadDaysFromStorage();
console.table(days);

const API_KEY = "AIzaSyC82uO3CQApsEkGAx3xoVjGm7s9BN4_Otk";

function uniqueCities(days) {
  return [...new Set(days.map(d => (d.location || "").trim()).filter(Boolean))];
}



// Minimal Text Search call
async function searchText(query) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
  
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri"
    },
    body: JSON.stringify({ textQuery: query })
  });
  const data = await res.json();
  return data.places || [];
}

function appendSuggestion(item, { sectionId = "suggestions", city = "" } = {}) {
  const container = document.getElementById(sectionId);
  if (!container) return;

  const card = document.createElement("div");
  card.className = "suggestion-card";

  // If it's a string, just display it
  if (typeof item === "string") {
    card.textContent = city ? `${item} — ${city}` : item;
    container.appendChild(card);
    return;
  }

  // Google Places fields
  const name    = item?.displayName?.text || item?.name || "Unknown place";
  const rating  = item?.rating != null ? `${item.rating}★` : "No rating";
  const reviews = item?.userRatingCount != null ? `(${item.userRatingCount})` : "";
  const address = item?.formattedAddress || "";
  const mapsUrl = item?.googleMapsUri || "";

  // City heading (from localStorage)
  if (city) {
    const cityEl = document.createElement("p");
    cityEl.textContent = `City: ${city}`;
    cityEl.style.fontStyle = "italic";
    card.appendChild(cityEl);
  }

  const h3 = document.createElement("h3");
  h3.textContent = name;
  const p1 = document.createElement("p");
  p1.textContent = `${rating} ${reviews}`.trim();
  const p2 = document.createElement("p");
  p2.textContent = address;

  card.appendChild(h3);
  card.appendChild(p1);
  card.appendChild(p2);

  if (mapsUrl) {
    const a = document.createElement("a");
    a.href = mapsUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Open in Google Maps";
    card.appendChild(a);
  }

  container.appendChild(card);
}

function selectFromList(options, { sectionId = "suggestions" } = {}) {
  if (!Array.isArray(options) || options.length === 0) return;
  const i = Math.floor(Math.random() * options.length);
  appendSuggestion(options[i], { sectionId });
}

(async () => {
  const cities = uniqueCities(loadDaysFromStorage());

  for (const city of cities) {
    const restaurants = await searchText(`best restaurants in ${city}`);
    const attractions = await searchText(`top tourist attractions in ${city}`);



    console.group(`Results for ${city}`);
    console.log("Restaurants:", restaurants.map(p => ({
      name: p.displayName?.text,
      rating: p.rating,
      reviews: p.userRatingCount,
      address: p.formattedAddress,
      maps: p.googleMapsUri
    })));
    console.log("Attractions:", attractions.map(p => ({
      name: p.displayName?.text,
      rating: p.rating,
      reviews: p.userRatingCount,
      address: p.formattedAddress,
      maps: p.googleMapsUri
    })));

    selectFromList(restaurants);
    selectFromList(attractions);
    console.groupEnd();
  }
})();
