// Google Analytics 4 mit Einwilligung (Consent): vor dem Klick auf "Akzeptieren" wird nichts geladen oder gesendet.
const GA_ID = "G-XXXXXXXXXX"; // <- hier eure GA4-Mess-ID eintragen
const KEY = "displate_consent"; // "granted" oder "denied"
let queue = [];

window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

function loadGA(){
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
  gtag("consent", "update", { analytics_storage: "granted" });
  gtag("js", new Date());
  gtag("config", GA_ID, { anonymize_ip: true });
  if (GA_ID !== "G-XXXXXXXXXX") {
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
  } else {
    console.warn("Keine GA4-ID eingetragen: Events werden nur in der Konsole angezeigt.");
  }
  queue.forEach(e => gtag("event", e[0], e[1]));
  queue = [];
}

// Events senden: nur mit Einwilligung. Solange noch nicht entschieden wurde, warten sie in der Warteschlange.
function track(name, params){
  params = params || {};
  const c = localStorage.getItem(KEY);
  if (c === "granted") { console.log("Event:", name, params); gtag("event", name, params); }
  else if (c === null) { queue.push([name, params]); }
}

function decide(value){
  localStorage.setItem(KEY, value);
  document.getElementById("consent").hidden = true;
  if (value === "granted") loadGA(); else queue = [];
}

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("consent");
  const c = localStorage.getItem(KEY);
  if (c === "granted") loadGA(); else if (c === null) banner.hidden = false;
  document.getElementById("accept").onclick = () => decide("granted");
  document.getElementById("reject").onclick = () => decide("denied");
  document.getElementById("reset").onclick = () => { localStorage.removeItem(KEY); location.reload(); };
});
