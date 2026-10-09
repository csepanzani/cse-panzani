/* CSE PANZANI — Application principale */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  let db = null;
  let currentSection = "accueil";
  let currentUser = null;
  let currentProfile = null;

  const content = () => $("#content");

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function message(text, type = "info") {
    return `<div class="cse-message cse-${type}">${escapeHTML(text)}</div>`;
  }

  function showLoading(text = "Chargement...") {
    if (content()) content().innerHTML = `<p>${escapeHTML(text)}</p>`;
  }

  function showError(error) {
    console.error("CSE PANZANI :", error);
    const detail = error?.message || String(error || "Erreur inconnue");
    if (content()) {
      content().innerHTML = `
        <h2>Une erreur est survenue</h2>
        ${message(detail, "error")}
        <button onclick="goHome()">Retour à l'accueil</button>
      `;
    }
  }

  function formatDate(value) {
    if (!value) return "Date à préciser";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return escapeHTML(value);
    return date.toLocaleDateString("fr-FR");
  }

  function formatPrice(value) {
    if (value === null || value === undefined || value === "") {
      return "Tarif à préciser";
    }
    const number = Number(value);
    return Number.isNaN(number)
      ? escapeHTML(value)
      : number.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR"
        });
  }

  function valueOf(row, keys, fallback = "") {
    for (const key of keys) {
      if (row && row[key] !== undefined && row[key] !== null && row[key] !== "") {
        return row[key];
      }
    }
    return fallback;
  }

  async function readTable(table, query = "*") {
    if (!db) throw new Error("La connexion à Supabase n'est pas initialisée.");
    const { data, error } = await db.from(table).select(query);
    if (error) throw error;
    return data || [];
  }

  function setPage(title, html) {
    if (!content()) {
      console.error("La zone #content est introuvable dans index.html.");
      return;
    }
    content().innerHTML = `<h2>${escapeHTML(title)}</h2>${html}`;
  }

  function card(title, description, extra = "") {
    return `
      <article class="cse-card" style="padding:14px;margin:12px 0;border:1px solid #ddd;border-radius:12px">
        <h3>${escapeHTML(title || "Sans titre")}</h3>
        <p>${escapeHTML(description || "")}</p>
        ${extra}
      </article>
    `;
  }

  function empty(text) {
    return `<p>${escapeHTML(text)}</p>`;
  }

  // NAVIGATION

  window.showSection = async function (section) {
    currentSection = section || "accueil";

    const pages = {
      actualites: afficherActualites,
      billetterie: () => afficherActualites("billetterie"),
      offres: () => afficherActualites("offres"),
      sorties: afficherSorties,
      agenda: afficherAgenda,
      inscriptions: afficherInscriptions,
      documents: afficherDocuments,
      notifications: afficherNotifications,
      contact: afficherContact,
      plus: afficherPlus,
      admin: afficherAdmin
    };

    const page = pages[currentSection];

    if (!page) {
      afficherAccueil();
      return;
    }

    try {
      await page();
    } catch (error) {
      showError(error);
    }
  };

  window.goHome = function () {
    currentSection = "accueil";
    afficherAccueil();
  };

  function afficherAccueil() {
    if (!content()) return;

    content().innerHTML = `
      <h2>Bienvenue au CSE Panzani</h2>
      <p>Retrouvez ici les actualités, les sorties, les offres et les documents du CSE.</p>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">
        <button onclick="showSection('actualites')">Actualités</button>
        <button onclick="showSection('billetterie')">Billetterie</button>
        <button onclick="showSection('sorties')">Sorties</button>
        <button onclick="showSection('offres')">Offres</button>
        <button onclick="showSection('agenda')">Agenda</button>
        <button onclick="showSection('inscriptions')">Inscriptions</button>
        <button onclick="showSection('documents')">Documents</button>
        <button onclick="showSection('notifications')">Notifications</button>
        <button onclick="showSection('contact')">Contact</button>
        <button onclick="showSection('plus')">Plus</button>
      </div>
    `;
  }

  // ACTUALITÉS, BILLETTERIE ET OFFRES

  async function afficherActualites(categorie = "") {
    showLoading("Chargement des actualités...");

    const rows = await readTable("actualites");
    let filtered = rows;

    if (categorie) {
      filtered = rows.filter((row) => {
        const cat = String(valueOf(row, ["categorie", "category", "type"], ""))
          .toLowerCase();
        return cat.includes(categorie.toLowerCase());
      });
    }

    filtered.sort((a, b) => {
      const da = new Date(valueOf(a, ["created_at", "date", "date_publication"], 0));
      const dbb = new Date(valueOf(b, ["created_at", "date", "date_publication"], 0));
      return dbb - da;
    });

    const html = filtered.map((row) => {
      const titre = valueOf(row, ["titre", "title", "nom"], "Actualité");
      const description = valueOf(row, ["description", "contenu", "texte"], "");
      const date = valueOf(row, ["date", "date_publication", "created_at"], "");
      const prix = valueOf(row, ["prix", "tarif"], "");
      const lien = valueOf(row, ["lien", "url", "document_url"], "");

      return card(
        titre,
        description,
        `
          ${date ? `<p><strong>Date :</strong> ${formatDate(date)}</p>` : ""}
          ${prix !== "" ? `<p><strong>Tarif :</strong> ${formatPrice(prix)}</p>` : ""}
          ${lien && /^https?:\/\//i.test(lien)
            ? `<p><a href="${escapeHTML(lien)}" target="_blank" rel="noopener">En savoir plus</a></p>`
            : ""}
        `
      );
    }).join("");

    setPage(
      categorie === "billetterie" ? "Billetterie" :
      categorie === "offres" ? "Offres du CSE" : "Actualités",
      html || empty("Aucune publication pour le moment.")
    );
  }

  // SORTIES ET ACTIVITÉS

  async function afficherSorties() {
    showLoading("Chargement des sorties...");

    const rows = await readTable("activites");
    const html = rows.map((row) => {
      const titre = valueOf(row, ["titre", "nom", "libelle"], "Activité");
      const description = valueOf(row, ["description", "details", "contenu"], "");
      const date = valueOf(row, ["date_activite", "date", "date_debut"], "");
      const prix = valueOf(row, ["prix", "tarif", "prix_adulte"], "");
      const places = valueOf(row, ["places_disponibles", "nombre_places"], "");
      const id = valueOf(row, ["id"], "");

      return card(
        titre,
        description,
        `
          <p><strong>Date :</strong> ${formatDate(date)}</p>
          <p><strong>Tarif :</strong> ${formatPrice(prix)}</p>
          ${places !== "" ? `<p><strong>Places disponibles :</strong> ${escapeHTML(places)}</p>` : ""}
          <button onclick="ouvrirInscription('${escapeHTML(id)}','${escapeHTML(titre)}')">
            S'inscrire
          </button>
        `
      );
    }).join("");

    setPage("Sorties et activités", html || empty("Aucune sortie publiée pour le moment."));
  }

  async function afficherAgenda() {
    showLoading("Chargement de l'agenda...");

    const rows = await readTable("activites");
    rows.sort((a, b) => {
      const da = new Date(valueOf(a, ["date_activite", "date", "date_debut"], 0));
      const dbb = new Date(valueOf(b, ["date_activite", "date", "date_debut"], 0));
      return da - dbb;
    });

    const html = rows.map((row) => {
      const titre = valueOf(row, ["titre", "nom", "libelle"], "Activité");
      const date = valueOf(row, ["date_activite", "date", "date_debut"], "");
      const lieu = valueOf(row, ["lieu", "endroit"], "");
      return card(titre, lieu, `<p><strong>Date :</strong> ${formatDate(date)}</p>`);
    }).join("");

    setPage("Agenda", html || empty("Aucun événement dans l'agenda."));
  }

  // INSCRIPTIONS

  window.ouvrirInscription = function (id, titre) {
    if (!content()) return;

    content().innerHTML = `
      <h2>Inscription</h2>
      <p>Activité : <strong>${escapeHTML(titre)}</strong></p>
      <form id="cse-inscription-form">
        <input type="hidden" name="activite_id" value="${escapeHTML(id)}">
        <label>Nom et prénom</label>
        <input name="nom" required maxlength="150" autocomplete="name">
        <label>Téléphone</label>
        <input name="telephone" type="tel" maxlength="30" autocomplete="tel">
        <label>Nombre de personnes</label>
        <input name="nombre_personnes" type="number" min="1" max="20" value="1" required>
        <button type="submit">Envoyer l'inscription</button>
        <button type="button" onclick="showSection('sorties')">Annuler</button>
        <div id="cse-inscription-result"></div>
      </form>
    `;

    $("#cse-inscription-form").addEventListener("submit", envoyerInscription);
  };

  async function envoyerInscription(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const result = $("#cse-inscription-result");
    const fd = new Form
