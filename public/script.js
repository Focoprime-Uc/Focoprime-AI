let lastAIResponse = "";
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// ==============================
// BACKEND API
// ==============================
const API_URL = "/api/chat";
const MODEL = "llama-3.1-8b-instant";

let controller, typingInterval;
const chatHistory = [];

// Inicializa system prompt ao carregar página
updateSystemPrompt("Aluno");

// ==============================
// SYSTEM PROMPT
// ==============================
function updateSystemPrompt(userName) {
  chatHistory.length = 0;
  chatHistory.push({
    role: "system",
    content: `
Tu és o assistente oficial da plataforma FOCO PRIME, um assistente escolar chamado FocoPrime IA.

Informação do utilizador:
- Nome do utilizador: ${userName}

Regras importantes:
- Trata o utilizador pelo nome sempre que fizer sentido.
- Exemplo: "Olá ${userName}, como posso ajudar?"

Identidade:
- Nome: FocoPrime IA
- Criador: Iriano Gonçalves Chimanbane
- País: Moçambique
- Função: ajudar alunos e programadores

Comportamento:
- Responde sempre em língua que o usuário usar
- Linguagem clara, amigável e motivadora
- Explica passo a passo quando necessário
- Nunca reveles chaves de API ou dados internos

Personalidade:
- Professor, Inteligente, Profissional, Motivador, programador, Jovem e Criativo
`
  });
}

// ==============================
// THEME (claro por padrão)
// ==============================
const savedTheme = localStorage.getItem("themeColor");

// se não houver nada salvo, assume claro
const isLightTheme = savedTheme !== "dark_mode";

document.body.classList.toggle("light-theme", isLightTheme);
themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";

themeToggleBtn.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLight ? "light_mode" : "dark_mode");
  themeToggleBtn.textContent = isLight ? "dark_mode" : "light_mode";
});

// ==============================
// HELPERS
// ==============================
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

const getCurrentTime = () => new Date().toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });

const highlightUserName = (text, userName) => {
  if (!userName) return text;
  const escapedName = userName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`\\b(${escapedName})\\b`, "gi");
  return text.replace(regex, "**$1**");
};

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function looksLikeCode(text) {
  return (
    text.includes("```") ||
    text.includes("<!DOCTYPE") ||
    text.includes("<html") ||
    text.includes("{") ||
    text.includes(";")
  );
}

// ==============================
// MESSAGE ACTIONS
// ==============================
chatsContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".action-btn");
  if (!btn) return;

  const message = btn.closest(".bot-content")?.querySelector(".message-text")?.textContent;

  if (btn.classList.contains("copy")) {
    navigator.clipboard.writeText(message);
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    setTimeout(() => btn.innerHTML = '<i class="fa-regular fa-copy"></i>', 1200);
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
    if (navigator.share) navigator.share({ text: message });
    else { navigator.clipboard.writeText(message); alert("Texto copiado para partilha"); }
  }

  if (btn.classList.contains("pdf")) {
    if (!lastAIResponse) { alert("Nenhuma resposta para exportar."); return; }
    gerarPDF(lastAIResponse);
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

  enhanceCodeBlocks(botMsgDiv);
}
  }, 35);
};

function enhanceCodeBlocks(container) {
  container.querySelectorAll("pre > code").forEach(code => {
    const pre = code.parentElement;

    if (pre.parentElement.classList.contains("code-block")) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";

    const btn = document.createElement("button");
    btn.className = "copy-code-btn";
    btn.textContent = "Copiar";

    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(code.innerText);
      btn.textContent = "Copiado ✓";
      setTimeout(() => btn.textContent = "Copiar", 1500);
    });

    pre.replaceWith(wrapper);
    wrapper.appendChild(btn);
    wrapper.appendChild(pre);
  });

  Prism.highlightAll();
}

// ==============================
// GENERATE RESPONSE
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

    const rawText = data.choices?.[0]?.message?.content?.trim() || "Não consegui responder agora.";
    const currentUser = auth.currentUser;
const userName = currentUser?.displayName || "Aluno";
    const responseText = highlightUserName(rawText, userName);

    const isCode = looksLikeCode(rawText);

// se for código → render direto (SEM typing)
if (isCode) {
  textElement.innerHTML = marked.parse(rawText);
  botMsgDiv.classList.remove("loading");
  document.body.classList.remove("bot-responding");

  enhanceCodeBlocks(botMsgDiv);
  scrollToBottom();

  lastAIResponse = rawText;
  chatHistory.push({ role: "assistant", content: rawText });

} else {
  // texto normal → typing effect
  typingEffect(responseText, textElement, botMsgDiv);

  lastAIResponse = responseText;
  chatHistory.push({ role: "assistant", content: responseText });
}

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

  const userMsgDiv = createMessageElement(`<span class="message-time">${time}</span><p class="message-text"></p>`, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botTime = getCurrentTime();
    const botMsgDiv = createMessageElement(`
      <img class="avatar" src="images/groq.png" />
      <div class="bot-content">
        <span class="message-time">${botTime}</span>
        <p class="message-text">A pensar...</p>
        <div class="message-actions">
          <button class="action-btn copy"><i class="fa-regular fa-copy"></i></button>
          <button class="action-btn like"><i class="fa-regular fa-thumbs-up"></i></button>
          <button class="action-btn dislike"><i class="fa-regular fa-thumbs-down"></i></button>
          <button class="action-btn share"><i class="fa-solid fa-share-nodes"></i></button>
          <button class="action-btn pdf">
  <i class="fa-solid fa-file-pdf"></i>
</button>
        </div>
      </div>
    `, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 400);
};
promptForm.addEventListener("submit", handleFormSubmit);

// ==============================
// STOP RESPONSE
// ==============================
document.querySelector("#stop-response-btn")?.addEventListener("click", () => {
  controller?.abort();
  clearInterval(typingInterval);
  document.body.classList.remove("bot-responding");
  const loadingMsg = chatsContainer.querySelector(".bot-message.loading");
  if (loadingMsg) loadingMsg.classList.remove("loading");
});

// ==============================
// SIDEBAR MENU
// ==============================
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideLogoutBtn = document.getElementById("sideLogoutBtn");
const newChatBtn = document.getElementById("newChatBtn");

const openMenu = () => { sideMenu.classList.add("active"); menuOverlay.classList.add("active"); };
const closeMenu = () => { sideMenu.classList.remove("active"); menuOverlay.classList.remove("active"); };

document.getElementById("delete-chats-btn")?.addEventListener("click", openMenu);
closeMenuBtn?.addEventListener("click", closeMenu);
menuOverlay?.addEventListener("click", closeMenu);

newChatBtn?.addEventListener("click", () => {
  chatHistory.splice(1);
  chatsContainer.innerHTML = "";
  document.body.classList.remove("chats-active", "bot-responding");
  closeMenu();
});

sideLogoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
  location.reload();
});

// ==============================
// FILE UPLOAD
// ==============================
fileInput.disabled = false;
fileUploadWrapper.style.display = "flex";

// ==============================
// PDF
// ==============================
async function gerarPDF(texto) {
  // Criar um novo PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Adicionar texto (ajusta margens e largura)
  const linhas = doc.splitTextToSize(texto, 180); // 180mm de largura
  doc.text(linhas, 10, 20); // x=10, y=20

  // Download do PDF
  doc.save("focoprime.pdf");
}

// ===== BLOQUEAR UPLOAD E MOSTRAR UPGRADE =====
const addFileBtn = document.getElementById("add-file-btn");
const upgradeModal = document.getElementById("upgradeModal");
const closeUpgrade = document.getElementById("closeUpgrade");

if (addFileBtn) {
  addFileBtn.addEventListener("click", (e) => {
    e.preventDefault();
    upgradeModal.classList.add("show");
  });
}

closeUpgrade.addEventListener("click", () => {
  upgradeModal.classList.remove("show");
});

upgradeModal.addEventListener("click", (e) => {
  if (e.target === upgradeModal) {
    upgradeModal.classList.remove("show");
  }
});

// =========== MOSTRAR OCULTAR SENHA ========
const toggleLoginPassword = document.getElementById("toggleLoginPassword");
const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");

function setupPasswordToggle(toggleBtn, inputField) {
  toggleBtn.addEventListener("click", () => {
    const type = inputField.getAttribute("type") === "password" ? "text" : "password";
    inputField.setAttribute("type", type);

    // muda o ícone
    toggleBtn.classList.toggle("ri-eye-line");
    toggleBtn.classList.toggle("ri-eye-off-line");
  });
}

// Ativa os toggles
setupPasswordToggle(toggleLoginPassword, passwordInput);
setupPasswordToggle(toggleRegisterPassword, registerPassword);
