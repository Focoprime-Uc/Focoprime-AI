let currentChatId = null;
let userPlan = "free";
let lastAIResponse = "";
const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");
const avatarLoading = document.getElementById("avatarLoading");

// ==============================
// BACKEND API
// ==============================
const API_URL = "/api/chat";
const MODEL = "llama-3.1-8b-instant";

// ==============================
// MODEL CONTROL SYSTEM
// ==============================

const MODEL_LIMITS = {
  "v3.5": 5,
  "v4.0": 10,
  "v5.0": Infinity
};

let currentModel = "v3.5";
let messageCount = 0;
let resetAt = 0;

function getRemainingMessages() {
  const limit = MODEL_LIMITS[currentModel];

  if (limit === Infinity) return Infinity;

  return limit - messageCount;
}

function updateUsageDisplay() {
  const remaining = getRemainingMessages();
  const timeLeft = getRemainingTime();

  let badge = document.getElementById("modelUsageBadge");
  if (!badge) {
    badge = document.createElement("div");
    badge.id = "modelUsageBadge";
    document.body.appendChild(badge);
  }

  const panelInfo = document.getElementById("userUsageInfo");

  if (remaining === Infinity) {
    badge.textContent = `Modelo: ${currentModel} • Ilimitado`;
    
    if (panelInfo) {
      panelInfo.innerHTML = `
  <div class="row">
    <span class="label">Modelo</span>
    <span class="value">${currentModel}</span>
  </div>

  <div class="row">
    <span class="label">Plano</span>
    <span class="value premium">Premium</span>
  </div>

  <div class="row">
    <span class="label">Mensagens</span>
    <span class="value">Ilimitadas</span>
  </div>
`;
    }

  } else {
    badge.textContent = `Modelo: ${currentModel} • ${remaining} restantes`;

    if (panelInfo) {
      panelInfo.innerHTML = `
  <div class="row">
    <span class="label">Modelo</span>
    <span class="value">${currentModel}</span>
  </div>

  <div class="row">
    <span class="label">Plano</span>
    <span class="value">${userPlan}</span>
  </div>

  <div class="row">
    <span class="label">Restam</span>
    <span class="value">${remaining} mensagens</span>
  </div>

  <div class="row">
    <span class="label">Reset</span>
    <span class="value">${timeLeft}</span>
  </div>
`;

const limit = MODEL_LIMITS[currentModel];
const percentage = limit === Infinity ? 0 : (messageCount / limit) * 100;

panelInfo.innerHTML += `
  <div class="progress-bar">
    <div class="progress-fill" style="width:${percentage}%"></div>
  </div>
`;
    }
  }
  
  // Atualizar texto no header
const statusText = document.getElementById("statusText");
if (statusText) {
  const remaining = getRemainingMessages();

  if (remaining === Infinity) {
    statusText.textContent = "Ilimitado";
  } else {
    statusText.textContent = `${remaining} restantes`;
  }
}
}

updateUsageDisplay();

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

function formatChatTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
// MENSAGENS ESCONDIDAS 
function toggleWelcomeUI(show) {
  const header = document.getElementById("appheader");
  const suggestions = document.getElementById("sugere");

  if (!header || !suggestions) return;

  header.style.display = show ? "block" : "none";
  suggestions.style.display = show ? "flex" : "none";
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

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "custom-toast " + type;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
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
    const currentUser = window.auth?.currentUser;
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
  if (currentChatId) {
  const user = window.auth.currentUser;
  if (!user) return;

  const chatRef = doc(window.db, "users", user.uid, "chats", currentChatId);

  await updateDoc(chatRef, {
    messages: chatHistory
  });
}
}

  } catch (error) {
    textElement.textContent = error.name === "AbortError" ? "Resposta interrompida." : error.message;
    textElement.style.color = "#d62939";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  }
};

// TÍTULO AUTOMATIC 
async function generateChatTitle(userMessage) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Cria um título curto, use a objectivo da pergunta (máximo 5 palavras),que tenha não podem ultrapassar 40 caracteres, profissional e bonito para esta conversa. Não uses aspas."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    const data = await response.json();

    const title =
      data.choices?.[0]?.message?.content?.trim() || "Nova Conversa";

    return title.substring(0, 50);

  } catch (error) {
    return "Nova Conversa";
  }
}

// ==============================
// FORM SUBMIT
// ==============================
const handleFormSubmit = async (e) => {
  e.preventDefault();
  // 🔐 VERIFICA SE ESTÁ LOGADO
  const currentUser = window.auth?.currentUser;

  if (!currentUser) {
    const loginModal = document.getElementById("loginModal");
    loginModal.style.display = "flex"; // ou classList.add("show") se usares classe
    return;
  }
  
  // LIMITE DE MENSAGENS 
  if (getRemainingMessages() <= 0) {
    alert("Limite atingido para este modelo. Escolha outro modelo.");
    return;
  }
  
  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding")) return;

  promptInput.value = "";
  document.body.classList.add("chats-active", "bot-responding");
  toggleWelcomeUI(false);

  chatHistory.push({ role: "user", content: userMessage });
  if (!currentChatId) {
  const aiTitle = await generateChatTitle(userMessage);
  saveChatToFirestore(aiTitle, chatHistory);
}
  messageCount++;
updateUsageDisplay();

const userRef = doc(window.db, "users", currentUser.uid);

const snap = await getDoc(userRef);
const data = snap.data();
const models = data.models || {};

models[currentModel] = {
  messageCount,
  resetAt
};

await updateDoc(userRef, { models });
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
const historySidebar = document.getElementById("historySidebar");
const historyOverlay = document.getElementById("historyOverlay");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideLogoutBtn = document.getElementById("sideLogoutBtn");
const newChatBtn = document.getElementById("newChatBtn");

const openMenu = () => { historySidebar.classList.add("active"); historyOverlay.classList.add("active"); };
const closeMenu = () => { historySidebar.classList.remove("active"); historyOverlay.classList.remove("active"); };

document.getElementById("newsButton")?.addEventListener("click", openMenu);
closeMenuBtn?.addEventListener("click", closeMenu);
historyOverlay?.addEventListener("click", closeMenu);

newChatBtn?.addEventListener("click", () => {

  // ⛔ Cancela resposta ativa
  controller?.abort();
  clearInterval(typingInterval);

  // 🧠 Reset estado
  currentChatId = null;
  lastAIResponse = "";
  chatsContainer.innerHTML = "";
  document.body.classList.remove("chats-active", "bot-responding");

  // 🔥 RESET TOTAL DO HISTÓRICO
  chatHistory.length = 0;

  const currentUser = window.auth?.currentUser;
  const userName = currentUser?.displayName || "Aluno";

  updateSystemPrompt(userName); // recria system prompt limpo

  toggleWelcomeUI(true);

  closeMenu();
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

// BOTÃO DE FECHAR LOGIN MODAL POPUP 
document.getElementById("closeLoginModal").addEventListener("click", () => {
  document.getElementById("loginModal").style.display = "none";
});

// VERIFICA 
async function loadUserUsage(user) {
  const userRef = doc(window.db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      plan: "free",
      models: {}
    });
  }

  const newSnap = await getDoc(userRef);
  const data = newSnap.data();

  userPlan = data.plan || "free";

  const models = data.models || {};

  if (!models[currentModel]) {
    models[currentModel] = {
      messageCount: 0,
      resetAt: Date.now() + 2 * 60 * 60 * 1000
    };

    await updateDoc(userRef, { models });
  }

  messageCount = models[currentModel].messageCount;
  resetAt = models[currentModel].resetAt;

  if (Date.now() > resetAt) {
    messageCount = 0;
    resetAt = Date.now() + 2 * 60 * 60 * 1000;

    models[currentModel] = { messageCount, resetAt };
    await updateDoc(userRef, { models });
  }

  updateUsageDisplay();
  applyModelLocks(); // 👈 importante
}

// FUNÇÃO FREE
function applyModelLocks() {
  document.querySelectorAll(".model-item").forEach(item => {
    const model = item.dataset.model;

    if (model === "v5.0" && userPlan !== "premium") {
      item.classList.add("locked");
      item.innerHTML = "Focoprime (pro) V5.0 🔒";
    }
  });
}

function getRemainingTime() {
  const diff = resetAt - Date.now();

  if (diff <= 0) return "Resetando...";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
}

setInterval(() => {
  if (resetAt > 0) {
    updateUsageDisplay();
  }
}, 60000); // atualiza a cada 1 minuto


// FUNÇÃO SALVAR CONVERSAS 
async function saveChatToFirestore(title, messages) {
  const user = window.auth.currentUser;
  if (!user) return;

  const chatId = currentChatId || crypto.randomUUID();
  currentChatId = chatId;

  const chatRef = doc(window.db, "users", user.uid, "chats", chatId);

  await setDoc(chatRef, {
    title,
    messages,
    createdAt: Date.now()
  });

  loadUserChats();
}

// RECENTE PRIMEIRO 
async function loadUserChats() {
  const user = window.auth.currentUser;
  if (!user) return;

  historyList.innerHTML = "";

  const chatsRef = collection(window.db, "users", user.uid, "chats");
  const snapshot = await getDocs(chatsRef);

  const chats = [];

  snapshot.forEach(doc => {
    chats.push({ id: doc.id, ...doc.data() });
  });

  chats.sort((a, b) => b.createdAt - a.createdAt);

  chats.forEach(async (chat) => {
  const item = document.createElement("div");
  item.className = "history-item";

  const formattedTime = formatChatTime(chat.createdAt);

  let avatar = "images/carta.png"; // padrão
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists() && userDoc.data().photoBase64) {
    avatar = userDoc.data().photoBase64; // foto do Firestore
  } else if (user.photoURL) {
    avatar = user.photoURL; // login Google
  }

  item.innerHTML = `
    <img src="${avatar}" width="28" height="28" style="border-radius:50%">
    <div class="history-content">
      <span class="history-title">${chat.title}</span>
      <span class="history-time">${formattedTime}</span>
    </div>

    <button class="delete-history">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="m7.76 14.83-2.83 2.83 1.41 1.41 2.83-2.83 2.12-2.12.71-.71.71.71 1.41 1.42 3.54 3.53 1.41-1.41-3.53-3.54-1.42-1.41-.71-.71 5.66-5.66-1.41-1.41L12 10.59 6.34 4.93 4.93 6.34 10.59 12l-.71.71z"></path>
      </svg>
    </button>
  `;

  item.querySelector(".delete-history").addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteDoc(doc(db, "users", user.uid, "chats", chat.id));
    loadUserChats();
  });

  item.addEventListener("click", () => {
    loadChat(chat);
    closeHistory();
  });

  historyList.appendChild(item);
});
}

// PWA APP PROGRESSIVE
const groupChatBtn = document.getElementById("delete-chats-btn");

groupChatBtn.addEventListener("click", () => {
  openGroupChat();
});

function openGroupChat() {
  document.getElementById("groupChatModal").classList.add("active");
}


const openUserPanelBtn = document.getElementById("openUserPanelBtn");
const userGeminiPanel = document.getElementById("userGeminiPanel");
const userGeminiOverlay = document.getElementById("userGeminiOverlay");
const closeUserGemini = document.getElementById("closeUserGemini");
const panelLogoutBtn = document.getElementById("panelLogoutBtn");

openUserPanelBtn.addEventListener("click", async () => {
  userGeminiPanel.classList.add("active");
  userGeminiOverlay.classList.add("active");

  const user = window.auth.currentUser;
  if (!user) return;

  document.getElementById("panelUserEmail").textContent = user.email;
  document.getElementById("panelUserName").textContent =
    user.displayName || "Usuário";

  // 🔥 BUSCAR FOTO DO FIRESTORE
  const userDoc = await getDoc(doc(window.db, "users", user.uid));

  let photo = "images/carta.png";

  if (userDoc.exists() && userDoc.data().photoBase64) {
    photo = userDoc.data().photoBase64;
  } else if (user.photoURL) {
    photo = user.photoURL;
  }

  document.getElementById("panelUserPhoto").src = photo;
});

function closeUserGeminiPanel() {
  userGeminiPanel.classList.remove("active");
  userGeminiOverlay.classList.remove("active");
}

closeUserGemini.addEventListener("click", closeUserGeminiPanel);
userGeminiOverlay.addEventListener("click", closeUserGeminiPanel);

panelLogoutBtn.addEventListener("click", async () => {
  await window.signOut(window.auth);
  closeUserGeminiPanel();
});


// ACTUALIZAR NOME
const editNameBtn = document.getElementById("editNameBtn");
const saveNameBtn = document.getElementById("saveNameBtn");
const panelUserName = document.getElementById("panelUserName");
const panelUserNameInput = document.getElementById("panelUserNameInput");

editNameBtn.addEventListener("click", () => {
  panelUserNameInput.value = panelUserName.textContent;

  panelUserName.style.display = "none";
  editNameBtn.style.display = "none";

  panelUserNameInput.style.display = "inline-block";
  saveNameBtn.style.display = "inline-block";

  panelUserNameInput.focus();
});

saveNameBtn.addEventListener("click", async () => {
  const newName = panelUserNameInput.value.trim();
  if (!newName) return alert("Nome vazio");

  const user = window.auth.currentUser;
  if (!user) return alert("Sem utilizador");

  try {
    await updateProfile(user, {
      displayName: newName
    });

    // 🔥 Força atualizar dados locais
    await user.reload();
    const updatedUser = window.auth.currentUser;

    // ✅ Atualiza UI imediatamente
    panelUserName.textContent = updatedUser.displayName;
    document.getElementById("sidebarUserName").textContent = updatedUser.displayName;
    document.getElementById("userChipName").textContent =
      updatedUser.displayName.split(" ")[0];

    // Atualiza heading principal
    const heading = document.querySelector(".heading");
    if (heading) {
      heading.textContent = "Olá, " + updatedUser.displayName;
    }

    // 🔥 Atualiza system prompt da IA
    if (typeof updateSystemPrompt === "function") {
      updateSystemPrompt(updatedUser.displayName);
    }

    // 🔄 Voltar modo normal
    panelUserName.style.display = "inline-block";
    editNameBtn.style.display = "inline-block";
    panelUserNameInput.style.display = "none";
    saveNameBtn.style.display = "none";

    showToast("Nome atualizado com sucesso!", "success");

  } catch (error) {
    console.error(error);
    showToast("Erro ao atualizar nome", "error");
  }
});

// IMAGEM CHANGE
const panelUserPhoto = document.getElementById("panelUserPhoto");
const photoOptions = document.getElementById("photoOptions");
const viewPhotoOption = document.getElementById("viewPhotoOption");
const uploadPhotoOption = document.getElementById("uploadPhotoOption");
const panelPhotoInput = document.getElementById("panelPhotoInput");
const panelAvatarError = document.getElementById("panelAvatarError");

// 🔥 Mostrar menu ao clicar na foto
panelUserPhoto.addEventListener("click", () => {
  photoOptions.classList.toggle("show");
});

// 👁️ Ver imagem
viewPhotoOption.addEventListener("click", () => {
  const src = panelUserPhoto.src;
  const win = window.open();
  win.document.write(`<img src="${src}" style="width:100%">`);
});

// 📤 Upload imagem
uploadPhotoOption.addEventListener("click", () => {
  panelPhotoInput.click();
});

// 🔥 Validar e converter
panelPhotoInput.addEventListener("change", async () => {
  const file = panelPhotoInput.files[0];
  if (!file) return;

  const maxSize = 1 * 1024 * 1024;

  if (file.size > maxSize) {
    panelAvatarError.classList.add("show");
    panelPhotoInput.value = "";
    return;
  }

  panelAvatarError.classList.remove("show");

  // 🔥 ATIVA LOADER
  avatarLoading.classList.add("active");

  const reader = new FileReader();

  reader.onload = async (e) => {
    const base64 = e.target.result;
    const user = window.auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(window.db, "users", user.uid), {
        photoBase64: base64
      });

      // Atualiza UI
      panelUserPhoto.src = base64;
      document.getElementById("sidebarUserPhoto").src = base64;
      document.getElementById("userPhoto").src = base64;

      currentUserPhoto = base64;

      showToast("Foto atualizada com sucesso!", "success");

    } catch (error) {
      showToast("Erro ao salvar imagem", "error");
    } finally {
      // 🔥 DESATIVA LOADER
      avatarLoading.classList.remove("active");
    }
  };

  reader.readAsDataURL(file);
});
