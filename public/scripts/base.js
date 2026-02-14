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
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKwBNz6CkVP_FpUP9hxMsjj8J8NNbMk3M",
  authDomain: "focoprime-ai.firebaseapp.com",
  projectId: "focoprime-ai"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

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

/* ===============================
   🔐 GOOGLE LOGIN
================================= */
googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
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
      updatedUser.photoURL || "images/user-placeholder.png";

    alert("Conta criada com sucesso!");

  } catch (error) {
    alert("Erro: " + error.message);
  }
});

/* ===============================
   👤 CONTROLE DE SESSÃO
================================= */
onAuthStateChanged(auth, (user) => {
  if (user) {

    loginModal.style.display = "none";

    heading.textContent = "Olá, " + (user.displayName || "Aluno");

    userEmail.value = user.email;
    userName.value = user.displayName || "";

    userChipName.textContent =
      user.displayName?.split(" ")[0] || "Usuário";

    // 🔥 FOTO LOCAL
    const savedPhoto = localStorage.getItem("userPhoto_" + user.uid);

    if (savedPhoto) {
      userPhoto.src = savedPhoto;
    } else {
      userPhoto.src = "images/user-placeholder.png";
    }

  } else {
    loginModal.style.display = "flex";
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