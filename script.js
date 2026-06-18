// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// UI elements for feedback
const greetingEl = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const checkInBtn = document.getElementById("checkInBtn");

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

  // Update the team counter (guard against missing element)
  const teamCounter = document.getElementById(team + "Count");
  if (teamCounter) {
    const currentTeamCount = parseInt(teamCounter.textContent, 10) || 0;
    teamCounter.textContent = String(currentTeamCount + 1);
  } else {
    console.warn("Team counter element not found for:", team);
  }

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
