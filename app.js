
(() => {
  "use strict";

  const $ = (s) => document.querySelector(s);
  let db = null;

  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);

  function page(title, html) {
    const el = $("#content");
    if (el) {
        el.hidden = false;
        el.innerHTML = `<h2>${esc(title)}</h2>${html}`;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function errorPage(err) {
    console.error(err);
    page("Erreur", `<p>${esc(err.message || err)}</p>
      <button onclick="goHome()">Accueil</button>`);
  }

  function date(v) {
    if (!v) return "Date à préciser";
    const d = new Date(v);
    return isNaN(d) ? esc(v) : d.toLocaleDateString("fr-FR");
  }

  function price(v) {
    if (v === null || v === undefined || v === "") return "Tarif à préciser";
    const n = Number(v);
    return isNaN(n) ? esc(v) : n.toLocaleString("fr-FR", {
      style: "currency", currency: "EUR"
    });
  }

  function field(row, names, fallback = "") {
    for (const n of names) {
      if (row[n] !== null && row[n] !== undefined && row[n] !== "") {
        return row[n];
      }
    }
    return fallback;
  }

  async function rows(table) {
    const { data, error } = await db.from(table).select("*");
    if (error) throw error;
    return data || [];
  }

  function card(title, text, extra = "") {
    return `<article style="padding:14px;margin:12px 0;border:1px solid #ddd;border-radius:12px">
      <h3>${esc(title)}</h3><p>${esc(text)}</p>${extra}</article>`;
  }

  window.goHome = function () {
    page("CSE Panzani", `
      <p>Bienvenue sur l'application du CSE.</p>
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
        <button onclick="showSection('admin')">Administration</button>
      </div>`);
  };

  window.showSection = async function (section) {
    try {
      page("Chargement", "<p>Chargement en cours…</p>");

      if (["actualites", "billetterie", "offres"].includes(section)) {
        let data = await rows("actualites");
        if (section !== "actualites") {
          data = data.filter(r => String(field(r, ["categorie", "category", "type"]))
            .toLowerCase().includes(section === "offres" ? "offre" : "billetterie"));
        }
        page(section === "offres" ? "Offres" :
          section === "billetterie" ? "Billetterie" : "Actualités",
          data.map(r => card(
            field(r, ["titre", "title", "nom"], "Publication"),
            field(r, ["description", "contenu", "texte"]),
            `${field(r, ["date", "date_publication", "created_at"]) ?
              `<p>Date : ${date(field(r, ["date", "date_publication", "created_at"]))}</p>` : ""}
             ${field(r, ["prix", "tarif"]) !== "" ?
              `<p>Tarif : ${price(field(r, ["prix", "tarif"]))}</p>` : ""}`
          )).join("") || "<p>Aucune publication pour le moment.</p>");
        return;
      }

      if (section === "sorties" || section === "agenda") {
        let data = await rows("activites");
        data.sort((a, b) => new Date(field(a, ["date_activite", "date"], 0)) -
          new Date(field(b, ["date_activite", "date"], 0)));
        page(section === "agenda" ? "Agenda" : "Sorties et activités",
          data.map(r => {
            const id = field(r, ["id"]);
            const titre = field(r, ["titre", "nom", "libelle"], "Activité");
            return card(titre, field(r, ["description", "details"]),
              `<p>Date : ${date(field(r, ["date_activite", "date"]))}</p>
               <p>Tarif : ${price(field(r, ["prix", "tarif"]))}</p>
               ${section === "sorties" ?
                 `<button onclick="ouvrirInscription('${esc(id)}','${esc(titre)}')">S'inscrire</button>` : ""}`);
          }).join("") || "<p>Aucune activité publiée.</p>");
        return;
      }

      if (section === "documents") {
        const data = await rows("documents");
        page("Documents", data.map(r => {
          const url = field(r, ["url", "lien", "fichier_url", "document_url"]);
          return card(field(r, ["titre", "nom"], "Document"),
            field(r, ["description", "details"]),
            /^https?:\/\//i.test(url) ?
              `<a href="${esc(url)}" target="_blank" rel="noopener">Ouvrir</a>` : "");
        }).join("") || "<p>Aucun document disponible.</p>");
        return;
      }

      if (section === "notifications") {
        const data = await rows("notifications");
        page("Notifications", data.map(r => card(
          field(r, ["titre", "nom"], "Notification"),
          field(r, ["message", "contenu", "description"])
        )).join("") || "<p>Aucune notification.</p>");
        return;
      }

      if (section === "inscriptions") {
        page("Inscriptions", `<p>Choisis une activité pour t'inscrire.</p>
          <button onclick="showSection('sorties')">Voir les sorties</button>`);
        return;
      }

      if (section === "contact") {
        page("Contact", "<p>Pour toute question, rapproche-toi des élus du CSE Panzani.</p>");
        return;
      }

      if (section === "admin") {
        afficherAdmin();
        return;
      }

      window.goHome();
    } catch (err) {
      errorPage(err);
    }
  };

  window.ouvrirInscription = function (id, titre) {
    page("Inscription", `<p>Activité : <strong>${esc(titre)}</strong></p>
      <form id="inscription-form">
        <input type="hidden" name="activite_id" value="${esc(id)}">
        <p><label>Nom et prénom<br><input name="nom" required maxlength="150"></label></p>
        <p><label>Téléphone<br><input name="telephone" type="tel" maxlength="30"></label></p>
        <p><label>Nombre de personnes<br><input name="nombre_personnes" type="number" min="1" max="20" value="1" required></label></p>
        <button type="submit">Envoyer l'inscription</button>
        <div id="inscription-result"></div>
      </form>`);
    $("#inscription-form").addEventListener("submit", async e => {
      e.preventDefault();
      const f = e.currentTarget;
      const fd = new FormData(f);
      const result = $("#inscription-result");
      const payload = {
        activite_id: fd.get("activite_id") || null,
        nom: String(fd.get("nom") || "").trim(),
        telephone: String(fd.get("telephone") || "").trim(),
        nombre_personnes: Number(fd.get("nombre_personnes") || 1)
      };
      try {
        const { error } = await db.from("inscriptions").insert([payload]);
        if (error) throw error;
        result.textContent = "Inscription envoyée.";
        f.reset();
      } catch (err) {
        result.textContent = "Erreur : " + (err.message || err);
      }
    });
  };

  async function afficherAdmin() {
    const { data: sessionData } = await db.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      page("Connexion administrateur", `<form id="login-form">
        <p><input name="email" type="email" placeholder="Adresse e-mail" required></p>
        <p><input name="password" type="password" placeholder="Mot de passe" required></p>
        <button type="submit">Se connecter</button>
        <div id="login-result"></div>
      </form>`);
      $("#login-form").addEventListener("submit", async e => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const { error } = await db.auth.signInWithPassword({
          email: fd.get("email"), password: fd.get("password")
        });
        if (error) $("#login-result").textContent = error.message;
        else afficherAdmin();
      });
      return;
    }

    const { data: profile, error } = await db.from("profils")
      .select("role").eq("id", user.id).maybeSingle();
    if (error) throw error;

    if (profile?.role !== "admin") {
      page("Administration", `<p>Accès réservé aux administrateurs.</p>
        <button onclick="deconnexionCSE()">Déconnexion</button>`);
      return;
    }

    page("Administration", `<p>Connecté : ${esc(user.email)}</p>
      <h3>Créer une activité</h3>
      <form id="activite-form">
        <p><input name="titre" placeholder="Titre" required></p>
        <p><textarea name="description" placeholder="Description"></textarea></p>
        <p><input name="date_activite" type="date"></p>
        <p><input name="prix" type="number" min="0" step="0.01" placeholder="Tarif en euros"></p>
        <button type="submit">Créer l'activité</button>
        <div id="activite-result"></div>
      </form>
      <button onclick="listeInscriptions()">Voir les inscriptions</button>
      <div id="admin-result"></div>
      <h3>Gestion des photos et documents</h3>
<form id="fichier-form">
  <p>
    <select name="type">
      <option value="documents">Document public</option>
      <option value="photos">Photo publique</option>
    </select>
  </p>
  <p><input name="fichier" type="file" accept="image/*,.pdf,.doc,.docx" required></p>
  <button type="submit">Envoyer le fichier</button>
  <div id="fichier-result"></div>
</form>
<div id="fichiers-liste"></div>
      <button onclick="deconnexionCSE()">Déconnexion</button>`);

    $("#activite-form").addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const payload = {
        titre: String(fd.get("titre") || "").trim(),
        description: String(fd.get("description") || "").trim(),
        date_activite: fd.get("date_activite") || null,
        prix: fd.get("prix") === "" ? null : Number(fd.get("prix"))
      };
      const { error } = await db.from("activites").insert([payload]);
      $("#activite-result").textContent = error ? error.message : "Activité créée.";
    });
  }

  window.deconnexionCSE = async function () {
    await db.auth.signOut();
    window.goHome();
  };

window.listeInscriptions = async function () {
  try {
    const inscriptions = await rows("inscriptions");
    const activites = await rows("activites");
    const zone = $("#admin-result");

    if (!zone) return;

    zone.innerHTML = inscriptions.map(r => {
      const activite = activites.find(a =>
        String(a.id) === String(r.activite_id)
      );

      const titre = field(
        activite || {},
        ["titre", "title"],
        "Activité inconnue"
      );

      const telephone = field(
        r,
        ["telephone"],
        "Non renseigné"
      );

      const personnes = field(
        r,
        ["nombre_personnes"],
        "1"
      );

      return card(
        field(r, ["nom"], "Inscription"),
        `Sortie : ${titre} — Téléphone : ${telephone} — Personnes : ${personnes}`
      );
    }).join("") || "<p>Aucune inscription.</p>";

  } catch (err) {
    const zone = $("#admin-result");
    if (zone) {
      zone.textContent = err.message || String(err);
    }
  }
};

  async function init() {
    if (!window.supabase?.createClient) {
      page("Erreur", "<p>La bibliothèque Supabase n'a pas été chargée.</p>");
      return;
    }
    if (!window.CSE_SUPABASE_URL || !window.CSE_SUPABASE_KEY) {
      page("Erreur", "<p>La configuration Supabase est absente.</p>");
      return;
    }
    db = window.supabase.createClient(
      window.CSE_SUPABASE_URL, window.CSE_SUPABASE_KEY
    );
    window.goHome();
    console.log("CSE Panzani initialisé");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  // GESTION DES PHOTOS ET DOCUMENTS CSE
async function chargerFichiersCSE() {
  const zone = document.querySelector("#fichiers-liste");
  if (!zone) return;

  const { data, error } = await db.storage
    .from("cse-documents")
    .list("", { limit: 100 });

  if (error) {
    zone.textContent = "Erreur : " + error.message;
    return;
  }

  zone.innerHTML = (data || [])
    .filter(f => f.name && !f.name.startsWith("."))
    .map(f => {
      const url = db.storage.from("cse-documents")
        .getPublicUrl(f.name).data.publicUrl;
      const image = /\.(jpg|jpeg|png|gif|webp)$/i.test(f.name);

      return `
        <div style="border:1px solid #ddd;padding:12px;margin:8px 0;border-radius:8px">
          ${image
            ? `<img src="${url}" alt="" style="max-width:100%;max-height:180px">`
            : ""}
          <p>${esc(f.name)}</p>
          <a href="${url}" target="_blank" rel="noopener">Ouvrir</a>
          <button type="button" onclick="supprimerFichierCSE('${encodeURIComponent(f.name)}')">
            Supprimer
          </button>
        </div>`;
    }).join("") || "<p>Aucun fichier pour le moment.</p>";
}

window.supprimerFichierCSE = async function(nomEncode) {
  if (!confirm("Supprimer ce fichier ?")) return;
  const nom = decodeURIComponent(nomEncode);
  const { error } = await db.storage.from("cse-documents").remove([nom]);
  if (error) {
    alert("Erreur : " + error.message);
    return;
  }
  chargerFichiersCSE();
};


document.addEventListener("submit", async function(e) {
  if (!e.target || e.target.id !== "fichier-form") return;
  e.preventDefault();

  const form = e.target;
  const resultat = form.querySelector("#fichier-result");
  const input = form.querySelector('[name="fichier"]');
  const fichier = input && input.files ? input.files[0] : null;

  if (!resultat || !db) {
    alert("Erreur : connexion à la base non initialisée.");
    return;
  }

  if (!fichier) {
    resultat.textContent = "Choisis un fichier.";
    return;
  }

  try {
    resultat.textContent = "Envoi en cours…";

    const dossier = form.querySelector('[name="type"]').value;
    const chemin = dossier + "/" + Date.now() + "-" +
      fichier.name.replace(/[^a-zA-Z0-9._-]/g, "_");

    const { error } = await db.storage
      .from("cse-documents")
      .upload(chemin, fichier, {
        contentType: fichier.type || "application/octet-stream",
        upsert: false
      });

    if (error) throw error;

    resultat.textContent = "Fichier envoyé !";
    form.reset();
    await chargerFichiersCSE();
  } catch (err) {
    resultat.textContent = "Erreur : " + (err.message || String(err));
  }
});
  
})();
