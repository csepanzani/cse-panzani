/* =========================================================
   CSE PANZANI - APPLICATION
   Navigation + activités + inscriptions + connexion admin
   ========================================================= */

const pages = {
  actualites: [
    "Actualités",
    "📢",
    "Les dernières informations du CSE, les affichages, les communications RH, CGT et CSSCT."
  ],
  billetterie: [
    "Billetterie",
    "🎟️",
    "Cinémas, parcs d'attractions, spectacles et cartes cadeaux."
  ],
  sorties: [
    "Sorties & voyages",
    "🚌",
    "Retrouvez les voyages, sorties, week-ends et journées organisés par le CSE."
  ],
  offres: [
    "Offres CSE",
    "🎁",
    "Promotions et avantages négociés pour les salariés."
  ],
  agenda: [
    "Agenda",
    "📅",
    "Toutes les dates importantes : inscriptions, sorties, événements et échéances."
  ],
  inscriptions: [
    "Inscriptions",
    "📝",
    "Inscrivez-vous aux prochaines activités directement depuis votre téléphone."
  ],
  documents: [
    "Documents",
    "📄",
    "Règlements, comptes rendus, fiches pratiques et informations utiles."
  ],
  contact: [
    "Contacter le CSE",
    "☎️",
    "Une question ? Retrouvez ici les coordonnées et horaires du CSE."
  ],
  notifications: [
    "Notifications",
    "🔔",
    "Retrouvez ici les dernières notifications du CSE."
  ],
  plus: [
    "Plus",
    "☰",
    "Paramètres et espace administrateur."
  ]
};


/* =========================================================
   OUTILS
   ========================================================= */

function hideHome() {
  const elements = [
    ".welcome",
    ".news",
    ".grid",
    ".feature"
  ];

  elements.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.hidden = true;
  });
}


function showHome() {
  const elements = [
    ".welcome",
    ".news",
    ".grid",
    ".feature"
  ];

  elements.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.hidden = false;
  });

  const content = document.getElementById("content");

  if (content) {
    content.hidden = true;
    content.innerHTML = "";
  }

  document
    .querySelectorAll(".bottom button")
    .forEach(button => button.classList.remove("active"));

  const firstButton = document.querySelector(".bottom button");

  if (firstButton) {
    firstButton.classList.add("active");
  }
}


function goHome() {
  showHome();
}


function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>'"]/g,
    character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    }[character])
  );
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(key) {

  if (key === "sorties") {
    publicActivities();
    return;
  }

  if (key === "plus") {
    showAuth();
    return;
  }

  hideHome();

  const content = document.getElementById("content");

  if (!content) return;

  content.hidden = false;

  const page = pages[key] || pages.actualites;

  content.innerHTML = `
    <button class="back" onclick="goHome()">← Accueil</button>

    <h2>${page[1]} ${page[0]}</h2>

    <p>${page[2]}</p>

    <div class="authBox">
      <p>
        Cette rubrique sera prochainement alimentée
        avec les informations réelles du CSE.
      </p>
    </div>
  `;

  document
    .querySelectorAll(".bottom button")
    .forEach(button => button.classList.remove("active"));
}


/* =========================================================
   DATE
   ========================================================= */

function displayDate() {

  const dateElement = document.getElementById("date");

  if (!dateElement) return;

  dateElement.textContent =
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date());
}


/* =========================================================
   ACTIVITÉS
   ========================================================= */

const demoEvents = [
  {
    id: 1,
    title: "Week-end ski – Saint-Jean-Montclar",
    date: "22–24 janvier 2027",
    price: "130 € adulte",
    places: 18,
    registered: 0
  },
  {
    id: 2,
    title: "Journée Ok Corral",
    date: "11 octobre 2026",
    price: "20 € adulte",
    places: 50,
    registered: 0
  },
  {
    id: 3,
    title: "Disneyland Paris",
    date: "13–15 novembre 2026",
    price: "Selon tarif CSE",
    places: 50,
    registered: 0
  }
];


function getEvents() {

  try {

    const saved = localStorage.getItem("cse_events");

    if (saved) {
      return JSON.parse(saved);
    }

  } catch (error) {
    console.warn("Impossible de lire les activités.", error);
  }

  localStorage.setItem(
    "cse_events",
    JSON.stringify(demoEvents)
  );

  return demoEvents;
}


function saveEvents(events) {

  localStorage.setItem(
    "cse_events",
    JSON.stringify(events)
  );
}


/* =========================================================
   AFFICHAGE DES ACTIVITÉS
   ========================================================= */

function publicActivities() {

  hideHome();

  const content = document.getElementById("content");

  if (!content) return;

  content.hidden = false;

  const events = getEvents();

  let html = `
    <button class="back" onclick="goHome()">← Accueil</button>

    <h2>🚌 Sorties & activités</h2>

    <p>
      Découvrez les prochaines activités proposées par le CSE.
    </p>
  `;

  if (events.length === 0) {

    html += `
      <div class="authBox">
        <p>Aucune activité publiée pour le moment.</p>
      </div>
    `;

  } else {

    events.forEach(event => {

      const available =
        Math.max(0, event.places - event.registered);

      html += `
        <div class="adminEvent">

          <strong>
            ${escapeHtml(event.title)}
          </strong>

          <small>
            📅 ${escapeHtml(event.date)}
          </small>

          <small>
            💶 ${escapeHtml(event.price)}
          </small>

          <small>
            👥 ${available} place(s) disponible(s)
          </small>

          ${
            available > 0
              ? `
                <button
                  class="primary"
                  onclick="registerEvent(${event.id})"
                >
                  📝 S'inscrire
                </button>
              `
              : `
                <button
                  class="adminBtn"
                  disabled
                >
                  Activité complète
                </button>
              `
          }

        </div>
      `;
    });
  }

  content.innerHTML = html;
}


/* =========================================================
   INSCRIPTION
   ========================================================= */

function registerEvent(id) {

  const event = getEvents().find(
    item => item.id === id
  );

  if (!event) return;

  const available =
    event.places - event.registered;

  if (available <= 0) {

    alert("Cette activité est complète.");

    return;
  }

  const content =
    document.getElementById("content");

  if (!content) return;

  content.innerHTML = `
    <button
      class="back"
      onclick="publicActivities()"
    >
      ← Activités
    </button>

    <h2>📝 Inscription</h2>

    <div class="authBox">

      <h3>
        ${escapeHtml(event.title)}
      </h3>

      <p>
        📅 ${escapeHtml(event.date)}
      </p>

      <p>
        💶 ${escapeHtml(event.price)}
      </p>

      <form
        onsubmit="submitRegistration(event, ${event.id})"
      >

        <label>
          Nom et prénom

          <input
            id="regName"
            type="text"
            required
            autocomplete="name"
          >
        </label>

        <label>
          Nombre de personnes

          <input
            id="regPeople"
            type="number"
            min="1"
            max="${available}"
            value="1"
            required
          >
        </label>

        <label>
          Téléphone

          <input
            id="regPhone"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
          >
        </label>

        <button
          class="primary"
          type="submit"
        >
          ✅ Valider mon inscription
        </button>

      </form>

    </div>
  `;
}


function submitRegistration(formEvent, id) {

  formEvent.preventDefault();

  const events = getEvents();

  const event = events.find(
    item => item.id === id
  );

  if (!event) return;

  const name =
    document.getElementById("regName").value.trim();

  const people =
    Number(
      document.getElementById("regPeople").value
    );

  const phone =
    document.getElementById("regPhone").value.trim();

  const available =
    event.places - event.registered;

  if (!name) {

    alert("Merci de renseigner votre nom.");

    return;
  }

  if (
    !Number.isInteger(people) ||
    people < 1 ||
    people > available
  ) {

    alert("Le nombre de personnes est incorrect.");

    return;
  }

  const key = "cse_registrations_" + id;

  let registrations = [];

  try {
    registrations =
      JSON.parse(
        localStorage.getItem(key) || "[]"
      );
  } catch (error) {
    registrations = [];
  }

  registrations.push({
    name: name,
    people: people,
    phone: phone,
    date: new Date().toISOString()
  });

  localStorage.setItem(
    key,
    JSON.stringify(registrations)
  );

  event.registered += people;

  saveEvents(events);

  const content =
    document.getElementById("content");

  content.innerHTML = `
    <button
      class="back"
      onclick="goHome()"
    >
      ← Accueil
    </button>

    <div class="authBox">

      <h2>✅ Inscription enregistrée</h2>

      <p>
        Votre inscription pour
        <strong>${escapeHtml(event.title)}</strong>
        a bien été enregistrée.
      </p>

      <p>
        👤 ${escapeHtml(name)}
        <br>
        👥 ${people} personne(s)
      </p>

      <button
        class="primary"
        onclick="publicActivities()"
      >
        Voir les activités
      </button>

    </div>
  `;
}


/* =========================================================
   ADMINISTRATION
   ========================================================= */

function adminDemo() {

  hideHome();

  const content =
    document.getElementById("content");

  if (!content) return;

  content.hidden = false;

  renderAdmin();
}


function renderAdmin() {

  const content =
    document.getElementById("content");

  if (!content) return;

  const events = getEvents();

  const totalRegistered =
    events.reduce(
      (total, event) =>
        total + Number(event.registered || 0),
      0
    );

  const totalPlaces =
    events.reduce(
      (total, event) =>
        total + Number(event.places || 0),
      0
    );

  content.innerHTML = `
    <button
      class="back"
      onclick="goHome()"
    >
      ← Accueil
    </button>

    <h2>⚙️ Espace administrateur</h2>

    <p>
      <strong>
        Gestion des activités du CSE
      </strong>
    </p>

    <div class="adminStats">

      <div>
        <b>${events.length}</b>
        <small>Activités</small>
      </div>

      <div>
        <b>${totalRegistered}</b>
        <small>Inscrits</small>
      </div>

      <div>
        <b>${totalPlaces}</b>
        <small>Places</small>
      </div>

    </div>

    <button
      class="adminBtn"
      onclick="showCreateEvent()"
    >
      ➕ Créer une activité
    </button>

    <h3>Activités publiées</h3>

    <div>

      ${
        events.length
          ? events.map(event => `
              <div class="adminEvent">

                <strong>
                  ${escapeHtml(event.title)}
                </strong>

                <small>
                  📅 ${escapeHtml(event.date)}
     </
