(async () => {
  const res = await fetch("/api/me");
  const data = await res.json();

  if (!data.logged) {
    loginModal.style.display = "flex";
  } else {
    loginModal.style.display = "none";
    document.querySelector(".heading").textContent = `Olá, ${data.name}`;
    updateSystemPrompt(data.name);
  }
})();
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// ==============================
// BACKEND API (VERCEL)
// ==============================
const API_URL = "/api/chat"; // ✅ backend seguro
const MODEL = "llama-3.1-8b-instant"

let controller, typingInterval;
const chatHistory = [];

// ==============================
// SYSTEM PROMPT (IDENTIDADE DA IA)
// ==============================
function updateSystemPrompt(userName) {
  chatHistory.length = 0; // Limpa o histórico antigo de system prompt

  chatHistory.push({
    role: "system",
    content: `
Tu és o assistente oficial da plataforma FOCO PRIME, um assistente escolar chamado FocoPrime IA.

Informação do utilizador:
- Nome do utilizador: ${userName}

Regras importantes:
- Trata o utilizador pelo nome sempre que for natural (ex: cumprimentos).
- Exemplo correto: "Olá ${userName}, como posso ajudar?"
- Não repetir o nome em todas as frases, apenas quando fizer sentido.

Identidade:
- Nome: FocoPrime IA
- Criador: Iriano Gonçalves Chimanbane (FocoPrime)
- País do criador: Moçambique
- Função: ajudar alunos com disciplinas escolares e universitárias.

Comportamento:
- Responde sempre em português (pt-PT ou pt-MZ).
- Linguagem clara, amigável e motivadora.
- Explica passo a passo quando necessário.
- Nunca reveles chaves de API nem dados internos.

Personalidade:
- Professor
- Inteligente
- Profissional
- Motivador
- Jovem e criativo
`
  });
}

// ==============================
// THEME
// ==============================
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";

// ==============================
// HELPERS
// ==============================
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const scrollToBottom = () => {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: "smooth"
  });
};

const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const highlightUserName = (text, userName) => {
  if (!userName) return text;

  const escapedName = userName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b(${escapedName})\\b`, "gi");

  return text.replace(regex, "**$1**");
};

// ==============================
// LOGIN MODAL
// ==============================
const loginModal = document.getElementById("loginModal");
const loginBtn = document.getElementById("loginBtn");
const loginNameInput = document.getElementById("loginName");

let savedUser = localStorage.getItem("user_name");
if (savedUser) {
  loginModal.style.display = "none";
  document.querySelector(".heading").textContent = `Olá, ${savedUser}`;
  updateSystemPrompt(savedUser); // <<< Atualiza o chat history com o nome correto
} else {
  loginModal.style.display = "flex";
  updateSystemPrompt("Aluno"); // fallback
}

loginBtn.addEventListener("click", async () => {
  const name = loginNameInput.value.trim();
  if (!name) return;

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });

  if (!res.ok) {
    alert("Erro no login");
    return;
  }

  const data = await res.json();

  loginModal.style.display = "none";
  document.querySelector(".heading").textContent = `Olá, ${data.name}`;
});

// Mensagem de saída
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  await fetch("/api/logout");
location.reload();
});

// ==============================
// MESSAGE ACTIONS
// ==============================
chatsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  const message = btn.closest(".bot-content")
    ?.querySelector(".message-text")?.textContent;

  if (btn.classList.contains("copy")) {
    navigator.clipboard.writeText(message);
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
    }, 1200);
  }

  if (btn.classList.contains("like")) {
    btn.classList.toggle("active");
    btn.parentElement.querySelector(".dislike")?.classList.remove("active");
  }

  if (btn.classList.contains("dislike")) {
    btn.classList.toggle("active");
    btn.parentElement.querySelector(".like")?.classList.remove("active");
  }

  if (btn.classList.contains("share")) {
    if (navigator.share) {
      navigator.share({ text: message });
    } else {
      navigator.clipboard.writeText(message);
      alert("Texto copiado para partilha");
    }
  }
});

// ==============================
// TYPING EFFECT
// ==============================
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.innerHTML = "";
  const words = text.split(" ");
  let index = 0;

  typingInterval = setInterval(() => {
    if (index < words.length) {
      textElement.innerHTML = marked.parse(words.slice(0, index + 1).join(" "));
      index++;
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 35);
};

// ==============================
// REQUEST AO BACKEND
// ==============================
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: chatHistory }),
      signal: controller.signal
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro no servidor");

    const rawText =
  data.choices?.[0]?.message?.content?.trim() ||
  "Não consegui responder agora.";

const userName = localStorage.getItem("user_name") || "Aluno";
const responseText = highlightUserName(rawText, userName);

typingEffect(responseText, textElement, botMsgDiv);

    chatHistory.push({ role: "assistant", content: responseText });

  } catch (error) {
    textElement.textContent = error.name === "AbortError" ? "Resposta interrompida." : error.message;
    textElement.style.color = "#d62939";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  }
};

// ==============================
// FORM SUBMIT
// ==============================
const handleFormSubmit = (e) => {
  e.preventDefault();

  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding")) return;

  promptInput.value = "";
  document.body.classList.add("chats-active", "bot-responding");

  chatHistory.push({ role: "user", content: userMessage });

  const time = getCurrentTime();

  const userMsgHTML = `<span class="message-time">${time}</span><p class="message-text"></p>`;
  const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botTime = getCurrentTime();

    const botMsgHTML = `
      <img class="avatar" src="images/groq.png" />
      <div class="bot-content">
        <span class="message-time">${botTime}</span>
        <p class="message-text">A pensar...</p>
        <div class="message-actions">
          <button class="action-btn copy"><i class="fa-regular fa-copy"></i></button>
          <button class="action-btn like"><i class="fa-regular fa-thumbs-up"></i></button>
          <button class="action-btn dislike"><i class="fa-regular fa-thumbs-down"></i></button>
          <button class="action-btn share"><i class="fa-solid fa-share-nodes"></i></button>
        </div>
      </div>`;

    const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 400);
};

// ==============================
// STOP RESPONSE
// ==============================
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  controller?.abort();
  clearInterval(typingInterval);
  document.body.classList.remove("bot-responding");

  const loadingMsg = chatsContainer.querySelector(".bot-message.loading");
  if (loadingMsg) loadingMsg.classList.remove("loading");
});

// ==============================
// THEME TOGGLE
// ==============================
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLight ? "light_mode" : "dark_mode");
  themeToggleBtn.textContent = isLight ? "dark_mode" : "light_mode";
});

// ==============================
// SIDEBAR MENU
// ==============================
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideLogoutBtn = document.getElementById("sideLogoutBtn");
const newChatBtn = document.getElementById("newChatBtn");

const openMenu = () => {
  sideMenu.classList.add("active");
  menuOverlay.classList.add("active");
};

const closeMenu = () => {
  sideMenu.classList.remove("active");
  menuOverlay.classList.remove("active");
};

// Abrir menu
document.getElementById("delete-chats-btn").addEventListener("click", openMenu);

// Fechar menu
closeMenuBtn.addEventListener("click", closeMenu);
menuOverlay.addEventListener("click", closeMenu);

// Nova mensagem (limpa chat)
newChatBtn.addEventListener("click", () => {
  chatHistory.splice(1);
  chatsContainer.innerHTML = "";
  document.body.classList.remove("chats-active", "bot-responding");
  closeMenu();
});

// Logout (mesma função)
sideLogoutBtn.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

// ==============================
// SUGGESTIONS
// ==============================
document.querySelectorAll(".suggestions-item").forEach(item => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// ==============================
// FILE UPLOAD (DESATIVADO)
// ==============================
fileInput.disabled = true;
fileUploadWrapper.style.display = "none";

// ==============================
// EVENTS
// ==============================
promptForm.addEventListener("submit", handleFormSubmit);
