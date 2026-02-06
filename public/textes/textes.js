let typingInterval = null;
const stopTypingBtn = document.getElementById("stopTypingBtn");
const generateBtn = document.getElementById("generateTextBtn");
const generatedText = document.getElementById("generatedText");
const copyBtn = document.getElementById("copyTextBtn");

// Pega o nome salvo ou usa "Aluno" como padrão
const userName = localStorage.getItem("user_name") || "Aluno";

generateBtn.addEventListener("click", async () => {
  const type = document.getElementById("textType").value;
  const theme = document.getElementById("textTheme").value.trim();
  const level = document.getElementById("textLevel").value;
  const length = document.getElementById("textLength").value;

  if (!theme) {
    alert("Por favor, insira um tema para o texto.");
    return;
  }

  generatedText.textContent = "A gerar texto...";

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
typeWriter(generatedText, html, 20);

  } catch (err) {
    generatedText.textContent = "Erro na conexão com a IA.";
    console.error(err);
  }
});

// Copiar texto
copyBtn.addEventListener("click", () => {
  const text = generatedText.textContent;
  navigator.clipboard.writeText(text);
  alert("Texto copiado para a área de transferência!");
});

// ===== HERDAR TEMA =====
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);

function typeWriter(element, html, speed = 35) {
  element.innerHTML = "";
  stopTypingBtn.style.display = "flex";

  const words = html.split(" ");
  let index = 0;

  typingInterval = setInterval(() => {
    if (index < words.length) {
      element.innerHTML += words[index] + " ";
      index++;
    } else {
      clearInterval(typingInterval);
      stopTypingBtn.style.display = "none";
    }
  }, speed);
}

// BOTÃO PARAR GERAÇÃO //
stopTypingBtn.addEventListener("click", () => {
  clearInterval(typingInterval);
  stopTypingBtn.style.display = "none";
});
