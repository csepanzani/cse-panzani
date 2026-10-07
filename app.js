const pages={
actualites:["Actualités","📢","Les dernières informations du CSE, les affichages, les communications RH, CGT et CSSCT."],
billetterie:["Billetterie","🎟️","Cinémas, parcs d'attractions, spectacles et cartes cadeaux."],
sorties:["Sorties & voyages","🚌","Retrouvez les voyages, sorties, week-ends et journées organisés par le CSE."],
offres:["Offres CSE","🎁","Promotions et avantages négociés pour les salariés."],
agenda:["Agenda","📅","Toutes les dates importantes : inscriptions, sorties, événements et échéances."],
inscriptions:["Inscriptions","📝","Inscrivez-vous aux prochaines activités directement depuis votre téléphone."],
documents:["Documents","📄","Règlements, comptes rendus, fiches pratiques et informations utiles."],
contact:["Contacter le CSE","☎️","Une question ? Retrouvez ici les coordonnées et horaires du CSE."],
notifications:["Notifications","🔔","Vous avez 3 nouvelles notifications."],
plus:["Plus","☰","Paramètres, informations pratiques et espace administrateur."]
};
function showSection(key){
  if(key==="sorties"){ publicActivities(); return; }
  document.querySelector(".welcome").hidden=true;
  document.querySelector(".news").hidden=true;
  document.querySelector(".grid").hidden=true;
  document.querySelector(".feature").hidden=true;
  const c=document.getElementById("content"); c.hidden=false;
  const p=pages[key]||pages.actualites;
  c.innerHTML=`<button class="back" onclick="goHome()">← Accueil</button><h2>${p[1]} ${p[0]}</h2><p>${p[2]}</p><button class="adminBtn" onclick="adminDemo()">⚙️ Ouvrir l’espace administrateur</button><hr><p><strong>Prototype :</strong> cette rubrique est prête à recevoir les contenus réels du CSE.</p>`;
  document.querySelectorAll(".bottom button").forEach(b=>b.classList.remove("active"));
}
function goHome(){
  ["welcome","news","grid","feature"].forEach(x=>document.querySelector("."+x).hidden=false);
  document.getElementById("content").hidden=true;
  document.querySelector(".bottom button").classList.add("active");
}
document.getElementById("date").textContent=new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric"}).format(new Date());
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}


const demoEvents = [
  {id:1,title:"Week-end ski – Saint-Jean-Montclar",date:"22–24 janvier 2027",price:"130 € adulte",places:18,registered:0},
  {id:2,title:"Journée Ok Corral",date:"11 octobre 2026",price:"20 € adulte",places:50,registered:0},
  {id:3,title:"Disneyland Paris",date:"13–15 novembre 2026",price:"Selon tarif CSE",places:50,registered:0}
];

function getEvents(){
  const saved=localStorage.getItem("cse_events");
  if(saved) return JSON.parse(saved);
  localStorage.setItem("cse_events",JSON.stringify(demoEvents));
  return demoEvents;
}
function saveEvents(events){localStorage.setItem("cse_events",JSON.stringify(events));}

function adminDemo(){
  document.querySelector(".welcome").hidden=true;
  document.querySelector(".news").hidden=true;
  document.querySelector(".grid").hidden=true;
  document.querySelector(".feature").hidden=true;
  const c=document.getElementById("content"); c.hidden=false;
  renderAdmin();
}
function renderAdmin(){
  const c=document.getElementById("content"), events=getEvents();
  c.innerHTML=`
    <button class="back" onclick="goHome()">← Accueil</button>
    <h2>⚙️ Espace administrateur</h2>
    <p><strong>Gestion des activités du CSE</strong></p>
    <div class="adminStats">
      <div><b>${events.length}</b><small>Activités</small></div>
      <div><b>${events.reduce((n,e)=>n+e.registered,0)}</b><small>Inscrits</small></div>
      <div><b>${events.reduce((n,e)=>n+e.places,0)}</b><small>Places</small></div>
    </div>
    <button class="adminBtn" onclick="showCreateEvent()">➕ Créer une activité</button>
    <h3>Activités publiées</h3>
    <div id="adminEvents">${events.map(e=>`
      <div class="adminEvent">
        <strong>${e.title}</strong>
        <small>📅 ${e.date} · 💶 ${e.price} · 👥 ${e.registered}/${e.places}</small>
        <div>
          <button onclick="viewRegistrations(${e.id})">👥 Inscrits</button>
          <button onclick="deleteEvent(${e.id})">🗑️ Supprimer</button>
        </div>
      </div>`).join("")}</div>
  `;
}
function showCreateEvent(){
  const c=document.getElementById("content");
  c.innerHTML=`
    <button class="back" onclick="adminDemo()">← Administration</button>
    <h2>➕ Nouvelle activité</h2>
    <form onsubmit="createEvent(event)">
      <label>Nom de l'activité<input id="evTitle" required placeholder="Ex. Sortie ski"></label>
      <label>Date<input id="evDate" required placeholder="Ex. 22–24 janvier 2027"></label>
      <label>Tarif<input id="evPrice" required placeholder="Ex. 130 € adulte"></label>
      <label>Nombre de places<input id="evPlaces" type="number" min="1" value="50" required></label>
      <button class="primary" type="submit">Publier l'activité</button>
    </form>
  `;
}
function createEvent(e){
  e.preventDefault();
  const events=getEvents();
  events.unshift({
    id:Date.now(),
    title:document.getElementById("evTitle").value,
    date:document.getElementById("evDate").value,
    price:document.getElementById("evPrice").value,
    places:Number(document.getElementById("evPlaces").value),
    registered:0
  });
  saveEvents(events); renderAdmin();
}
function deleteEvent(id){
  if(!confirm("Supprimer cette activité ?")) return;
  saveEvents(getEvents().filter(e=>e.id!==id)); renderAdmin();
}
function viewRegistrations(id){
  const e=getEvents().find(x=>x.id===id);
  const regs=JSON.parse(localStorage.getItem("reg_"+id)||"[]");
  const c=document.getElementById("content");
  c.innerHTML=`
    <button class="back" onclick="adminDemo()">← Administration</button>
    <h2>👥 ${e.title}</h2>
    <p>${regs.length} inscription(s)</p>
    ${regs.length?regs.map((r,i)=>`<div class="adminEvent"><strong>${i+1}. ${r.name}</strong><small>${r.people} personne(s) · ${r.phone||"Téléphone non renseigné"}</small></div>`).join(""):"<p>Aucune inscription pour le moment.</p>"}
  `;
}

function publicActivities(){
  const c=document.getElementById("content"); c.hidden=false;
  document.querySelector(".welcome").hidden=true;document.querySelector(".news").hidden=true;document.querySelector(".grid").hidden=true;document.querySelector(".feature").hidden=true;
  const events=getEvents();
  c.innerHTML=`<button class="back" onclick="goHome()">← Accueil</button><h2>🚌 Sorties & activités</h2>`+
  events.map(e=>`<div class="adminEvent"><strong>${e.title}</strong><small>📅 ${e.date} · 💶 ${e.price} · 👥 ${e.places-e.registered} place(s) disponible(s)</small><button class="primary" onclick="registerEvent(${e.id})">📝 S'inscrire</button></div>`).join("");
}
function registerEvent(id){
  const e=getEvents().find(x=>x.id===id);
  if(e.registered>=e.places){alert("Cette activité est complète.");return;}
  const c=document.getElementById("content");
  c.innerHTML=`<button class="back" onclick="publicActivities()">← Activités</button><h2>📝 Inscription</h2><p><strong>${e.title}</strong><br>${e.date} · ${e.price}</p>
  <form onsubmit="submitRegistration(event,${id})">
    <label>Nom et prénom<input id="regName" required></label>
    <label>Nombre de personnes<input id="regPeople" type="number" min="1" max="${e.places-e.registered}" value="1" required></label>
    <label>Téléphone<input id="regPhone" inputmode="tel"></label>
    <button class="primary" type="submit">Valider mon inscription</button>
  </form>`;
}
function submitRegistration(ev,id){
  ev.preventDefault();
  const events=getEvents(), e=events.find(x=>x.id===id);
  const people=Number(document.getElementById("regPeople").value);
  if(e.registered+people>e.places){alert("Il ne reste pas assez de places.");return;}
  const regs=JSON.parse(localStorage.getItem("reg_"+id)||"[]");
  regs.push({name:document.getElementById("regName").value,people,phone:document.getElementById("regPhone").value});
  localStorage.setItem("reg_"+id,JSON.stringify(regs));
  e.registered+=people; saveEvents(events);
  const c=document.getElementById("content");
  c.innerHTML=`<button class="back" onclick="goHome()">← Accueil</button><h2>✅ Inscription enregistrée</h2><p>Votre inscription pour <strong>${e.title}</strong> a bien été enregistrée dans cette démonstration.</p>`;
}

function showSection(key){
  if(key==="sorties"){ publicActivities(); return; }
  document.querySelector(".welcome").hidden=true;
  document.querySelector(".news").hidden=true;
  document.querySelector(".grid").hidden=true;
  document.querySelector(".feature").hidden=true;
  const c=document.getElementById("content"); c.hidden=false;
  const p=pages[key]||pages.actualites;
  c.innerHTML=`<button class="back" onclick="goHome()">← Accueil</button><h2>${p[1]} ${p[0]}</h2><p>${p[2]}</p><button class="adminBtn" onclick="adminDemo()">⚙️ Ouvrir l’espace administrateur</button><hr><p><strong>Prototype :</strong> cette rubrique est prête à recevoir les contenus réels du CSE.</p>`;
  document.querySelectorAll(".bottom button").forEach(b=>b.classList.remove("active"));
}
function goHome(){
  ["welcome","news","grid","feature"].forEach(x=>document.querySelector("."+x).hidden=false);
  document.getElementById("content").hidden=true;
  document.querySelector(".bottom button").classList.add("active");
}
document.getElementById("date").textContent=new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"long",year:"numeric"}).format(new Date());
if("serviceWorker" in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});}

function adminDemo(){
  document.querySelector(".welcome").hidden=true;
  document.querySelector(".news").hidden=true;
  document.querySelector(".grid").hidden=true;
  document.querySelector(".feature").hidden=true;
  const c=document.getElementById("content"); c.hidden=false;
  c.innerHTML=`
    <button class="back" onclick="goHome()">← Accueil</button>
    <h2>⚙️ Espace administrateur</h2>
    <p><strong>Prototype de gestion du CSE</strong></p>
    <div style="display:grid;gap:10px;margin-top:18px">
      <button class="adminBtn" onclick="alert('Dans la version finale : formulaire pour publier une actualité.')">➕ Publier une actualité</button>
      <button class="adminBtn" onclick="alert('Dans la version finale : création d’une sortie avec date, prix et places.')">🚌 Créer une sortie</button>
      <button class="adminBtn" onclick="alert('Dans la version finale : création d’un formulaire d’inscription.')">📝 Créer une inscription</button>
      <button class="adminBtn" onclick="alert('Dans la version finale : dépôt d’une affiche ou d’un PDF.')">📎 Ajouter un document</button>
      <button class="adminBtn" onclick="alert('Dans la version finale : envoi d’une notification aux salariés.')">🔔 Envoyer une notification</button>
    </div>
    <div style="margin-top:20px;padding:15px;background:#f1f7f3;border-radius:14px">
      <strong>Tableau de bord</strong>
      <p style="margin:8px 0 0">👥 Salariés inscrits : —<br>📝 Inscriptions en cours : —<br>📢 Publications : —</p>
    </div>`;
  document.querySelectorAll(".bottom button").forEach(b=>b.classList.remove("active"));
}

/* ===== Connexion Supabase ===== */
let supabaseClient = null;
let currentUser = null;
let currentProfile = null;

function initSupabase(){
  if(!window.supabase || !window.CSE_SUPABASE_URL || !window.CSE_SUPABASE_KEY) return;
  supabaseClient = window.supabase.createClient(window.CSE_SUPABASE_URL, window.CSE_SUPABASE_KEY);
  supabaseClient.auth.getSession().then(({data})=>{
    currentUser = data.session?.user || null;
    if(currentUser) loadProfile();
  });
  supabaseClient.auth.onAuthStateChange((_event, session)=>{
    currentUser = session?.user || null;
    if(currentUser) loadProfile();
    else { currentProfile=null; updateAuthBadge(); }
  });
}

async function loadProfile(){
  if(!supabaseClient || !currentUser) return;
  const {data,error}=await supabaseClient.from('profils').select('id,nom,role').eq('id',currentUser.id).maybeSingle();
  if(error){ console.warn('Profil non accessible:',error.message); currentProfile=null; }
  else currentProfile=data;
  updateAuthBadge();
}

function updateAuthBadge(){
  const el=document.getElementById('authBadge');
  if(!el) return;
  if(currentUser){
    const label=currentProfile?.nom || currentUser.email || 'Compte connecté';
    el.innerHTML=`<span class="userBadge">👤 ${escapeHtml(label)}${currentProfile?.role==='admin'?' · ADMIN':''}</span>`;
  }else el.textContent='Non connecté';
}

function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));}

function showAuth(){
  document.querySelector('.welcome').hidden=true;
  document.querySelector('.news').hidden=true;
  document.querySelector('.grid').hidden=true;
  document.querySelector('.feature').hidden=true;
  const c=document.getElementById('content'); c.hidden=false;
  c.innerHTML=`
    <button class="back" onclick="goHome()">← Accueil</button>
    <h2>🔐 Connexion CSE</h2>
    <div class="status" id="authBadge">${currentUser?'Compte connecté':'Non connecté'}</div>
    ${currentUser ? `
      <div class="authBox">
        <h3>Compte connecté</h3>
        <p>${escapeHtml(currentUser.email||'')}</p>
        <p>${currentProfile?.role==='admin'?'✅ Vous êtes administrateur du CSE.':'Compte salarié'}</p>
        ${currentProfile?.role==='admin'?'<button class="adminBtn" onclick="adminDemo()">⚙️ Ouvrir l’administration</button>':''}
        <button class="adminBtn danger" onclick="signOut()">Se déconnecter</button>
      </div>` : `
      <div class="authBox">
        <h3>Connexion administrateur</h3>
        <p class="status">Utilise l'adresse e-mail et le mot de passe du compte administrateur créé dans Supabase.</p>
        <form onsubmit="loginAdmin(event)">
          <label>E-mail<input id="loginEmail" type="email" autocomplete="username" required></label>
          <label>Mot de passe<input id="loginPassword" type="password" autocomplete="current-password" required></label>
          <button class="primary" type="submit">Se connecter</button>
        </form>
        <p id="loginMsg" class="status"></p>
      </div>`}`;
}

async function loginAdmin(ev){
  ev.preventDefault();
  const msg=document.getElementById('loginMsg');
  msg.textContent='Connexion en cours…';
  if(!supabaseClient){msg.textContent='Supabase n’est pas configuré.';return;}
  const email=document.getElementById('loginEmail').value.trim();
  const password=document.getElementById('loginPassword').value;
  const {error}=await supabaseClient.auth.signInWithPassword({email,password});
  if(error){msg.textContent='Connexion impossible : '+error.message;return;}
  await loadProfile();
  if(currentProfile?.role!=='admin'){
    await supabaseClient.auth.signOut();
    msg.textContent='Ce compte n’a pas le rôle administrateur.';
    return;
  }
  showAuth();
}

async function signOut(){
  if(supabaseClient) await supabaseClient.auth.signOut();
  showAuth();
}

// Remplace le bouton "Plus" par un accès à la connexion.
const originalShowSection = window.showSection;
window.showSection = function(key){
  if(key==='plus'){ showAuth(); return; }
  return originalShowSection(key);
};

initSupabase();
