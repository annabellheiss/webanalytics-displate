// Amplitude mit Einwilligung (Consent): vor dem Klick auf "Akzeptieren" wird nichts geladen oder gesendet.
const AMPLITUDE_KEY = "27faa9fe3582a214db7c94655cbdb6a3";
const KEY = "displate_consent"; // "granted" oder "denied"
let queue = [];
let bereit = false; // true, sobald Amplitude geladen ist

function loadAmplitude() {
  const script = document.createElement("script");
  script.src = "https://cdn.amplitude.com/script/" + AMPLITUDE_KEY + ".js";

  script.onload = () => {
    window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
    window.amplitude.init(AMPLITUDE_KEY, {
      fetchRemoteConfig: true,
      autocapture: true,
      trackingOptions: { ipAddress: false } // IP-Adresse nicht speichern
    });
    bereit = true;

    // Events, die vor dem Laden passiert sind, jetzt senden
    queue.forEach(e => window.amplitude.track(e[0], e[1]));
    queue = [];
  };

  document.head.appendChild(script);
}

// Events senden: nur mit Einwilligung. Solange noch nicht entschieden oder geladen wurde, warten sie in der Warteschlange.
function track(name, params) {
  params = params || {};
  const c = localStorage.getItem(KEY);

  if (c === "granted" && bereit) {
    console.log("Event:", name, params);
    window.amplitude.track(name, params);
  } else if (c === "granted" || c === null) {
    queue.push([name, params]);
  }
}

function decide(value) {
  localStorage.setItem(KEY, value);
  document.getElementById("consent").hidden = true;
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
