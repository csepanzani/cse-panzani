const pages = {
  actualites: ["Actualités", "📢", "Les dernières informations du CSE, les affichages, les communications RH, CGT et CSSCT."],
  billetterie: ["Billetterie", "🎟️", "Cinémas, parcs d'attractions, spectacles et cartes cadeaux."],
  sorties: ["Sorties & voyages", "🚌", "Retrouvez les voyages, sorties, week-ends et journées organisés par le CSE."],
  offres: ["Offres CSE", "🎁", "Promotions et avantages négociés pour les salariés."],
  agenda: ["Agenda", "📅", "Toutes les dates importantes : inscriptions, sorties, événements et échéances."],
  inscriptions: ["Inscriptions", "📝", "Inscrivez-vous aux prochaines activités directement depuis votre téléphone."],
  documents: ["Documents", "📄", "Règlements, comptes rendus, fiches pratiques et informations utiles."],
  contact: ["Contacter le CSE", "☎️", "Une question ? Retrouvez ici les coordonnées et horaires du CSE."],
  notifications: ["Notifications", "🔔", "Vous avez 3 nouvelles notifications."],
  plus: ["Plus", "☰", "Paramètres, informations pratiques et espace administrateur."]
};


/* =========================
   NAVIGATION
========================= */

function showSection(key) {

  if (key === "plus") {
    showAuth();
    return;
  }

  if (key === "sorties") {
    publicActivities();
    return;
  }

  const welcome = document.querySelector(".welcome");
  const news = document.querySelector(".news");
  const grid = document.querySelector(".grid");
  const feature = document.querySelector(".feature");
  const content = document.getElementById("content");

  if (welcome) welcome.hidden = true;
  if (news) news.hidden = true;
  if (grid) grid.hidden = true;
  if (feature) feature.hidden = true;
  if (content) content.hidden = false;

  const p = pages[key] || pages.actualites;

  if (content) {
    content.innerHTML = `
      <button class="back" onclick="goHome()">← Accueil</button>

      <h2>${p[1]} ${p[0]}</h2>

      <p>${p[2]}</p>

      <button class="adminBtn" onclick="adminDemo()">
        ⚙️ Ouvrir l’espace administrateur
      </button>

      <hr>

      <p>
        <strong>Prototype :</strong>
        cette rubrique est prête à recevoir les contenus réels du CSE.
      </p>
    `;
  }

  document.querySelectorAll(".bottom button").forEach(function(b) {
    b.classList.remove("active");
  });
}


function goHome() {

  ["welcome", "news", "grid", "feature"].forEach(function(x) {
    const el = document.querySelector("." + x);
    if (el) el.hidden = false;
  });

  const content = document.getElementById("content");
  if (content) content.hidden = true;

  const firstButton = document.querySelector(".bottom button");
  if (firstButton) firstButton.classList.add("active");
}


/* =========================
   DATE
========================= */

function updateDate() {

  const date = document.getElementById("date");

  if (date) {
    date.textContent = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date());
  }
}


/* =========================
   ACTIVITÉS DE DÉMONSTRATION
========================= */

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

  } catch (e) {
    console.warn("Erreur localStorage :", e);
  }

  try {
    localStorage.setItem(
      "cse_events",
      JSON.stringify(demoEvents)
    );
  } catch (e) {}

  return demoEvents;
}


function saveEvents(events) {

  try {
    localStorage.setItem(
      "cse_events",
      JSON.stringify(events)
    );
  } catch (e) {
    console.warn("Impossible de sauvegarder :", e);
  }
}


/* =========================
   ADMINISTRATION
========================= */

function adminDemo() {

  const welcome = document.querySelector(".welcome");
  const news = document.querySelector(".news");
  const grid = document.querySelector(".grid");
  const feature = document.querySelector(".feature");
  const content = document.getElementById("content");

  if (welcome) welcome.hidden = true;
  if (news) news.hidden = true;
  if (grid) grid.hidden = true;
  if (feature) feature.hidden = true;
  if (content) content.hidden = false;

  renderAdmin();
}


function renderAdmin() {

  const content = document.getElementById("content");

  if (!content) return;

  const events = getEvents();

  const totalRegistered = events.reduce(function(n, e) {
    return n + Number(e.registered || 0);
  }, 0);

  const totalPlaces = events.reduce(function(n, e) {
    return n + Number(e.places || 0);
  }, 0);

  content.innerHTML = `
    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <h2>⚙️ Espace administrateur</h2>

    <p>
      <strong>Gestion des activités du CSE</strong>
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

    <button class="adminBtn" onclick="showCreateEvent()">
      ➕ Créer une activité
    </button>

    <h3>Activités publiées</h3>

    <div id="adminEvents">

      ${events.map(function(e) {

        return `
          <div class="adminEvent">

            <strong>${escapeHtml(e.title)}</strong>

            <small>
              📅 ${escapeHtml(e.date)}
              · 💶 ${escapeHtml(e.price)}
              · 👥 ${e.registered}/${e.places}
            </small>

            <div>

              <button onclick="viewRegistrations(${e.id})">
                👥 Inscrits
              </button>

              <button onclick="deleteEvent(${e.id})">
                🗑️ Supprimer
              </button>

            </div>

          </div>
        `;

      }).join("")}

    </div>
  `;
}


function showCreateEvent() {

  const content = document.getElementById("content");

  if (!content) return;

  content.innerHTML = `

    <button class="back" onclick="adminDemo()">
      ← Administration
    </button>

    <h2>➕ Nouvelle activité</h2>

    <form onsubmit="createEvent(event)">

      <label>
        Nom de l'activité
        <input
          id="evTitle"
          required
          placeholder="Ex. Sortie ski"
        >
      </label>

      <label>
        Date
        <input
          id="evDate"
          required
          placeholder="Ex. 22–24 janvier 2027"
        >
      </label>

      <label>
        Tarif
        <input
          id="evPrice"
          required
          placeholder="Ex. 130 € adulte"
        >
      </label>

      <label>
        Nombre de places
        <input
          id="evPlaces"
          type="number"
          min="1"
          value="50"
          required
        >
      </label>

      <button class="primary" type="submit">
        Publier l'activité
      </button>

    </form>
  `;
}


function createEvent(e) {

  e.preventDefault();

  const events = getEvents();

  const title = document.getElementById("evTitle");
  const date = document.getElementById("evDate");
  const price = document.getElementById("evPrice");
  const places = document.getElementById("evPlaces");

  if (!title || !date || !price || !places) return;

  events.unshift({
    id: Date.now(),
    title: title.value,
    date: date.value,
    price: price.value,
    places: Number(places.value),
    registered: 0
  });

  saveEvents(events);

  renderAdmin();
}


function deleteEvent(id) {

  if (!confirm("Supprimer cette activité ?")) {
    return;
  }

  const events = getEvents().filter(function(e) {
    return e.id !== id;
  });

  saveEvents(events);

  renderAdmin();
}


function viewRegistrations(id) {

  const events = getEvents();

  const event = events.find(function(x) {
    return x.id === id;
  });

  if (!event) return;

  let regs = [];

  try {
    regs = JSON.parse(
      localStorage.getItem("reg_" + id) || "[]"
    );
  } catch (e) {
    regs = [];
  }

  const content = document.getElementById("content");

  if (!content) return;

  content.innerHTML = `

    <button class="back" onclick="adminDemo()">
      ← Administration
    </button>

    <h2>👥 ${escapeHtml(event.title)}</h2>

    <p>
      ${regs.length} inscription(s)
    </p>

    ${
      regs.length

      ? regs.map(function(r, i) {

          return `
            <div class="adminEvent">

              <strong>
                ${i + 1}. ${escapeHtml(r.name)}
              </strong>

              <small>
                ${r.people} personne(s)
                · ${escapeHtml(r.phone || "Téléphone non renseigné")}
              </small>

            </div>
          `;

        }).join("")

      : "<p>Aucune inscription pour le moment.</p>"
    }

  `;
}


/* =========================
   ACTIVITÉS PUBLIQUES
========================= */

function publicActivities() {

  const content = document.getElementById("content");

  if (!content) return;

  const welcome = document.querySelector(".welcome");
  const news = document.querySelector(".news");
  const grid = document.querySelector(".grid");
  const feature = document.querySelector(".feature");

  if (welcome) welcome.hidden = true;
  if (news) news.hidden = true;
  if (grid) grid.hidden = true;
  if (feature) feature.hidden = true;

  content.hidden = false;

  const events = getEvents();

  content.innerHTML = `

    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <h2>
      🚌 Sorties & activités
    </h2>

    ${
      events.length

      ? events.map(function(e) {

          const available =
            Number(e.places || 0) -
            Number(e.registered || 0);

          return `
            <div class="adminEvent">

              <strong>
                ${escapeHtml(e.title)}
              </strong>

              <small>
                📅 ${escapeHtml(e.date)}
                · 💶 ${escapeHtml(e.price)}
                · 👥 ${available} place(s) disponible(s)
              </small>

              <button
                class="primary"
                onclick="registerEvent(${e.id})"
              >
                📝 S'inscrire
              </button>

            </div>
          `;

        }).join("")

      : "<p>Aucune activité actuellement.</p>"
    }

  `;
}


function registerEvent(id) {

  const event = getEvents().find(function(x) {
    return x.id === id;
  });

  if (!event) return;

  if (event.registered >= event.places) {
    alert("Cette activité est complète.");
    return;
  }

  const content = document.getElementById("content");

  if (!content) return;

  const available =
    Number(event.places) -
    Number(event.registered);

  content.innerHTML = `

    <button class="back" onclick="publicActivities()">
      ← Activités
    </button>

    <h2>📝 Inscription</h2>

    <p>
      <strong>${escapeHtml(event.title)}</strong>
      <br>
      ${escapeHtml(event.date)}
      · ${escapeHtml(event.price)}
    </p>

    <form onsubmit="submitRegistration(event,${id})">

      <label>
        Nom et prénom
        <input
          id="regName"
          required
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
          inputmode="tel"
        >
      </label>

      <button class="primary" type="submit">
        Valider mon inscription
      </button>

    </form>
  `;
}


function submitRegistration(ev, id) {

  ev.preventDefault();

  const events = getEvents();

  const event = events.find(function(x) {
    return x.id === id;
  });

  if (!event) return;

  const name = document.getElementById("regName");
  const peopleInput = document.getElementById("regPeople");
  const phone = document.getElementById("regPhone");

  if (!name || !peopleInput || !phone) return;

  const people = Number(peopleInput.value);

  if (
