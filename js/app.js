"use strict";

/* ==========================
   SPILGALLERI (navbar, dialog osv.)
   ========================== */

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

  let languageBadge;

  if (game.language === "Dansk") {
    languageBadge = `<li class="badge badge-icon"><img src="../img/svg-icons/danish-language-icon.svg" alt="Sprog: dansk"></li>`;
  } else if (game.language === "English") {
    languageBadge = `<li class="badge badge-icon"><img src="../img/svg-icons/english-language-icon.svg" alt="Sprog: engelsk"></li>`;
  } else {
    languageBadge = `<li class="badge"><span class="visually-hidden">Sprog: </span>${game.language}</li>`;
  }

    let difficultyClass;

  if (game.difficulty === "Let") {
    difficultyClass = "badge-let";
  } else if (game.difficulty === "Mellem") {
    difficultyClass = "badge-mellem";
  } else {
    difficultyClass = "badge-svaer";
  }

  const gameHTML = `
 <article class="game-card" data-id="${game.id}">
  <div class="top-card">
    <img src="${game.image}" alt="" class="game-image"/>
  </div>
  <div class="bottom-card">
    <h2 class="card-titel"><button type="button" class="card-open-btn" ${getTitleLangAttr(game.title)}>${game.title}</button></h2>
 <ul class="card-badges" role="list">
      ${languageBadge}
      <li class="badge ${difficultyClass}"><span class="visually-hidden">Sværhedsgrad: </span>${game.difficulty}</li>
    </ul>
    <p class="card-description">${game.description}</p>
      <ul class="fact-list" role="list">
        <li><span class="fact-label">Genre</span> ${game.genre}</li>
        <li><span class="fact-label">Alder</span> ${game.age}+ år</li>
        <li><span class="fact-label">Spilletid</span> ${game.playtime} min</li>
        <li><span class="fact-label">Spillere</span> ${game.players.min}–${game.players.max}</li>
      </ul>
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
        <li><span class="fact-label">Bedømmelse</span> ${game.rating} ud af 5</li>
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
  // "vis regler" in dialog scrolls to text 
  const rulesDetails = document.querySelector("#dialog-content details");
  rulesDetails.addEventListener("toggle", () => {
    if (rulesDetails.open) rulesDetails.scrollIntoView({ block: "nearest" });
  });
  // requesting to focus title instead of close dialog btn
  requestAnimationFrame(() => document.querySelector("#dialog-title").focus());
}

// Luk dialog på klik af X
const closeDialog = document.querySelector("#close-dialog");
if (closeDialog) {
  closeDialog.addEventListener("click", () => {
    document.querySelector("#game-dialog").close();
  });
}
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
  const message = filteredGames.length === 0 ? "Ingen spil matcher, nulstil filtrene og prøv igen" : `${filteredGames.length} spil matcher dine filtre`;
  document.querySelectorAll(".result-count").forEach((p) => (p.textContent = message));
  
  displayGames(filteredGames);
}

// Event listeners til alle filtre
document.addEventListener("DOMContentLoaded", () => {
  if (!document.querySelector(".game-list-all")) return;
  getGames();

  // Event listener for dialog and nav searchbar
    const searchInputs = document.querySelectorAll('input[type="search"]');
    searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      searchInputs.forEach((other) => (other.value = input.value));
      filterGames();
    });
  });

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
    searchInputs.forEach((input) => (input.value = ""));
    filterGames();
});
  });