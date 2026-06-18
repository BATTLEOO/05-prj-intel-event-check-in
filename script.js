// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// UI elements for feedback
const greetingEl = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const checkInBtn = document.getElementById("checkInBtn");

// Team ids and in-memory counts
const teamIds = {
  water: "waterCount",
  zero: "zeroCount",
  power: "powerCount",
};

const teamCounts = {};
Object.keys(teamIds).forEach(function (key) {
  var el = document.getElementById(teamIds[key]);
  var parsed = el ? parseInt(el.textContent, 10) : NaN;
  teamCounts[key] = !isNaN(parsed) ? parsed : 0;
  if (el) el.textContent = String(teamCounts[key]);
});

// Track attendance
let count = 0;
const maxCount = 50;

// Initialize count from the DOM if the page already shows a value
if (attendeeCountEl) {
  const parsed = parseInt(attendeeCountEl.textContent, 10);
  if (!isNaN(parsed)) {
    count = parsed;
  } else {
    attendeeCountEl.textContent = String(count);
  }
}

// If capacity already reached, disable check-in
if (checkInBtn && count >= maxCount) {
  checkInBtn.disabled = true;
  if (greetingEl) {
    greetingEl.textContent = "Maximum attendees reached.";
    greetingEl.classList.add("success-message");
    greetingEl.style.display = "block";
  }
}

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // avoid refresh
  // Get form vlaues
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(name, team, teamName);

  // Prevent incrementing past capacity
  if (count >= maxCount) {
    if (greetingEl) {
      greetingEl.textContent = "Maximum attendees reached.";
      greetingEl.classList.add("success-message");
      greetingEl.style.display = "block";
    }
    if (checkInBtn) checkInBtn.disabled = true;
    return;
  }

  // Increment count
  count++;
  console.log("Total check-ins:", count);

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log(`Progress: ${percentage}`);

  // Update attendee count in header (cap at maxCount)
  const displayedCount = Math.min(count, maxCount);
  if (attendeeCountEl) {
    attendeeCountEl.textContent = String(displayedCount);
  }

  // Update visual progress bar
  if (progressBar) {
    // cap width at 100%
    const width = Math.min(parseInt(percentage, 10), 100) + "%";
    progressBar.style.width = width;
    progressBar.setAttribute("aria-valuenow", String(displayedCount));
  }

  // Validate team selection and update team counts
  if (!team || !teamIds.hasOwnProperty(team)) {
    // invalid team selection — revert total count and warn
    count = Math.max(0, count - 1);
    if (attendeeCountEl) attendeeCountEl.textContent = String(count);
    console.warn("Invalid team selected:", team);
    if (greetingEl) {
      greetingEl.textContent = "Please select a valid team.";
      greetingEl.classList.add("success-message");
      greetingEl.style.display = "block";
    }
    return;
  }

  // Increment in-memory team count and update DOM
  teamCounts[team] = (teamCounts[team] || 0) + 1;
  var teamEl = document.getElementById(teamIds[team]);
  if (teamEl) teamEl.textContent = String(teamCounts[team]);

  // Show welcome message
  const message = "Welcome, " + name + " from " + teamName + "!";
  console.log(message);

  if (greetingEl) {
    greetingEl.textContent = message;
    greetingEl.setAttribute("aria-live", "polite");
    greetingEl.classList.add("success-message");
    greetingEl.style.display = "block";
  }

  // Disable button if we've reached capacity
  if (count >= maxCount && checkInBtn) {
    checkInBtn.disabled = true;
  }

  form.reset();
});
