// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// UI elements for feedback
const greetingEl = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");

// Track attendance
let count = 0;
const maxCount = 50;

// Handle form submission
form.addEventListener("submit", function (event) {
  event.preventDefault(); // avoid refresh
  // Get form vlaues
  const name = nameInput.value;
  const team = teamSelect.value;
  const teamName = teamSelect.selectedOptions[0].text;

  console.log(name, team, teamName);

  // Increment count
  count++;
  console.log("Total check-ins:", count);

  // Update progress bar
  const percentage = Math.round((count / maxCount) * 100) + "%";
  console.log(`Progress: ${percentage}`);

  // Update attendee count in header
  if (attendeeCountEl) {
    attendeeCountEl.textContent = count;
  }

  // Update visual progress bar
  if (progressBar) {
    progressBar.style.width = percentage;
    progressBar.setAttribute("aria-valuenow", String(count));
  }

  // Update the team counter
  const teamCounter = document.getElementById(team + "Count");
  teamCounter.textContent = parseInt(teamCounter.textContent) + 1;

  // Show welcome message
  const message = "Welcome, " + name + " from " + teamName + "!";
  console.log(message);

  if (greetingEl) {
    greetingEl.textContent = message;
    greetingEl.setAttribute("aria-live", "polite");
    greetingEl.classList.add("success-message");
    greetingEl.style.display = "block";
  }

  form.reset();
});
