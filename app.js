/* =========================================================
   CSE PANZANI - APPLICATION
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
    "Vous avez 3 nouvelles notifications."
  ],

  plus: [
    "Plus",
    "☰",
    "Paramètres, informations pratiques et espace administrateur."
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


function showContent() {
  const content = document.getElementById("content");

  if (content) {
    content.hidden = false;
  }
}


function clearBottomActive() {
  document
    .querySelectorAll(".bottom button")
    .forEach(button => button.classList.remove("active"));
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
  showContent();
  clearBottomActive();

  const content = document.getElementById("content");

  if (!content) return;

  const page = pages[key] || pages.actualites;

  content.innerHTML = `
    <button class="back" onclick="goHome()">← Accueil</button>

    <h2>${page[1]} ${page[0]}</h2>

    <p>${page[2]}</p>

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


function goHome() {

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
  }

  clearBottomActive();

  const firstButton = document.querySelector(".bottom button");

  if (firstButton) {
    firstButton.classList.add("active");
  }
}


/* =========================================================
   DATE
   ========================================================= */

function updateDate() {

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
   ACTIVITÉS DE DÉMONSTRATION
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
   ACTIVITÉS PUBLIQUES
   ========================================================= */

function publicActivities() {

  hideHome();
  showContent();
  clearBottomActive();

  const content = document.getElementById("content");

  if (!content) return;

  const events = getEvents();

  let html = `
    <button class="back" onclick="goHome()">
      ← Accueil
    </button>

    <h2>🚌 Sorties & activités</h2>
  `;

  if (!events.length) {

    html += `
      <p>
        Aucune activité disponible pour le moment.
      </p>
    `;

  } else {

    events.forEach(event => {

      const available =
        event.places - event.registered;

      html += `
        <div class="adminEvent">

          <strong>
            ${event.title}
          </strong>

          <small>
            📅 ${event.date}
            · 💶 ${event.price}
            · 👥 ${available} place(s) disponible(s)
          </small>

          <button
            class="primary"
            onclick="registerEvent(${event.id})"
          >
            📝 S'inscrire
          </button>

        </div>
      `;

    });

  }

  content.innerHTML = html;
}


/* =========================================================
   INSCRIPTION À UNE ACTIVITÉ
   ========================================================= */

function registerEvent(id) {

  const events = getEvents();

  const event = events.find(
    item => item.id === id
  );

  if (!event) return;

  if (event.registered >= event.places) {

    alert("Cette activité est complète.");

    return;
  }

  const content = document.getElementById("content");

  if (!content) return;

  const remaining =
    event.places - event.registered;

  content.innerHTML = `

    <button
      class="back"
      onclick="publicActivities()"
    >
      ← Activités
    </button>

    <h2>📝 Inscription</h2>

    <p>
      <strong>${event.title}</strong>
      <br>
      ${event.date}
      · ${event.price}
    </p>

    <form
      onsubmit="submitRegistration(event, ${id})"
    >

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
          max="${remaining}"
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

      <button
        class="primary"
        type="submit"
      >
        Valider mon inscription
      </button>

    </form>
  `;
}


function submitRegistration(eventForm, id) {

  eventForm.preventDefault();

  const events = getEvents();

  const event = events.find(
    item => item.id === id
  );

  if (!event) return;

  const people =
    Number(
      document.getElementById("regPeople").value
    );

  if (
    event.registered + people >
    event.places
  ) {

    alert(
      "Il ne reste pas assez de places."
    );

    return;
  }

  const registrations =
    JSON.parse(
      localStorage.getItem("reg_" + id) || "[]"
    );

  registrations.push({

    name:
      document.getElementById("regName").value,

    people: people,

    phone:
      document.getElementById("regPhone").value

  });

  localStorage.setItem(
    "reg_" + id,
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

    <h2>✅ Inscription enregistrée</h2>

    <p>
      Votre inscription pour
      <strong>${event.title}</strong>
      a bien été enregistrée.
    </p>

  `;
}


/* =========================================================
   ADMINISTRATION
   ========================================================= */

function adminDemo() {

  hideHome();
  showContent();

  const content =
    document.getElementById("content");

  if (!content) return;

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
        total + event.registered,
      0
    );

  const totalPlaces =
    events.reduce(
      (total, event) =>
        total + event.places,
      0
    );

  content.innerHTML = `

    <button
      class="back"
      onclick="goHome()"
    >
      ← Accueil
    </button>

    <h2>
      ⚙️ Espace administrateur
    </h2>

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

    <h3>
      Activités publiées
    </h3>

    <div id="adminEvents">

      ${
        events.map(event => `

          <div class="adminEvent">

            <strong>
              ${event.title}
            </strong>

            <small>
              📅 ${event.date}
              · 💶 ${event.price}
              · 👥 ${event.registered}/${event.places}
            </small>

            <div>

              <button
                onclick="viewRegistrations(${event.id})"
              >
                👥 Inscrits
              </button>

              <button
                onclick="deleteEvent(${event.id})"
              >
                🗑️ Supprimer
              </button>

            </div>

          </div>

        `).join("")
      }

    </div>

  `;
}


/* =========================================================
   CRÉER UNE ACTIVITÉ
   ========================================================= */

function showCreateEvent() {

  const content =
    document.getElementById("content");

  if (!content) return;

  content.innerHTML = `

    <button
      class="back"
      onclick="adminDemo()"
    >
      ← Administration
    </button>

    <h2>
      ➕ Nouvelle activité
    </h2>

    <form
      onsubmit="createEvent(event)"
    >

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

      <button
        class="primary"
        type="submit"
      >
        Publier l'activité
      </button>

    </form>

  `;
}


function createEvent(eventForm) {

  eventForm.preventDefault();

  const events = getEvents();

  events.unshift({

    id: Date.now(),

    title:
      document.getElementById("evTitle").value,

    date:
      document.getElementById("evDate").value,

    price:
      document.getElementById("evPrice").value,

    places:
      Number(
        document.getElementById("evPlaces").value
      ),

    registered: 0

  });

  saveEvents(events);

  renderAdmin();
}


/* =========================================================
   SUPPRIMER UNE ACTIVITÉ
   ========================================================= */

function deleteEvent(id) {

  if (
    !confirm(
      "Supprimer cette activité ?"
    )
  ) {
    return;
  }

  const events =
    getEvents().filter(
      event => event.id !== id
    );

  saveEvents(events);

  renderAdmin();
}


/* =========================================================
   VOIR LES INSCRIPTIONS
   ========================================================= */

function viewRegistrations(id) {

  const event =
    getEvents().find(
      item => item.id === id
    );

  if (!event) return;

  const registrations =
    JSON.parse(
      localStorage.getItem(
        "reg_" + id
      ) || "[]"
    );

  const content =
    document.getElementById("content");

  if (!content) return;

  let html = `

    <button
      class="back"
      onclick="adminDemo()"
    >
      ← Administration
    </button>

    <h2>
      👥 ${event.title}
    </h2>

    <p>
      ${registrations.length}
      inscription(s)
    </p>

  `;

  if (registrations.length) {

    registrations.forEach(
      (registration, index) => {

        html += `

          <div class="adminEvent">

            <strong>
              ${index + 1}.
              ${registration.name}
            </strong>

            <small>
              ${registration.people}
              personne(s)
              ·
              ${
                registration.phone ||
                "Téléphone non renseigné"
              }
            </small>

          </div>

        `;

      }
    );

  } else {

    html += `
      <p>
        Aucune inscription pour le moment.
      </p>
    `;

  }

  content.innerHTML = html;
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

    console.warn(
      "Supabase n'est pas configuré."
    );

    return;
  }

  try {

    supabaseClient =
      window.supabase.createClient(
        window.CSE_SUPABASE_URL,
        window.CSE_SUPABASE_KEY
      );

  } catch (error) {

    console.error(
      "Erreur Supabase :",
      error
    );

    return;
  }


  supabaseClient.auth
    .getSession()
    .then(({ data }) => {

      currentUser =
        data?.session?.user || null;

      if (currentUser) {
        loadProfile();
      }

    })
    .catch(error => {

      console.warn(
        "Erreur récupération session :",
        error
      );

    });


  supabaseClient.auth
    .onAuthStateChange(
      (_event, session) => {

        currentUser =
          session?.user || null;

        if (currentUser) {

          loadProfile();

        } else {

          currentProfile = null;

          updateAuthBadge();

        }

      }
    );

}


/* =========================================================
   PROFIL
   ========================================================= */

async function loadProfile() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("profils")
        .select(
          "id,nom,role"
        )
        .eq(
          "id",
          currentUser.id
        )
        .maybeSingle();


    if (error) {

      console.warn(
        "Profil non accessible :",
        error.message
      );

      currentProfile = null;

    } else {

      currentProfile = data;

    }

  } catch (error) {

    console.warn(
      "Erreur chargement profil :",
      error
    );

    currentProfile = null;

  }

  updateAuthBadge();
}


/* =========================================================
   BADGE UTILISATEUR
   ========================================================= */

function escapeHtml(value) {

  return String(
    value ?? ""
  ).replace(
    /[&<>'"]/g,
    character => {

      const replacements = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"

      };

      return replacements[character];

    }
  );

}


function updateAuthBadge() {

  const element =
    document.getElementById(
      "authBadge"
    );

  if (!element) return;

  if (currentUser) {

    const label =
      currentProfile?.nom ||
      currentUser.email ||
      "Compte connecté";

    element.innerHTML = `

      <span class="userBadge">

        👤
        ${escapeHtml(label)}

        ${
          currentProfile?.role === "admin"
            ? " · ADMIN"
            : ""
        }

      </span>

    `;

  } else {

    element.textContent =
      "Non connecté";

  }

}


/* =========================================================
   CONNEXION
   ========================================================= */

function showAuth() {

  hideHome();
  showContent();

  const content =
    document.getElementById(
      "content"
    );

  if (!content) return;


  content.innerHTML = `

    <button
      class="back"
      onclick="goHome()"
    >
      ← Accueil
    </button>

    <h2>
      🔐 Connexion CSE
    </h2>

    <div
      class="status"
      id="authBadge"
    >
      ${
        currentUser
          ? "Compte connecté"
          : "Non connecté"
      }
    </div>

    ${
      currentUser

        ? `

          <div class="authBox">

            <h3>
              Compte connecté
            </h3>

            <p>
              ${escapeHtml(
                currentUser.email || ""
              )}
            </p>

            <p>
              ${
                currentProfile?.role === "admin"

                  ? "✅ Vous êtes administrateur du CSE."

                  : "Compte salarié"
              }
            </p>

            ${
              currentProfile?.role === "admin"

                ? `

                  <button
                    class="adminBtn"
                    onclick="adminDemo()"
                  >
                    ⚙️ Ouvrir l’administration
                  </button>

                `

                : ""
            }

            <button
              class="adminBtn danger"
              onclick="signOut()"
            >
              Se déconnecter
            </button>

          </div>

        `

        : `

          <div class="authBox">

            <h3>
              Connexion administrateur
            </h3>

            <p class="status">
              Utilise l'adresse e-mail
              et le mot de passe du compte
              administrateur créé dans Supabase.
            </p>

            <form
              onsubmit="loginAdmin(event)"
            >

              <label>
                E-mail

                <input
                  id="loginEmail"
                  type="email"
                  autocomplete="username"
                  required
                >
              </label>

              <label>
                Mot de passe

                <input
                  id="loginPassword"
                  type="password"
                  autocomplete="current-password"
                  required
                >
              
