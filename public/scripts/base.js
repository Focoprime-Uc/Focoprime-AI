/* ===============================
   🔥 FIREBASE CONFIG
================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getDatabase, ref, push, onValue } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyAKwBNz6CkVP_FpUP9hxMsjj8J8NNbMk3M",
  authDomain: "focoprime-ai.firebaseapp.com",
  projectId: "focoprime-ai",
  databaseURL: "https://focoprime-ai-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const realtimeDB = getDatabase();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
let currentUserData = null;
let currentUserPhoto = "images/carta.png";
window.db = db;

/* ===============================
   📌 ELEMENTOS DOM
================================= */
const loginModal = document.getElementById("loginModal");
const googleBtn = document.getElementById("googleLoginBtn");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const emailLoginBtn = document.getElementById("emailLoginBtn");
const emailRegisterBtn = document.getElementById("emailRegisterBtn");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const photoInput = document.getElementById("photoInput");
const avatarError = document.getElementById("avatarError");
const previewPhoto = document.getElementById("previewPhoto");

// Abrir seletor ao clicar no botão
document.getElementById("changePhotoBtn").addEventListener("click", () => {
  photoInput.click();
});

// Validar tamanho
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  const avatarUpload = document.querySelector(".avatar-upload");

  if (!file) return;

  const maxSize = 1 * 1024 * 1024; // 1MB

  if (file.size > maxSize) {
    avatarError.classList.add("show");
    avatarUpload.classList.add("error");

    photoInput.value = "";
    previewPhoto.src = "images/user-placeholder.png";
    return;
  }

  // Remove erro se estiver tudo certo
  avatarError.classList.remove("show");
  avatarUpload.classList.remove("error");

  const reader = new FileReader();
  reader.onload = (e) => {
    previewPhoto.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

const logoutBtn = document.getElementById("logoutBtn");
const logoutReal = document.getElementById("logoutReal");

const userPanel = document.getElementById("userPanel");
const overlay = document.getElementById("userPanelOverlay");
const closePanel = document.getElementById("closeUserPanel");

const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const saveUserName = document.getElementById("saveUserName");

const heading = document.querySelector(".heading");
const userPhoto = document.getElementById("userPhoto");
const userChipName = document.getElementById("userChipName");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

const loginErrorBar = document.getElementById("loginErrorBar");
const loginErrorText = document.getElementById("loginErrorText");

function showLoginError(message) {
  loginErrorText.textContent = message;
  loginErrorBar.classList.add("show");

  setTimeout(() => {
    loginErrorBar.classList.remove("show");
  }, 4000);
}

// BARRA DE SUCESSO 
function showLoginSuccess(message) {
  const successBar = document.getElementById("loginSuccessBar");
  const successText = document.getElementById("loginSuccessText");

  successText.textContent = message || "Login efetuado com sucesso!";

  // mostrar a barra primeiro
  successBar.classList.add("show");

  // deixar o modal visível pelo menos 1,5s
  setTimeout(() => {
    // esconde o modal
    loginModal.style.display = "none";

    // depois de fechar o modal, anima a barra sumindo
    setTimeout(() => {
      successBar.classList.remove("show");
    }, 300); // tempo da transição do CSS
  }, 1500);
}

function showToast(message, type = "success") {
  toastMessage.textContent = message;

  toast.classList.remove("success", "error");
  toast.classList.add(type);
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

/* ===============================
   🔐 GOOGLE LOGIN
================================= */
googleBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Atualiza instantaneamente
    userChipName.textContent = user.displayName?.split(" ")[0] || "Usuário";
    userPhoto.src = user.photoURL || "images/carta.png";

    // ✅ Mostrar barra de sucesso
    showLoginSuccess("Login efetuado com sucesso!");

  } catch (error) {
    showLoginError("Erro ao iniciar sessão com Google.");
  }
});

/* ===============================
   📧 LOGIN COM EMAIL
================================= */
emailLoginBtn.addEventListener("click", async () => {

  if (!emailInput.value) {
    showLoginError("Por favor, insira o seu email.");
    return;
  }

  if (!passwordInput.value) {
    showLoginError("Por favor, insira a sua senha.");
    return;
  }

  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );

    showLoginSuccess("Login efetuado com sucesso!");

  } catch (error) {

    if (error.code === "auth/invalid-email") {
      showLoginError("Email inválido.");
    }

    else if (error.code === "auth/invalid-credential") {
      showLoginError("Email ou senha incorretos.");
    }

    else if (error.code === "auth/too-many-requests") {
      showLoginError("Muitas tentativas. Tente mais tarde.");
    }

    else {
      showLoginError("Erro ao iniciar sessão. Tente novamente.");
    }
  }
});

/* ===============================
   🔑 RESET PASSWORD
================================= */
forgotPasswordBtn.addEventListener("click", async () => {

  if (!emailInput.value) {
    showToast("Digite seu email primeiro.", "error");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailInput.value);
    showToast("Email de redefinição enviado com sucesso!", "success");
  } catch (error) {
    showToast("Erro ao enviar email.", "error");
  }
});

/* ===============================
   📝 REGISTO
================================= */
emailRegisterBtn.addEventListener("click", async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      registerEmail.value,
      registerPassword.value
    );

    const user = userCredential.user;

    let photoData = null;

    if (photoInput.files[0]) {
      const reader = new FileReader();
      photoData = await new Promise((resolve) => {
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(photoInput.files[0]);
      });
    }

    await updateProfile(user, {
  displayName: registerName.value
});

// Salvar foto localmente
let photoBase64 = null;

if (photoInput.files[0]) {
  const reader = new FileReader();

  photoBase64 = await new Promise((resolve) => {
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(photoInput.files[0]);
  });
}

// 🔥 Salvar no Firestore
await setDoc(doc(db, "users", user.uid), {
  name: registerName.value,
  email: registerEmail.value,
  photoBase64: photoBase64 || null,
  createdAt: Date.now()
});

    // 🔥 FORÇA ATUALIZAÇÃO DO USER
    await user.reload();
    const updatedUser = auth.currentUser;

    heading.textContent = "Olá, " + updatedUser.displayName;
    userChipName.textContent =
      updatedUser.displayName.split(" ")[0];

    userPhoto.src = photoBase64 || "images/carta.png";

    // ✅ Mostrar barra de sucesso
  showLoginSuccess("Conta criada com sucesso!");

} catch (error) {
  showLoginError("Erro ao criar conta: " + error.message);
}
  
  localStorage.setItem("user_name", registerName.value);
  updateSystemPrompt(registerName.value);
});

/* ===============================
   👤 CONTROLE DE SESSÃO
================================= */
onAuthStateChanged(auth, async (user) => {
  const loginBtn = document.getElementById("loginBtn");

  if (user) {
    // usuário logado → mostra o botão normal
    loginModal.style.display = "none";
    logoutBtn.style.display = "flex";
    loginBtn.style.display = "none";

    heading.textContent = "Olá, " + (user.displayName || "Aluno");
    
    if (typeof loadUserChats === "function") {
      loadUserChats();
    }
    
    // Actualizar Sytem prompt da IA
    if (typeof updateSystemPrompt === "function") {
      updateSystemPrompt(user.displayName || "Aluno");
    }

    userEmail.value = user.email;
    userName.value = user.displayName || "";
    userChipName.textContent = user.displayName?.split(" ")[0] || "Usuário";

    const userDoc = await getDoc(doc(db, "users", user.uid));

if (userDoc.exists()) {
  currentUserData = userDoc.data();
} else {
  currentUserData = null;
}

// 🔥 PRIORIDADE PROFISSIONAL
currentUserPhoto =
  currentUserData?.photoBase64 ||
  user.photoURL ||
  "images/carta.png";

// Atualiza UI principal
userPhoto.src = currentUserPhoto;

  } else {
    // usuário não logado → mostra botão entrar
    logoutBtn.style.display = "none";
    loginBtn.style.display = "flex";
  }
  // hwhjwjwnshshshe
  if (user && typeof loadUserUsage === "function") {
  loadUserUsage(user);
}

const sidebarPhoto = document.getElementById("sidebarUserPhoto");
const sidebarName = document.getElementById("sidebarUserName");

if (user) {
  sidebarPhoto.src = currentUserPhoto;
  sidebarName.textContent = user.displayName || "Usuário";
}

});

/* ===============================
   🧠 ATUALIZAR NOME
================================= */
saveUserName.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateProfile(user, {
      displayName: userName.value
    });

    heading.textContent = "Olá, " + userName.value;
    userChipName.textContent = userName.value.split(" ")[0];

    alert("Nome atualizado com sucesso!");
  } catch (error) {
    alert("Erro: " + error.message);
  }
});

/* ===============================
   🚪 LOGOUT
================================= */
logoutReal.addEventListener("click", async () => {
  await signOut(auth);
  closeUserPanel();
});

/* ===============================
   📂 ABRIR / FECHAR PAINEL
================================= */
logoutBtn.addEventListener("click", () => {
  userPanel.classList.add("open");
  overlay.classList.add("show");
});

function closeUserPanel() {
  userPanel.classList.remove("open");
  overlay.classList.remove("show");
}

closePanel.addEventListener("click", closeUserPanel);
overlay.addEventListener("click", closeUserPanel);

// ehrhejejeenehne
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
  loginModal.style.display = "flex";
});

// 🔥 Tornar auth global
window.auth = auth;
window.signOut = signOut;

window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;
window.updateDoc = updateDoc;

window.collection = collection;
window.getDocs = getDocs;
window.deleteDoc = deleteDoc;
window.addDoc = addDoc;

async function loadChat(chat) {
  const user = window.auth.currentUser;
  if (!user) return;

  chatsContainer.innerHTML = "";
  chatHistory.length = 0;
  currentChatId = chat.id;
  if (typeof toggleWelcomeUI === "function") {
  toggleWelcomeUI(false);
}

  const chatRef = doc(window.db, "users", user.uid, "chats", chat.id);
  const snap = await getDoc(chatRef);

  if (!snap.exists()) return;

  const data = snap.data();
  const messages = data.messages || [];

  messages
    .filter(msg => msg.role !== "system") // 🔥 NÃO MOSTRAR SYSTEM
    .forEach(msg => {

      chatHistory.push(msg);

      const time = getCurrentTime();

      if (msg.role === "user") {

        const userMsgDiv = createMessageElement(
          `<span class="message-time">${time}</span>
           <p class="message-text">${escapeHTML(msg.content)}</p>`,
          "user-message"
        );

        chatsContainer.appendChild(userMsgDiv);

      } else {

        const botMsgDiv = createMessageElement(`
          <img class="avatar" src="images/groq.png" />
          <div class="bot-content">
            <span class="message-time">${time}</span>
            <p class="message-text">${marked.parse(msg.content)}</p>
            <div class="message-actions">
              <button class="action-btn copy"><i class="fa-regular fa-copy"></i></button>
              <button class="action-btn like"><i class="fa-regular fa-thumbs-up"></i></button>
              <button class="action-btn dislike"><i class="fa-regular fa-thumbs-down"></i></button>
              <button class="action-btn share"><i class="fa-solid fa-share-nodes"></i></button>
              <button class="action-btn pdf"><i class="fa-solid fa-file-pdf"></i></button>
            </div>
          </div>
        `, "bot-message");

        chatsContainer.appendChild(botMsgDiv);
      }

    });

  scrollToBottom();
}
window.loadChat = loadChat;

document.getElementById("newsButton")?.addEventListener("click", openMenu);
closeMenuBtn?.addEventListener("click", closeMenu);
historyOverlay?.addEventListener("click", closeMenu);


window.statusText = statusText;

const groupMessages = document.getElementById("groupMessages");
const groupInput = document.getElementById("groupMessageInput");
const sendBtn = document.getElementById("sendGroupMessage");
const replyPreview = document.getElementById("replyPreview");
const replyTextEl = document.getElementById("replyText");
const cancelReplyBtn = document.getElementById("cancelReply");

let replyingTo = null;

// Enviar mensagem
sendBtn.addEventListener("click", () => {
  const user = auth.currentUser;
  if (!user) return alert("Precisa estar logado");

  const text = groupInput.value.trim();
  if (!text) return;

  push(ref(realtimeDB, "groupChat"), {
    name: user.displayName,
    email: user.email,
    photo: currentUserPhoto,
    text: text,
    timestamp: Date.now(),
    replyTo: replyingTo || null
  });

  groupInput.value = "";
  replyingTo = null;
  replyPreview.style.display = "none";
  replyTextEl.textContent = "";
});

// Cancelar resposta
cancelReplyBtn.addEventListener("click", () => {
  replyingTo = null;
  replyPreview.style.display = "none";
  replyTextEl.textContent = "";
});

// Atualizar lista de mensagens
onValue(ref(realtimeDB, "groupChat"), (snapshot) => {
  groupMessages.innerHTML = "";

  snapshot.forEach(child => {
    const data = child.val();
    const div = document.createElement("div");
    div.classList.add("group-message");

    const user = auth.currentUser;
    const isMyMessage = user && data.email === user.email;
    div.classList.add(isMyMessage ? "my-message" : "other-message");

    const showAvatar = !isMyMessage;

    div.innerHTML = `
      ${showAvatar ? `<img src="${data.photo}">` : ''}
      <div class="message-content">
        <span class="user-name">${data.name}</span>
        <span class="user-email">${data.email || 'sem email'}</span>
        <span class="message-time">${formatTimestamp(data.timestamp)}</span>
        ${data.replyTo ? `
  <div class="replied-message">
    <strong>${data.replyTo.name}</strong>
    <small>${data.replyTo.text}</small>
  </div>
` : ''}
        <p class="message-text">${data.text}</p>
        ${!isMyMessage ? `<button class="reply-btn">Responder</button>` : ''}
      </div>
    `;

    groupMessages.appendChild(div);
  });

  groupMessages.scrollTop = groupMessages.scrollHeight;

  // Botões de responder
  groupMessages.querySelectorAll(".reply-btn").forEach(btn => {
  btn.onclick = (e) => {
    const content = e.target.closest(".message-content");
    const msgText = content.querySelector(".message-text").textContent;
    const msgName = content.querySelector(".user-name").textContent;
    const msgEmail = content.querySelector(".user-email").textContent;

    replyingTo = {
      name: msgName,
      email: msgEmail,
      text: msgText
    };

    replyTextEl.innerHTML = `
      <strong>${msgName}</strong>
      <small>${msgText}</small>
    `;

    replyPreview.style.display = "flex";
    groupInput.focus();
  };
});
});

document.getElementById("closeGroupChat")
.addEventListener("click", () => {
  document.getElementById("groupChatModal")
  .classList.remove("active");
});


function formatTimestamp(ts) {
  const date = new Date(ts);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Janeiro = 0
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
     }
