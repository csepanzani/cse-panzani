
(() => {
  "use strict";

  if (!window.supabase?.createClient ||
      !window.CSE_SUPABASE_URL ||
      !window.CSE_SUPABASE_KEY) return;

  const db = window.supabase.createClient(
    window.CSE_SUPABASE_URL,
    window.CSE_SUPABASE_KEY
  );

  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);

  const prix = v => Number(v || 0).toLocaleString("fr-FR", {
    style: "currency", currency: "EUR"
  });

  async function afficherBilletterie() {
    const zone = document.querySelector("#content");
    if (!zone) return;

    zone.hidden = false;
    zone.innerHTML = "<h2>Billetterie</h2><p>Chargement des offres…</p>";

    const { data: offres, error } = await db
      .from("billetterie_offres")
      .select("*")
      .eq("actif", true)
      .order("created_at", { ascending: false });

    if (error) {
      zone.innerHTML = "<h2>Billetterie</h2><p>Erreur de chargement : " +
        esc(error.message) + "</p>";
      return;
    }

    zone.innerHTML = "<h2>Billetterie CSE</h2>" +
      ((offres || []).map(o => `
        <article style="border:1px solid #ddd;border-radius:14px;padding:15px;margin:12px 0">
          ${o.image_url ? `<img src="${esc(o.image_url)}" alt="" style="width:100%;max-height:180px;object-fit:contain">` : ""}
          <h3>${esc(o.titre)}</h3>
          <p>${esc(o.description || "")}</p>
          <p><strong>Tarif CSE : ${prix(o.tarif_cse)}</strong></p>
          ${o.tarif_public != null ? `<p>Tarif public : ${prix(o.tarif_public)}</p>` : ""}
          <p>Billets disponibles : ${Number(o.stock)}</p>
          ${Number(o.stock) > 0 ? `
            <form class="demande-billetterie" data-id="${esc(o.id)}">
              <label>Nom et prénom
                <input name="nom" required maxlength="150">
              </label>
              <label>Téléphone
                <input name="telephone" type="tel" maxlength="30">
              </label>
              <label>Nombre de billets
                <input name="quantite" type="number" min="1" max="${Number(o.stock)}" value="1" required>
              </label>
              <button class="primary" type="submit">Demander ces billets</button>
              <p class="resultat-demande" aria-live="polite"></p>
            </form>` : "<p>Indisponible actuellement.</p>"}
        </article>`).join("") || "<p>Aucune offre disponible pour le moment.</p>");
  }

  document.addEventListener("submit", async e => {
    const form = e.target;
    if (!form.matches(".demande-billetterie")) return;

    e.preventDefault();
    const resultat = form.querySelector(".resultat-demande");
    const fd = new FormData(form);
    const quantite = Number(fd.get("quantite"));

    resultat.textContent = "Envoi de la demande…";

    const { data: offre, error: erreurOffre } = await db
      .from("billetterie_offres")
      .select("id,stock,actif")
      .eq("id", form.dataset.id)
      .eq("actif", true)
      .maybeSingle();

    if (erreurOffre || !offre || quantite < 1 || quantite > offre.stock) {
      resultat.textContent = "Offre indisponible ou stock insuffisant.";
      return;
    }

    const { error } = await db.from("billetterie_demandes").insert([{
      offre_id: offre.id,
      nom: String(fd.get("nom") || "").trim(),
      telephone: String(fd.get("telephone") || "").trim(),
      quantite,
      statut: "en_attente"
    }]);

    if (error) {
      resultat.textContent = "Erreur : " + error.message;
      return;
    }

    form.reset();
    resultat.textContent = "Demande envoyée au CSE ! Elle est en attente de validation.";
  });

  const ancienneSection = window.showSection;
  window.showSection = async function(section) {
    if (section === "billetterie") {
      await afficherBilletterie();
      return;
    }
    if (ancienneSection) return ancienneSection.apply(this, arguments);
  };
})();
