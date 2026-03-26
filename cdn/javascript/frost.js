(function() {
let pref = localStorage.getItem("ks_intro_pref");

const prompt = document.getElementById("introPromptOverlay");
const videoOverlay = document.getElementById("videoOverlay");
const introBox = document.createElement("div");
introBox.id = "cinematicIntro";
document.body.appendChild(introBox);

const loading = document.getElementById("loadingOverlay");
const main = document.getElementById("mainContent");

const yes = document.getElementById("introYesBtn");
const no = document.getElementById("introNoBtn");

const left = document.createElement("div");
const right = document.createElement("div");

left.className = "intro-left";
right.className = "intro-right";

introBox.appendChild(left);
introBox.appendChild(right);

function type(el, text, speed) {
  el.textContent = "";
  let i = 0;
  function t() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(t, speed);
    }
  }
  t();
}

function startCinematic() {
  prompt.style.display = "none";
  introBox.classList.add("show");

  type(left, "Keyshaun Sookdar\nThe SQL Assassin", 18);

  setTimeout(() => {
    left.classList.add("exit");
    setTimeout(() => {
      right.classList.add("show");
      type(right,
        "Who is Keyshaun Sookdar?\n\nA system-focused developer building fast, clean, and controlled environments.\nFrom backend logic to frontend precision, every layer is engineered for performance.",
        14
      );
    }, 700);
  }, 11000);

  setTimeout(() => {
    introBox.classList.remove("show");
    startLoader();
  }, 23000);
}

function startLoader() {
  loading.classList.add("active");

  const lines = document.getElementById("loadingLines");
  lines.innerHTML = "";

  const msgs = [
    "[✓] Initializing core",
    "[✓] Loading UI",
    "[✓] Injecting systems",
    "[✓] Syncing assets",
    "[✓] Ready"
  ];

  let i = 0;
  function next() {
    if (i < msgs.length) {
      const d = document.createElement("div");
      d.textContent = msgs[i];
      lines.appendChild(d);
      i++;
      setTimeout(next, 400);
    } else {
      setTimeout(() => {
        loading.classList.remove("active");
        main.classList.add("visible");
      }, 700);
    }
  }
  next();
}

yes.onclick = () => {
  localStorage.setItem("ks_intro_pref", "yes");
  startCinematic();
};

no.onclick = () => {
  localStorage.setItem("ks_intro_pref", "no");
  prompt.style.display = "none";
  main.classList.add("visible");
};

if (pref === "yes") {
  startCinematic();
} else if (pref === "no") {
  prompt.style.display = "none";
  main.classList.add("visible");
}

})();