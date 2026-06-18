// Get all needed DOM elements
const form = document.getElementById("checkInForm");
const nameInput = document.getElementById("attendeeName");
const teamSelect = document.getElementById("teamSelect");

// UI elements for feedback
const greetingEl = document.getElementById("greeting");
const attendeeCountEl = document.getElementById("attendeeCount");
const progressBar = document.getElementById("progressBar");
const checkInBtn = document.getElementById("checkInBtn");
const resetBtn = document.getElementById("resetBtn");
const attendeeListEl = document.getElementById("attendeeList");

// Team ids and in-memory counts
const teamIds = {
  water: "waterCount",
  zero: "zeroCount",
  power: "powerCount",
};

const teamCounts = {};
const attendees = [];
Object.keys(teamIds).forEach(function (key) {
  var el = document.getElementById(teamIds[key]);
  var parsed = el ? parseInt(el.textContent, 10) : NaN;
  teamCounts[key] = !isNaN(parsed) ? parsed : 0;
  if (el) el.textContent = String(teamCounts[key]);
});

// Track attendance
let count = 0;
const maxCount = 50;
let celebrationShown = false;
const storageKey = "intelEventCheckInState";

// Helper to update progress bar visuals from current count
function updateProgressBar() {
  if (!progressBar) return;
  var numeric = Math.round((count / maxCount) * 100);
  numeric = Math.min(Math.max(numeric, 0), 100);
  progressBar.style.width = numeric + "%";
  progressBar.setAttribute("aria-valuenow", String(Math.min(count, maxCount)));
}

function saveState() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        count: count,
        teamCounts: teamCounts,
        attendees: attendees,
      }),
    );
  } catch (error) {
    console.warn("Unable to save check-in state:", error);
  }
}

function resetAttendanceState() {
  count = 0;
  celebrationShown = false;

  Object.keys(teamIds).forEach(function (key) {
    teamCounts[key] = 0;
  });

  attendees.length = 0;

  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Unable to clear check-in state:", error);
  }

  if (attendeeCountEl) {
    attendeeCountEl.textContent = "0";
  }

  Object.keys(teamIds).forEach(function (key) {
    var teamEl = document.getElementById(teamIds[key]);
    if (teamEl) {
      teamEl.textContent = "0";
    }
  });

  if (greetingEl) {
    greetingEl.textContent = "Attendance has been reset.";
    greetingEl.classList.add("success-message");
    greetingEl.classList.remove("celebration-message");
    greetingEl.style.display = "block";
  }

  if (checkInBtn) {
    checkInBtn.disabled = false;
  }

  clearWinningHighlights();
  renderAttendeeList();
  updateProgressBar();
}

function loadState() {
  try {
    var storedState = localStorage.getItem(storageKey);
    if (!storedState) return;

    var parsedState = JSON.parse(storedState);

    if (parsedState && typeof parsedState === "object") {
      if (
        parsedState.teamCounts &&
        typeof parsedState.teamCounts === "object"
      ) {
        Object.keys(teamIds).forEach(function (key) {
          if (typeof parsedState.teamCounts[key] === "number") {
            teamCounts[key] = parsedState.teamCounts[key];
          }
        });
      }

      if (typeof parsedState.count === "number") {
        count = parsedState.count;
      } else {
        count = Object.keys(teamCounts).reduce(function (total, key) {
          return total + (teamCounts[key] || 0);
        }, 0);
      }

      if (Array.isArray(parsedState.attendees)) {
        attendees.length = 0;
        parsedState.attendees.forEach(function (item) {
          if (
            item &&
            typeof item.name === "string" &&
            typeof item.team === "string" &&
            typeof item.teamName === "string"
          ) {
            attendees.push({
              name: item.name,
              team: item.team,
              teamName: item.teamName,
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn("Unable to load check-in state:", error);
  }
}

function renderAttendeeList() {
  if (!attendeeListEl) return;

  attendeeListEl.innerHTML = "";

  if (attendees.length === 0) {
    var emptyItem = document.createElement("li");
    emptyItem.textContent = "No attendees checked in yet.";
    attendeeListEl.appendChild(emptyItem);
    return;
  }

  attendees.forEach(function (attendee) {
    var item = document.createElement("li");

    var nameSpan = document.createElement("span");
    nameSpan.className = "attendee-name";
    nameSpan.textContent = attendee.name;

    var teamSpan = document.createElement("span");
    teamSpan.className = "attendee-team";
    teamSpan.textContent = attendee.teamName;

    item.appendChild(nameSpan);
    item.appendChild(teamSpan);
    attendeeListEl.appendChild(item);
  });
}

function renderSavedCounts() {
  if (attendeeCountEl) {
    attendeeCountEl.textContent = String(count);
  }

  Object.keys(teamIds).forEach(function (key) {
    var teamEl = document.getElementById(teamIds[key]);
    if (teamEl) {
      teamEl.textContent = String(teamCounts[key] || 0);
    }
  });
}

function clearWinningHighlights() {
  Object.keys(teamIds).forEach(function (key) {
    var card = document.querySelector(".team-card." + key);
    if (card) {
      card.classList.remove("winning-team");
    }
  });
}

function getWinningTeams() {
  var highestCount = 0;
  var winners = [];

  Object.keys(teamCounts).forEach(function (key) {
    var currentCount = teamCounts[key] || 0;
    if (currentCount > highestCount) {
      highestCount = currentCount;
      winners = [key];
    } else if (currentCount === highestCount) {
      winners.push(key);
    }
  });

  return winners;
}

function showCelebration() {
  if (celebrationShown) return;

  celebrationShown = true;
  clearWinningHighlights();

  var winners = getWinningTeams();
  var winnerNames = {
    water: "Team Water Wise",
    zero: "Team Net Zero",
    power: "Team Renewables",
  };

  if (winners.length === 1) {
    var winningKey = winners[0];
    var winningCard = document.querySelector(".team-card." + winningKey);
    if (winningCard) {
      winningCard.classList.add("winning-team");
    }

    if (greetingEl) {
      greetingEl.textContent =
        "🎉 Attendance goal reached! " +
        winnerNames[winningKey] +
        " wins with " +
        (teamCounts[winningKey] || 0) +
        " check-ins.";
      greetingEl.classList.add("success-message");
      greetingEl.classList.add("celebration-message");
      greetingEl.style.display = "block";
    }
  } else if (winners.length > 1) {
    winners.forEach(function (key) {
      var tiedCard = document.querySelector(".team-card." + key);
      if (tiedCard) {
        tiedCard.classList.add("winning-team");
      }
    });

    if (greetingEl) {
      greetingEl.textContent =
        "🎉 Attendance goal reached! It's a tie between " +
        winners
          .map(function (key) {
            return winnerNames[key];
          })
          .join(", ") +
        ".";
      greetingEl.classList.add("success-message");
      greetingEl.classList.add("celebration-message");
      greetingEl.style.display = "block";
    }
  }
}

// Restore saved counts first, then render them into the DOM
loadState();
renderSavedCounts();
renderAttendeeList();

// If capacity already reached, disable check-in
if (checkInBtn && count >= maxCount) {
  checkInBtn.disabled = true;
  showCelebration();
}

// Ensure progress bar reflects initial count on load
updateProgressBar();

if (resetBtn) {
  resetBtn.addEventListener("click", function () {
    resetAttendanceState();
    form.reset();
  });
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
    showCelebration();
    if (checkInBtn) checkInBtn.disabled = true;
    return;
  }

  // Increment count
  count++;
  console.log("Total check-ins:", count);

  // Update progress bar (numeric percent)
  var percent = Math.round((count / maxCount) * 100);
  console.log("Progress:", percent + "%");

  // Update attendee count in header (cap at maxCount)
  const displayedCount = Math.min(count, maxCount);
  if (attendeeCountEl) {
    attendeeCountEl.textContent = String(displayedCount);
  }

  // Update visual progress bar
  updateProgressBar();

  // Validate team selection and update team counts
  if (!team || !teamIds.hasOwnProperty(team)) {
    // invalid team selection — revert total count and warn
    count = Math.max(0, count - 1);
    if (attendeeCountEl) attendeeCountEl.textContent = String(count);
    updateProgressBar();
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

  attendees.push({
    name: name,
    team: team,
    teamName: teamName,
  });
  renderAttendeeList();

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
    showCelebration();
  }

  saveState();

  form.reset();
});
