"use strict";

/* ==========================
   INDEX (splash screen)
   ========================== */
if (document.querySelector(".splash-screen")) {
  document.addEventListener("DOMContentLoaded", () => {
    const logo = document.querySelector(".logo");
    const splash = document.querySelector(".splash-screen");

    // Logo-animation
    setTimeout(() => logo.classList.add("animate"), 800);

    // Fade ud efter 2.5 sekunder
    setTimeout(() => splash.classList.add("fade-out"), 2500);

    // Skift til location.html efter 3.5 sekunder
    setTimeout(() => {
      window.location.href = "sites/location.html";
    }, 3500);
  });
}

/* ==========================
   LOCATION (fade in)
   ========================== */

if (document.querySelector(".location")) {
  document.addEventListener("DOMContentLoaded", () => {
    const locationSection = document.querySelector(".location");

    // Fade ind
    setTimeout(() => locationSection.classList.add("fade-in"), 100);
  });
}

/* ==========================
   SPILGALLERI (navbar, dialog osv.)
   ========================== */

if (document.querySelector(".spilgalleri-titel")) {
  console.log("🎮 Spilgalleri loaded");
}

// Back button (sikker måde)
const backBtn = document.querySelector(".back-btn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "../sites/location.html";
  });
}

let allGames = [];

// sørger for at engelske spil henter en som sprog og ikke da
const englishTitle = new Set (["Sequence", "Ticket to Ride: Europe", "Pandemic", "Dixit", "Codenames", "7 Wonders", "Scrabble"]);

function getTitleLangAttr(title) {
  return englishTitle.has(title) ? 'lang="en"' : "";
}

// #2: Fetch games from JSON file
async function getGames() {
  const response = await fetch("../data/games.json");
  allGames = await response.json();
  console.log("📁 Games loaded:", allGames.length);
  // populateCategoryDropdown(); // Remove or comment out if not implemented
  displayGames(allGames);
}

// #3: Display all games
function displayGames(games) {
  const gameList = document.querySelector(".game-list-all");
  if (!gameList) return;
  gameList.innerHTML = "";

  for (const game of games) {
    displayGame(game);
  }
}

// #4: Render a single game card and add event listeners
// h2 class - ${getTitleLangAttr} henter titler med en og ændre lang fra da til en
function displayGame(game) {
  const gameList = document.querySelector(".game-list-all");
  if (!gameList) return;

  const gameHTML = `
 <article class="game-card" data-id="${game.id}">
  <div class="top-card">
    <img src="${game.image}" alt="" class="game-image" />
  </div>
  <div class="bottom-card">
    <h2 class="card-titel"><button type="button" class="card-open-btn" ${getTitleLangAttr(game.title)}>${game.title}</button></h2>
    <ul class="tag-list" role="list">
      <li class="tags">${game.age}+ år</li>
      <li class="tags">bedømmelse ${game.rating}/5</li>
      <li class="tags">Sværhedsgrad ${game.difficulty}</li>
      <li class="tags">Genre ${game.genre}</li>
      <li class="tags">Spilletid ${game.playtime} min</li>
      <li class="tags">Spillere ${game.players.min}–${game.players.max}</li>
      <li class="tags">Sprog ${game.language}</li>
      <li class="tags">Hylde ${game.shelf}</li>
    </ul>
    <p class="card-description">${game.description}</p>
  </div>
</article>
  `;
  gameList.insertAdjacentHTML("beforeend", gameHTML);

  // Tilføj click event til den nye card
  const newCard = gameList.lastElementChild;
  newCard.addEventListener("click", function () {
    showGameModal(game.id);
  });
}

// #6: Vis game details (Session 3 version - bliver erstattet med modal i Del 2)
function showGameDetails(game) {
  alert(`
🎬 ${games.title} (${game.year})

🎭 Genre: ${games.genre.join(", ")}
⭐ Rating: ${games.rating}
🎥 Director: ${games.director}
👥 Actors: ${games.actors.join(", ")}

📝 ${games.description}
  `);
}

//Game Card Dialog
function getDifficultyClass(difficulty) {
  switch (difficulty.toLowerCase()) {
    case "let":
      return "difficulty-easy";
    case "mellem":
      return "difficulty-medium";
    case "svær":
      return "difficulty-hard";
    default:
      return "";
  }
}

function showGameModal(id) {
  const game = allGames.find((g) => g.id == id);
  if (!game) return;

  document.querySelector("#dialog-content").innerHTML = /*html*/ `

    <img src="${game.image}" alt="" class="game-image" />
    <div class="dialog-details">
      <h2 id="dialog-title" tabindex="-1" ${getTitleLangAttr(game.title)}>${game.title}</h2>
      <ul class="fact-list" role="list">
        <li><span class="fact-label">Genre</span> ${game.genre}</li>
        <li><span class="fact-label">Alder</span> ${game.age}+ år</li>
        <li><span class="fact-label">Spilletid</span> ${game.playtime} min</li>
        <li><span class="fact-label">Sværhedsgrad</span> ${game.difficulty}</li>
        <li><span class="fact-label">Spillere</span> ${game.players.min}–${game.players.max}</li>
        <li><span class="fact-label">Bedømmelse</span> ${game.rating}/5</li>
        <li><span class="fact-label">Sprog</span> ${game.language}</li>
        <li><span class="fact-label">Hylde</span> ${game.shelf}</li>
      </ul>
      <h3>Om spillet</h3>
      <p class="game-description">${game.description}</p>
      <details>
      <summary>Vis regler</summary>
      <p class="game-rules">${game.rules}</p>
      </details>
    </div>
  
  `;

  document.querySelector("#game-dialog").showModal();
  requestAnimationFrame(() => document.querySelector("#dialog-title").focus());
}

// Luk dialog på klik af X
document.querySelector("#close-dialog").addEventListener("click", () => {
  document.querySelector("#game-dialog").close();
});

// Dropdown-menu //// Åbn/luk dropdowns


// FILTRERINGSSYSTEM //

// værdier fra input felter
function filterGames() {
  const searchValue = document
    .querySelector("#search-input")
    .value.toLowerCase();
  const difficultyValue = document.querySelector("#difficulty-select").value;
  const ageValue = document.querySelector("#age-select").value;
  const genreValue = document.querySelector("#genre-select").value;
  const playtimeValue = document.querySelector("#playtime-select").value;

  // Start med alle spil - kopieres efterfølgende
  let filteredGames = allGames;

  // filtrer på spil titel
  if (searchValue) {
    // Kun filtrer hvis der er indtastet noget
    filteredGames = filteredGames.filter((game) => {
      // includes() checker om søgeteksten findes i titlen
      return game.title.toLowerCase().includes(searchValue);
    });
  }

  // filtrer på valgt sværhedsgrad
  if (difficultyValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredGames = filteredGames.filter((game) => {
      // Eksakt match på sværhedsgrad
      return game.difficulty === difficultyValue;
    });
  }

  // FILTER 3: Alder - filtrer på aldersgrænse
  if (ageValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    const filterAge = Number(ageValue) || 0;
    filteredGames = filteredGames.filter((game) => {
      // Check om spillets alder er mindre eller lig filterens alder
      return game.age <= filterAge;
    });
  }

  // filtrer på valgt genre
  if (genreValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    filteredGames = filteredGames.filter((game) => {
      // Eksakt match på genre
      return game.genre === genreValue;
    });
  }

  // Spilletid - filtrer på spilletid
  if (playtimeValue !== "all") {
    // Kun filtrer hvis ikke "all" er valgt
    const filterTime = Number(playtimeValue) || 0;
    filteredGames = filteredGames.filter((game) => {
      // Check om spillets spilletid er større eller lig filterens tid
      return game.playtime >= filterTime;
    });
  }

  // Vis de filtrerede spil på siden
  const message = filteredGames.length === 0 ? "Ingen spil matcher, nulstil filtrene og prøv igen" : `${filteredGames.length} spil fundet`;
  document.querySelectorAll(".result-count").forEach((p) => (p.textContent = message));
  
  displayGames(filteredGames);
}

// Event listeners til alle filtre
document.addEventListener("DOMContentLoaded", () => {
  getGames();

  // Event listener til søgning
  document
    .querySelector("#search-input")
    .addEventListener("input", filterGames);

  // Event listeners til alle filter-dropdowns
  document
    .querySelector("#difficulty-select")
    .addEventListener("change", filterGames);
  document.querySelector("#age-select").addEventListener("change", filterGames);
  document
    .querySelector("#genre-select")
    .addEventListener("change", filterGames);
  document
    .querySelector("#playtime-select")
    .addEventListener("change", filterGames);

  const filterDialog = document.querySelector("#filter-dialog");
  document.querySelector("#open-filter").addEventListener("click", () => {
    filterDialog.showModal();
  });

  document.querySelector("#reset-filter").addEventListener("click", () => {
    document.querySelectorAll("#filter-dialog select").forEach((select) => {
      select.value = "all";
    });
    filterGames();
});

});