const API_KEY = "67abd88567c24f259ac23735251108";


function saveDaysToStorage() {
  const allDays = readAllDays();
  localStorage.setItem("tripDays", JSON.stringify(allDays));
  return allDays; 
}
function loadDaysFromStorage() {
  try { return JSON.parse(localStorage.getItem("tripDays") || "[]"); }
  catch { return []; }
}

function calcClothing(high, low, average) {
  let suggestions = [];


  if (low < 40) {
    suggestions.push("Bring a heavy coat, gloves, and warm layers");
  } else if (low < 55) {
    suggestions.push("Pack a jacket or two and a pair of pants");
  } else if (low < 65) {
    suggestions.push("Bring a light jacket or sweater for cooler mornings/evenings");
  }

 
  if (high > 85) {
    suggestions.push("Include light, breathable clothing and sunscreen");
  } else if (average >= 65 && average <= 80) {
    suggestions.push("Stick to mostly warm-weather clothes");
  }

  
  if (average < 65 && low >= 55 && high <= 75) {
    suggestions.push("Mix of light sweaters and short sleeves");
  }

  return suggestions.join(". ") + ".";

}


function readAllDays() {
  const rows = document.querySelectorAll("#daysView .day");
  return Array.from(rows).map(row => {
    const date = row.querySelector('input[name$="[date]"]')?.value || "";
    const location = row.querySelector('input[name$="[location]"]')?.value || "";
    return { date, location };
  });
}


function ensureWeatherSlot(row) {
  let el = row.querySelector(".weather");
  if (!el) {
    el = document.createElement("div");
    el.className = "weather";
    el.style.marginTop = "0.5rem";
    row.appendChild(el);
  }
  return el;
}


async function getWeatherData() {
  const days = readAllDays();
  const rows = document.querySelectorAll("#daysView .day");
  let tripAvg = 0
  let count = 0
  let high = 0
  let low = 150
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day.date || !day.location) continue;

    const row = rows[i];
    const slot = ensureWeatherSlot(row);
    slot.textContent = "Loading…";

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${encodeURIComponent(day.location)}&dt=${day.date}`;
    const res = await fetch(url);
    const data = await res.json();

    const avgF = data?.forecast?.forecastday?.[0]?.day?.avgtemp_f;

    tripAvg += avgF
    count ++

    if(avgF >= high){
      high = avgF
    }

    if (avgF <= low){
      low = avgF
    }

    slot.textContent = (avgF != null)
      ? `Weather for ${day.date}: ${avgF}°F`
      : `No forecast found`;


  }
    let average = tripAvg/count
    console.log(tripAvg/count)
    console.log(high,low)
    let clothingSuggestion = calcClothing(high, low, average);
    const suggestion = document.querySelector("#clothesSuggestion");
    suggestion.innerHTML = `<p>Average Temperature: ${average}</p>
    <p>High: ${high}</p>
    <p>Low: ${low}</p>
    <p>Clothing Suggestion: ${clothingSuggestion}</p>`
 
}


function showDays(count) {
  const container = document.getElementById("daysView");
  const n = parseInt(count, 10) || 0;

 
  const domSaved = Array.from(container.querySelectorAll(".day")).map((dayEl, i) => ({
    date: dayEl.querySelector(`[name="days[${i}][date]"]`)?.value || "",
    location: dayEl.querySelector(`[name="days[${i}][location]"]`)?.value || ""
  }));
  const lsSaved = loadDaysFromStorage();

  container.innerHTML = "";

  for (let i = 0; i < n; i++) {
    const wrapper = document.createElement("fieldset");
    wrapper.className = "day";
    wrapper.innerHTML = `
      <legend>Day ${i + 1}</legend>
      <label>
        Date
        <input type="date" name="days[${i}][date]" id="day${i}" required>
      </label>
      <label>
        Location
        <input type="text" name="days[${i}][location]" placeholder="City or venue" id="place${i}" required>
      </label>
    `;

    // restore (DOM wins, else localStorage)
    const v = domSaved[i] || lsSaved[i] || {};
    if (v.date)     wrapper.querySelector(`[name="days[${i}][date]"]`).value = v.date;
    if (v.location) wrapper.querySelector(`[name="days[${i}][location]"]`).value = v.location;


    wrapper.appendChild(Object.assign(document.createElement("div"), { className: "weather" }));

    container.appendChild(wrapper);
  }
}


document.getElementById("days").addEventListener("input", (e) => {
  showDays(e.target.value);
  saveDaysToStorage();
  let data = saveDaysToStorage();
  console.log(data)

});


let t;
document.getElementById("daysView").addEventListener("input", (e) => {
  if (!e.target.matches('input[type="date"], input[name$="[location]"]')) return;
  saveDaysToStorage();
  clearTimeout(t);
  t = setTimeout(() => getWeatherData(), 300);
  let data = saveDaysToStorage();
  console.log(data)
});
