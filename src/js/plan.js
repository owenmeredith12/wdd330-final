import { renderHeader } from './components/header.js';
import { loadHeaderFooter } from './utils.js';


renderHeader();
loadHeaderFooter();

const calendarDays = document.getElementById("calendar-days");
const monthYear = document.getElementById("month-year");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

let date = new Date();

const events = {}

function parseLocalDate(str) {
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day); // Correct for 0-based month
}

function openModal(dateStr) {
  const modal = document.getElementById("eventModal");
  const modalDate = document.getElementById("modalDate");
  const titleInput = document.getElementById("eventTitle");
  const placeInput = document.getElementById("eventPlace");

  // Prefill
  modalDate.textContent = `Edit Events for ${dateStr}`;
  titleInput.value = events[dateStr]?.title || "";
  placeInput.value = events[dateStr]?.place || "";

  // Show modal
  modal.classList.remove("hidden");

  // Save handler
  document.getElementById("saveEvent").onclick = () => {
    events[dateStr] = {
      title: titleInput.value,
      place: placeInput.value,
    };
    modal.classList.add("hidden");
    renderDateRange(currentStartDate, currentEndDate); // re-render
  };
}

function renderDateRange(startDateStr, endDateStr) {
  const calendarDays = document.getElementById("calendar-days");
  const monthYear = document.getElementById("month-year");

  // Convert to Date objects
const startDate = parseLocalDate(startDateStr);
const endDate = parseLocalDate(endDateStr);

  // Clear existing content
  calendarDays.innerHTML = "";

  // Set header title
  const startMonth = startDate.toLocaleString("default", { month: "long" });
  const endMonth = endDate.toLocaleString("default", { month: "long" });
  const sameMonth = startMonth === endMonth && startDate.getFullYear() === endDate.getFullYear();

  monthYear.textContent = sameMonth
    ? `${startMonth} ${startDate.getFullYear()}`
    : `${startMonth} ${startDate.getFullYear()} - ${endMonth} ${endDate.getFullYear()}`;

  const days = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); // Normalize time

  // Create list of date objects
  while (current <= endDate) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Add empty boxes before the first day to align weekday
  const firstDayWeekday = days[0].getDay(); // 0 = Sunday
  for (let i = 0; i < firstDayWeekday; i++) {
    const empty = document.createElement("div");
    calendarDays.appendChild(empty);
  }

  // Add each day cell
  days.forEach(dateObj => {
    const dayBox = document.createElement("div");
    dayBox.classList.add("calendar-day");
    dayBox.setAttribute("data-date", dateObj.getDate());

    const isToday = new Date().toDateString() === dateObj.toDateString();
    if (isToday) dayBox.classList.add("today");

    dayBox.addEventListener("click", () => {
      const yyyyMMdd = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"

        dayBox.addEventListener("click", () => {
        openModal(yyyyMMdd);
        });
    });

    document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("eventModal").classList.add("hidden");
});

    calendarDays.appendChild(dayBox);
  });
}

function getDateRange() {
  const startDateInput = document.querySelector(".startDate");
  const endDateInput = document.querySelector(".endDate");

  let selectedStartDate = null;
  let selectedEndDate = null;

  function tryRender() {
    if (selectedStartDate && selectedEndDate) {
      renderDateRange(selectedStartDate, selectedEndDate);
    }
  }

  startDateInput.addEventListener("change", function () {
    selectedStartDate = this.value;
    tryRender();
  });

  endDateInput.addEventListener("change", function () {
    selectedEndDate = this.value;
    tryRender();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  getDateRange();
});

