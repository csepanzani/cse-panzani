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
    "Contact CSE",
    "☎️",
    "Une question ? Retrouvez ici les coordonnées du CSE."
  ],
  notifications: [
    "Notifications",
    "🔔",
    "Vous avez 3 nouvelles notifications."
  ]
};


/* =========================================================
   OUTILS
   ========================================================= */

function hideHome() {
  document.querySelector(".welcome").hidden = true;
  document.querySelector(".news").hidden = true;
  document.querySelector(".grid").hidden = true;
  document.querySelector(".feature").hidden = true;
}

function showHome() {
  document.querySelector(".welcome").hidden = false;
  document.querySelector(".news").hidden = false;
  document.querySelector(".grid").hidden = false;
  document.querySelector(".feature").hidden = false;

  const content = document.getElementById("content");
  content.hidden = true;
  content.innerHTML = "";

  document.querySelectorAll(".bottom button").forEach(b => {
    b.classList.remove("active");
  });

  const home = document.querySelector(".bottom button");
  if (home) home.classList.add("active");
}

function goHome() {
  showHome();
}

function getContent() {
  const content = document.getElementById("content");
  content.hidden = false;
  return content;
}


/* =========================================================
   NAVIGATION DES RUBRIQUES
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

  const content = getContent();
  const page = pages[key] || pages.actualites;

  content.innerHTML = `
    <button class="back" onclick="goHome()">← Accueil</button>

    <h2>${page[1]} ${page[0]}</h2>

    <p>${page[2]}</p>

    <div class="authBox">
      <h3>Cette rubrique est prête</h3>
      <p>
        Le CSE pourra publier ici les informations,
        documents, offres et événements.
      </p>
    </div>
  `;

  document.querySelectorAll(".bottom button").forEach(b => {
    b.classList.remove("active");
  });
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
    title: "Journée Halloween – Ok Corral",
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
  const saved = localStorage.getItem("cse_events");

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
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
   SORTIES / ACTIVITÉS
   ========================================================= */

function publicActivities() {

  hideHome();

  const content = getContent();
  const events = getEvents();

  content.innerHTML = `
    <button class="back" onclick="goHome()">← Accueil</button>

    <h2>🚌 Sorties & activités</h2>

    <p>Découvrez les prochaines activités proposées par le CSE.</p>

    <div id="activitiesList"></div>
  `;

  const list = document.getElementById("activitiesList");

  if (!events.length) {
    list.innerHTML = `
      <div class="authBox">
        Aucune activité disponible pour le moment.
      </div>
    `;
    return;
  }

  list.innerHTML = events.map(event => {

    const available = event.places - event.registered;

    return `
      <div class="adminEvent">

        <strong>${event.title}</strong>

        <small>
          📅 ${event.date}<br>
          💶 ${event.price}<br>
          👥 ${available} place(s) disponible(s)
        </small>

        <button
          class="primary"
          onclick="registerEvent(${event.id})">
          📝 S'inscrire
        </button>

      </div>
    `;

  }).join("");
}


/* =========================================================
   INSCRIPTION
   ========================================================= */

function registerEvent(id) {

  const event = getEvents().find(e => e.id === id);

  if (!event) return;

  const available = event.places - event.registered;

  if (available <= 0) {
    alert("Cette activité est complète.");
    return;
  }

  const content = getContent();

  content.innerHTML = `
    <button class="back" onclick="publicActivities()">
      ← Activités
    </button>

    <h2>📝 Inscription</h2>

    <div class="authBox">

      <h3>${event.title}</h3>

      <p>
        📅 ${event.date}<br>
        💶 ${event.price}<br>
        👥 ${available} place(s) disponible(s)
      </p>

      <form onsubmit="submitRegistration(event, ${id})">

        <label>
          Nom et prénom
          <input id="regName" required>
        </label>

        <label>
          Nombre de personnes
          <input
            id="regPeople"
            type="number"
            min="1"
            max="${available}"
            value="1"
            required>
        </label>

        <label>
          Téléphone
          <input id="regPhone" inputmode="tel">
        </label>

        <button class="primary" type="submit">
          Valider mon inscription
        </button>

      </form>

    </div>
  `;
}


function submitRegistration(event, id) {

  event.preventDefault();

  const events = getEvents();
  const activity = events.find(e => e.id === id);

  if (!activity) return;

  const name = document.getElementById("regName").value.trim();
  const people = Number(
    document.getElementById("regPeople").value
  );
  const phone = document.getElementById("regPhone").value.trim();

  if (
    !name ||
    people < 1 ||
    activity.registered + people > activity.places
  ) {
    alert("Informations incorrectes ou nombre de places insuffisant.");
    return;
  }

  const registrations = JSON.parse(
    localStorage.getItem("reg_" + id) || "[]"
  );

  registrations.push({
    name: name,
    people: people,
    phone: phone
  });

  localStorage.setItem(
    "reg_" + id,
    JSON.stringify(registrations)
  );

  activity.registered += people;

  saveEvents(events);

  const content = getContent();

  content.innerHTML = `
    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <div class="authBox">

      <h2>✅ Inscription enregistrée</h2>

      <p>
        Merci <strong>${name}</strong>.
      </p>

      <p>
        Votre inscription pour
        <strong>${activity.title}</strong>
        a bien été enregistrée.
      </p>

      <p>
        Nombre de personnes : ${people}
      </p>

      <button class="primary" onclick="goHome()">
        Retour à l'accueil
      </button>

    </div>
  `;
}


/* =========================================================
   ADMINISTRATION
   ========================================================= */

function adminDemo() {

  hideHome();

  const content = getContent();
  const events = getEvents();

  content.innerHTML = `
    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <h2>⚙️ Administration CSE</h2>

    <p>
      Gestion des activités du CSE.
    </p>

    <button class="adminBtn" onclick="showCreateEvent()">
      ➕ Créer une activité
    </button>

    <h3>Activités publiées</h3>

    <div>
      ${
        events.length
        ? events.map(event => `
          <div class="adminEvent">

            <strong>${event.title}</strong>

            <small>
              📅 ${event.date}<br>
              💶 ${event.price}<br>
              👥 ${event.registered}/${event.places}
            </small>

            <button onclick="viewRegistrations(${event.id})">
              👥 Voir les inscrits
            </button>

            <button onclick="deleteEvent(${event.id})">
              🗑️ Supprimer
            </button>

          </div>
        `).join("")
        : "<p>Aucune activité.</p>"
      }
    </div>
  `;
}


function showCreateEvent() {

  const content = getContent();

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
          placeholder="Ex. Sortie ski"
          required>
      </label>

      <label>
        Date
        <input
          id="evDate"
          placeholder="Ex. 22–24 janvier 2027"
          required>
      </label>

      <label>
        Tarif
        <input
          id="evPrice"
          placeholder="Ex. 130 € adulte"
          required>
      </label>

      <label>
        Nombre de places
        <input
          id="evPlaces"
          type="number"
          min="1"
          value="50"
          required>
      </label>

      <button class="primary" type="submit">
        Publier l'activité
      </button>

    </form>
  `;
}


function createEvent(event) {

  event.preventDefault();

  const events = getEvents();

  events.unshift({
    id: Date.now(),
    title: document.getElementById("evTitle").value,
    date: document.getElementById("evDate").value,
    price: document.getElementById("evPrice").value,
    places: Number(
      document.getElementById("evPlaces").value
    ),
    registered: 0
  });

  saveEvents(events);

  adminDemo();
}


function deleteEvent(id) {

  if (!confirm("Supprimer cette activité ?")) {
    return;
  }

  const events = getEvents().filter(
    event => event.id !== id
  );

  saveEvents(events);

  adminDemo();
}


function viewRegistrations(id) {

  const event = getEvents().find(e => e.id === id);

  if (!event) return;

  const registrations = JSON.parse(
    localStorage.getItem("reg_" + id) || "[]"
  );

  const content = getContent();

  content.innerHTML = `
    <button class="back" onclick="adminDemo()">
      ← Administration
    </button>

    <h2>👥 ${event.title}</h2>

    <p>
      ${registrations.length} inscription(s)
    </p>

    ${
      registrations.length
      ? registrations.map((r, index) => `
        <div class="adminEvent">
          <strong>
            ${index + 1}. ${r.name}
          </strong>

          <small>
            ${r.people} personne(s)<br>
            ${r.phone || "Téléphone non renseigné"}
          </small>
        </div>
      `).join("")
      : "<p>Aucune inscription pour le moment.</p>"
    }
  `;
}


/* =========================================================
   SUPABASE
   ========================================================= */

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

function initSupabase() {

  if (
    !window.supabase ||
    !window.CSE_SUPABASE_URL ||
    !window.CSE_SUPABASE_KEY
  ) {
    return;
  }

  supabaseClient =
    window.supabase.createClient(
      window.CSE_SUPABASE_URL,
      window.CSE_SUPABASE_KEY
    );

  supabaseClient.auth.getSession().then(({ data }) => {

    currentUser =
      data.session?.user || null;

    if (currentUser) {
      loadProfile();
    }

  });

  supabaseClient.auth.onAuthStateChange(
    (_event, session) => {

      currentUser =
        session?.user || null;

      if (currentUser) {
        loadProfile();
      } else {
        currentProfile = null;
      }

    }
  );
}


async function loadProfile() {

  if (!supabaseClient || !currentUser) {
    return;
  }

  const { data } =
    await supabaseClient
      .from("profils")
      .select("id,nom,role")
      .eq("id", currentUser.id)
      .maybeSingle();

  currentProfile = data || null;
}


/* =========================================================
   CONNEXION ADMIN
   ========================================================= */

function showAuth() {

  hideHome();

  const content = getContent();

  if (currentUser) {

    content.innerHTML = `
      <button class="back" onclick="goHome()">
        ← Accueil
      </button>

      <h2>👤 Mon compte</h2>

      <div class="authBox">

        <p>
          ${currentUser.email || ""}
        </p>

        ${
          currentProfile?.role === "admin"
          ? `
            <p>✅ Administrateur CSE</p>

            <button
              class="adminBtn"
              onclick="adminDemo()">
              ⚙️ Ouvrir l'administration
            </button>
          `
          : `
            <p>Compte salarié</p>
          `
        }

        <button
          class="adminBtn danger"
          onclick="signOut()">
          Se déconnecter
        </button>

      </div>
    `;

    return;
  }

  content.innerHTML = `
    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <h2>🔐 Connexion</h2>

    <div class="authBox">

      <h3>Connexion administrateur</h3>

      <form onsubmit="loginAdmin(event)">

        <label>
          E-mail
          <input
            id="loginEmail"
            type="email"
            autocomplete="username"
            required>
        </label>

        <label>
          Mot de passe
          <input
            id="loginPassword"
            type="password"
            autocomplete="current-password"
            required>
        </label>

        <button
          class="primary"
          type="submit">
          Se connecter
        </button>

      </form>

      <p id="loginMsg"></p>

    </div>
  `;
}


async function loginAdmin(event) {

  event.preventDefault();

  const msg =
    document.getElementById("loginMsg");

  msg.textContent =
    "Connexion en cours…";

  if (!supabaseClient) {

    msg.textContent =
      "Supabase n'est pas configuré.";

    return;
  }

  const email =
    document.getElementById("loginEmail")
      .value.trim();

  const password =
    document.getElementById("loginPassword")
      .value;

  const { error } =
    await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

  if (error) {

    msg.textContent =
      "Connexion impossible : " +
      error.message;

    return;
  }

  await loadProfile();

  if (currentProfile?.role !== "admin") {

    await supabaseClient.auth.signOut();

    msg.textContent =
      "Ce compte n'est pas administrateur.";

    return;
  }

  showAuth();
}


async function signOut() {

  if (supabaseClient) {
    await supabaseClient.auth.signOut();
  }

  currentUser = null;
  currentProfile = null;

  showAuth();
}


/* =========================================================
   DATE + SUPABASE
   ========================================================= */

const dateElement =
  document.getElementById("date");

if (dateElement) {

  dateElement.textContent =
    new Intl.DateTimeFormat(
      "fr-FR",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(new Date());

}


if ("serviceWorker" in navigator) {

  navigator.serviceWorker
    .register("sw.js")
    .catch(() => {});

}


initSupabase();
