/* =========================================================
   CSE PANZANI - APPLICATION
   Version Supabase : contenus + activités + inscriptions
   ========================================================= */

const pages = {
  actualites: ["Actualités", "📢", "Les dernières informations du CSE."],
  billetterie: ["Billetterie", "🎟️", "Cinémas, parcs, spectacles et cartes cadeaux."],
  sorties: ["Sorties & voyages", "🚌", "Les activités et voyages proposés par le CSE."],
  offres: ["Offres CSE", "🎁", "Promotions et avantages négociés pour les salariés."],
  agenda: ["Agenda", "📅", "Les prochaines dates importantes du CSE."],
  inscriptions: ["Inscriptions", "📝", "Les inscriptions enregistrées dans l'application."],
  documents: ["Documents", "📄", "Règlements, comptes rendus et documents utiles."],
  contact: ["Contacter le CSE", "☎️", "Les coordonnées du CSE."],
  notifications: ["Notifications", "🔔", "Les dernières notifications du CSE."],
  plus: ["Plus", "☰", "Connexion et espace administrateur."]
};

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[character]));
}

function hideHome() {
  [".welcome", ".news", ".grid", ".feature"].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.hidden = true;
  });
}

function showHome() {
  [".welcome", ".news", ".grid", ".feature"].forEach(selector => {
    const el = document.querySelector(selector);
    if (el) el.hidden = false;
  });

  const content = document.getElementById("content");

  if (content) {
    content.hidden = true;
    content.innerHTML = "";
  }

  document.querySelectorAll(".bottom button").forEach(b => {
    b.classList.remove("active");
  });

  const home = document.querySelector(".bottom button");

  if (home) {
    home.classList.add("active");
  }
}

function goHome() {
  showHome();
}

function setContent(html) {
  hideHome();

  const content = document.getElementById("content");

  if (!content) return null;

  content.hidden = false;
  content.innerHTML = html;

  document.querySelectorAll(".bottom button").forEach(b => {
    b.classList.remove("active");
  });

  return content;
}

function loading(title) {
  setContent(`
    <button class="back" onclick="goHome()">← Accueil</button>
    <h2>${escapeHtml(title)}</h2>

    <div class="authBox">
      <p>⏳ Chargement des informations du CSE…</p>
    </div>
  `);
}

function errorBox(message) {
  return `
    <div class="authBox">
      <p>⚠️ ${escapeHtml(message)}</p>
    </div>
  `;
}

function formatDate(value) {
  if (!value) return "";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return escapeHtml(value);
  }

  return escapeHtml(
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(d)
  );
}

function displayDate() {
  const el = document.getElementById("date");

  if (!el) return;

  el.textContent = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date());
}


/* =========================================================
   NAVIGATION DES BOUTONS
   ========================================================= */

function showSection(key) {

  if (key === "sorties") {
    return publicActivities();
  }

  if (key === "actualites") {
    return showActualites();
  }

  if (key === "billetterie") {
    return showBilletterie();
  }

  if (key === "offres") {
    return showOffres();
  }

  if (key === "agenda") {
    return showAgenda();
  }

  if (key === "inscriptions") {
    return showInscriptions();
  }

  if (key === "documents") {
    return showDocuments();
  }

  if (key === "notifications") {
    return showNotifications();
  }

  if (key === "contact") {
    return showContact();
  }

  if (key === "plus") {
    return showAuth();
  }

  return showActualites();
}


/* =========================================================
   ACTUALITÉS
   ========================================================= */

async function showActualites() {

  loading("📢 Actualités");

  if (!supabaseClient) {

    setContent(`
      <button class="back" onclick="goHome()">← Accueil</button>
      <h2>📢 Actualités</h2>
      ${errorBox("Supabase n'est pas configuré.")}
    `);

    return;
  }

  const { data, error } = await supabaseClient
    .from("actualites")
    .select("id,titre,contenu,image_url,created_at")
    .order("created_at", { ascending: false });

  if (error) {

    setContent(`
      <button class="back" onclick="goHome()">← Accueil</button>
      <h2>📢 Actualités</h2>
      ${errorBox(
        "Impossible de charger les actualités : " + error.message
      )}
    `);

    return;
  }

  let html = `
    <button class="back" onclick="goHome()">← Accueil</button>
    <h2>📢 Actualités</h2>
  `;

  if (!data?.length) {

    html += `
      <div class="authBox">
        <p>Aucune actualité publiée pour le moment.</p>
      </div>
    `;

  } else {

    data.forEach(item => {

      html += `
        <article class="adminEvent">

          <strong>
            ${escapeHtml(item.titre)}
          </strong>

          ${
            item.created_at
              ? `<small>📅 ${formatDate(item.created_at)}</small>`
              : ""
          }

          ${
            item.image_url
              ? `
                <img
                  src="${escapeHtml(item.image_url)}"
                  alt=""
                  style="
                    width:100%;
                    border-radius:12px;
                    margin:8px 0;
                    max-height:260px;
                    object-fit:cover;
                  "
                >
              `
              : ""
          }

          <p>
            ${escapeHtml(item.contenu || "")}
          </p>

        </article>
      `;
    });
  }

  setContent(html);
}


/* =========================================================
   BILLETTERIE
   ========================================================= */

async function showBilletterie() {

  await showFilteredActualites(
    "🎟️ Billetterie",
    [
      "billetterie",
      "cinéma",
      "cinema",
      "parc",
      "spectacle",
      "carte cadeau",
      "tickets",
      "ticket"
    ]
  );
}


/* =========================================================
   OFFRES CSE
   ========================================================= */

async function showOffres() {

  await showFilteredActualites(
    "🎁 Offres CSE",
    [
      "offre",
      "promotion",
      "avantage",
      "réduction",
      "reduction",
      "partenaire"
    ]
  );
}


/* =========================================================
   FILTRE DES ACTUALITÉS
   ========================================================= */

async function showFilteredActualites(title, keywords) {

  loading(title);

  if (!supabaseClient) {

    setContent(`
      <button class="back" onclick="goHome()">← Accueil</button>
      <h2>${title}</h2>
      ${errorBox("Supabase n'est
