// Google Tag Manager mit Einwilligung (Consent): vor dem Klick auf "Akzeptieren" wird nichts geladen oder gesendet.
const GTM_ID = "GTM-W2SFBTR2";
const KEY = "displate_consent"; // "granted" oder "denied"
let queue = [];

window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}

function loadGTM() {
  // Consent standardmäßig auf denied, dann auf granted setzen
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });
  gtag("consent", "update", { analytics_storage: "granted" });

  // Standard-Code von GTM
  dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtm.js?id=" + GTM_ID;
  document.head.appendChild(script);

  // Events, die vor dem Consent passiert sind, jetzt senden
  queue.forEach(e => dataLayer.push(e));
  queue = [];
}

// Events senden: nur mit Einwilligung. Solange noch nicht entschieden wurde, warten sie in der Warteschlange.
function track(name, params) {
  const eintrag = Object.assign({ event: name }, params);
  const c = localStorage.getItem(KEY);

  if (c === "granted") {
    console.log("Event:", name, params);
    dataLayer.push(eintrag);
  } else if (c === null) {
    queue.push(eintrag);
  }
}

function decide(value) {
  localStorage.setItem(KEY, value);
  document.getElementById("consent").hidden = true;
  if (value === "granted") {
    loadGTM();
  } else {
    queue = [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("consent");
  const c = localStorage.getItem(KEY);

  if (c === "granted") {
    loadGTM();
  } else if (c === null) {
    banner.hidden = false;
  }

  document.getElementById("accept").onclick = () => decide("granted");
  document.getElementById("reject").onclick = () => decide("denied");
  document.getElementById("reset").onclick = () => {
    localStorage.removeItem(KEY);
    location.reload();
  };
});
