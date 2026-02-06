let typingInterval = null;
let isTyping = false;

const generateBtn = document.getElementById("generateTextBtn");
const generatedText = document.getElementById("generatedText");
const copyBtn = document.getElementById("copyTextBtn");

const btnText = generateBtn.querySelector(".btn-text");

// Nome do aluno
const userName = localStorage.getItem("user_name") || "Aluno";

generateBtn.addEventListener("click", async () => {

  // 🔴 SE ESTÁ A DIGITAR → PARAR
  if (isTyping) {
    clearInterval(typingInterval);
    resetButton();
    return;
  }

  const type = document.getElementById("textType").value;
  const theme = document.getElementById("textTheme").value.trim();
  const level = document.getElementById("textLevel").value;
  const length = document.getElementById("textLength").value;

  if (!theme) {
    alert("Por favor, insira um tema para o texto.");
    return;
  }

  generatedText.innerHTML = "A gerar texto...";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `
Tu és FocoPrime IA, um assistente escolar de Moçambique.
Cria um texto para o aluno:
- Tipo de texto: ${type}
- Tema: ${theme}
- Nível: ${level}
- Tamanho: ${length}
- Em português claro, amigável e educativo.
`
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Erro ao gerar texto.";
    const html = marked.parse(text);

    startButtonAsStop();
    typeWriter(generatedText, html, 25);

  } catch (err) {
    generatedText.textContent = "Erro na conexão com a IA.";
    resetButton();
    console.error(err);
  }
});

// 📋 COPIAR TEXTO
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(generatedText.textContent);
  alert("Texto copiado!");
});

// ✍️ EFEITO DE DIGITAÇÃO
function typeWriter(element, html, speed) {
  element.innerHTML = "";
  const words = html.split(" ");
  let index = 0;
  isTyping = true;

  typingInterval = setInterval(() => {
    if (index < words.length) {
      element.innerHTML += words[index] + " ";
      index++;
    } else {
      clearInterval(typingInterval);
      resetButton();
    }
  }, speed);
}

// 🔴 BOTÃO → PARAR
function startButtonAsStop() {
  isTyping = true;
  generateBtn.classList.add("stop");
  btnText.textContent = "Parar";
}

// 🟢 BOTÃO → GERAR
function resetButton() {
  isTyping = false;
  generateBtn.classList.remove("stop");
  btnText.textContent = "Gerar Texto";
}

// ===== HERDAR TEMA =====
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
