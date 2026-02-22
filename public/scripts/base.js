/* ===============================
   🔥 FIREBASE CONFIG
================================= */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

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
  projectId: "focoprime-ai"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
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
    userChipName.textContent =
      user.displayName?.split(" ")[0] || "Usuário";

    userPhoto.src =
      user.photoURL || "images/carta.png";

  } catch (error) {
    alert("Erro Google: " + error.message);
  }
});

/* ===============================
   📧 LOGIN COM EMAIL
================================= */
emailLoginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );
  } catch (error) {
    alert("Erro: " + error.message);
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
if (photoData) {
  localStorage.setItem("userPhoto_" + user.uid, photoData);
}

    // 🔥 FORÇA ATUALIZAÇÃO DO USER
    await user.reload();
    const updatedUser = auth.currentUser;

    heading.textContent = "Olá, " + updatedUser.displayName;
    userChipName.textContent =
      updatedUser.displayName.split(" ")[0];

    userPhoto.src =
  photoData || "images/carta.png";

    alert("Conta criada com sucesso!");

  } catch (error) {
    alert("Erro: " + error.message);
  }
  
  localStorage.setItem("user_name", registerName.value);
  updateSystemPrompt(registerName.value);
});

/* ===============================
   👤 CONTROLE DE SESSÃO
================================= */
onAuthStateChanged(auth, (user) => {
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

    const savedPhoto = localStorage.getItem("userPhoto_" + user.uid);

    if (savedPhoto) {
      userPhoto.src = savedPhoto;
    } else if (user.photoURL) {
      userPhoto.src = user.photoURL;
    } else {
      userPhoto.src = "images/carta.png";
    }

  } else {
    // usuário não logado → mostra botão entrar
    logoutBtn.style.display = "none";
    loginBtn.style.display = "flex";
  }
  // hwhjwjwnshshshe
  if (user && typeof loadUserUsage === "function") {
  loadUserUsage(user);
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
menuOverlay?.addEventListener("click", closeMenu);
