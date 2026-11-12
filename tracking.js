// Amplitude mit Einwilligung (Consent): vor dem Klick auf "Akzeptieren" wird nichts geladen oder gesendet.
const AMPLITUDE_KEY = "27faa9fe3582a214db7c94655cbdb6a3";
const KEY = "displate_consent"; // Speichert Einwilligung "granted" oder "denied"
let queue = []; // Warteschlange für Events
let bereit = false; // Ist Amplitude geladen?  -> true, sobald Amplitude geladen ist

function loadAmplitude() {
  const script = document.createElement("script"); // neues Script
  script.src = "https://cdn.amplitude.com/script/" + AMPLITUDE_KEY + ".js";

  script.onload = () => { // wird ausgeführt, wenn Amplitude geladen ist
    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
    window.amplitude.init(AMPLITUDE_KEY, {
      fetchRemoteConfig: true, // Konfiguration vom Server laden
      autocapture: true, // Klicks automatisch erfassen
      trackingOptions: { ipAddress: false } // IP-Adresse nicht speichern
    });
    bereit = true; // Amplitude ist jetzt einsatzbereit

    // Events, die vor dem Laden passiert sind, jetzt senden
    queue.forEach(e => window.amplitude.track(e[0], e[1]));
    queue = [];
  };

  document.head.appendChild(script); // Script in HTML Seite einfügen
}

// Events senden: nur mit Einwilligung. Solange noch nicht entschieden oder geladen wurde, warten sie in der Warteschlange.
function track(name, params) {
  params = params || {};
  const c = localStorage.getItem(KEY); // Einwillgung aus Browser lesen

  if (c === "granted" && bereit) {
    console.log("Event:", name, params);
    window.amplitude.track(name, params); // Event an Amplitude senden
  } else if (c === "granted" || c === null) {
    queue.push([name, params]);
  }
}

// Entscheidung des Benutzers speichern
function decide(value) {
  localStorage.setItem(KEY, value); // Zustimmunf oder Ablehnung speichern
  document.getElementById("consent").hidden = true; // Banner ausblenden
  if (value === "granted") {
    loadAmplitude();
  } else {
    queue = [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("consent");
  const c = localStorage.getItem(KEY);

  if (c === "granted") {
    loadAmplitude();
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
