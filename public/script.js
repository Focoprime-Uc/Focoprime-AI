<!DOCTYPE html>
<!-- Coding By focoprime - www.focoprime.me -->
<html lang="pt">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Focoprime AI</title>
  <!-- Favicon -->
  <link rel="icon" href="images/groq.png" type="image/png">
<link rel="apple-touch-icon" href="images/groq.png">
  <!-- SEO + IA -->
  <meta name="description" content="FocoPrime IA é um assistente escolar inteligente criado em Moçambique para ajudar alunos com estudos, exames e aprendizagem personalizada.">
  <!-- Open Graph -->
  <meta property="og:type" content="website">
<meta property="og:title" content="FocoPrime IA – Assistente Escolar Inteligente">
<meta property="og:description" content="Assistente escolar criado em Moçambique para ajudar alunos com estudos, exames e aprendizagem personalizada.">
<meta property="og:image" content="https://ai-focoprime.online/images/Preview.png">
<meta property="og:url" content="https://ai-focoprime.online">
<meta property="og:site_name" content="FocoPrime IA">
  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="FocoPrime IA – Assistente Escolar Inteligente">
<meta name="twitter:description" content="Aprenda melhor com a FocoPrime IA, um assistente educacional inteligente feito para estudantes.">
<meta name="twitter:image" content="https://ai-focoprime.online/images/Preview.png">
  <!-- Anúncios do Mondiad -->
  <script async src="https://ss.mrmnd.com/ctatic/6e30348f-197b-4bac-986f-eaf7ec7bd707.js"></script>
  <!-- Linking Google Fonts For Icons -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@32,400,0,0" />
  <link rel="stylesheet" href="style.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" integrity="sha512-2SwdPD6INVrV/lHTZbO2nodKhrnDdJK9/kg2XD1r9uGqPo1cUbujc+IYdlYdEErWNu69gVcYgdxlmVmzTWnetw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
  <!--- Link do remixicon -->
  <link href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css" rel="stylesheet">
</head>

<body>
  <!--- ANÚNCIO MONDIAD DESLIZANTE --->
  <script async src="https://ss.mrmnd.com/dynamic.js" data-mnddynid="4e1a8244-e91d-490c-89ee-864b24999cfd"></script>
  
  <!--- ANÚNCIO POPUP -->
  <script async src="https://ss.mrmnd.com/interstitial.js" data-mndintid="81841b49-b361-42f5-9146-f0cb86f5adf1"></script>
  
  <!--- ANÚNCIO IN PAGE -->
  <script async src="https://ss.mrmnd.com/static/ef83077b-257a-4c01-90a3-48d11e0ac6b7.js"></script>
  
    <header>
        <div class="cabeca">
            <div class="logo">
                <img src="images/Logo.png" alt="Logo">
            </div>
            
            <!--- Icones sociais -->
            <button id="logoutBtn" class="logout-btn">
  <span class="material-symbols-rounded">
    <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="M9.71 17.29 5.41 13H15v-2H5.41l4.3-4.29-1.42-1.42L1.59 12l6.7 6.71z"></path><path d="M13 19v2c4.96 0 9-4.04 9-9s-4.04-9-9-9v2c3.86 0 7 3.14 7 7s-3.14 7-7 7"></path>
</svg>
  </span>
  <span class="logout-text">Sair</span>
</button>
        </div>
    </header>
  <div class="container">
    
    <!-- ===== SIDEBAR MENU DIREITA ===== -->
<div id="sideMenu" class="side-menu">
  <div class="side-menu-header">
    <img src="images/Logo-header.png">
    <button id="closeMenuBtn" class="material-symbols-rounded">close</button>
  </div>

  <ul class="side-menu-list">
    <li class="side-item" id="newChatBtn">
      <span class="material-symbols-rounded"><i class="ri-chat-smile-ai-fill"></i></span>
      <span>Nova mensagem</span>
    </li>

    <li class="side-item">
      <span class="material-symbols-rounded">
        <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="M21.21 8.11c-.25-.59-.56-1.16-.92-1.7-.36-.53-.77-1.03-1.22-1.48s-.95-.86-1.48-1.22c-.54-.36-1.11-.67-1.7-.92-.6-.26-1.24-.45-1.88-.58-1.31-.27-2.72-.27-4.03 0-.64.13-1.27.33-1.88.58-.59.25-1.16.56-1.7.92-.53.36-1.03.77-1.48 1.22-.17.17-.32.35-.48.52L1.99 3v6h6L5.86 6.87c.15-.18.31-.36.48-.52.36-.36.76-.69 1.18-.98.43-.29.89-.54 1.36-.74.48-.2.99-.36 1.5-.47 1.05-.21 2.18-.21 3.23 0 .51.11 1.02.26 1.5.47.47.2.93.45 1.36.74.42.29.82.62 1.18.98s.69.76.98 1.18c.29.43.54.89.74 1.36.2.48.36.99.47 1.5.11.53.16 1.07.16 1.61a7.85 7.85 0 0 1-.63 3.11c-.2.47-.45.93-.74 1.36-.29.42-.62.82-.98 1.18s-.76.69-1.18.98c-.43.29-.89.54-1.36.74-.48.2-.99.36-1.5.47-1.05.21-2.18.21-3.23 0a8 8 0 0 1-1.5-.47c-.47-.2-.93-.45-1.36-.74-.42-.29-.82-.62-1.18-.98s-.69-.76-.98-1.18c-.29-.43-.54-.89-.74-1.36-.2-.48-.36-.99-.47-1.5A8 8 0 0 1 3.99 12h-2c0 .68.07 1.35.2 2.01.13.64.33 1.27.58 1.88.25.59.56 1.16.92 1.7.36.53.77 1.03 1.22 1.48s.95.86 1.48 1.22c.54.36 1.11.67 1.7.92.6.26 1.24.45 1.88.58.66.13 1.33.2 2.01.2s1.36-.07 2.01-.2c.64-.13 1.27-.33 1.88-.58.59-.25 1.16-.56 1.7-.92.53-.36 1.03-.77 1.48-1.22s.86-.95 1.22-1.48c.36-.54.67-1.11.92-1.7.26-.6.45-1.24.58-1.88.13-.66.2-1.34.2-2.01s-.07-1.35-.2-2.01c-.13-.64-.33-1.27-.58-1.88Z"/><path d="M11 7v6h6v-2h-4V7z"/>
</svg>
      </span>
      <span>Histórico</span>
    </li>

    <li class="side-item" onclick="location.href='textes/textes.html'">
      <span class="material-symbols-rounded">
        <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="m21.09,7.33c1.22-1.22,1.22-3.2,0-4.41-1.22-1.22-3.2-1.22-4.41,0L7.8,11.78c-.71.06-1.41.27-2.01.64-1.17.72-1.81,1.89-1.81,3.29,0,.3.02.59.04.86.08,1.03.11,1.42-1.47,2.21-.32.16-.53.47-.55.82-.02.35.14.69.43.89,1,.69,2.76,1.49,4.62,1.49,1.35,0,2.74-.42,3.92-1.6,1.12-1.12,1.71-2.85,1.55-4.49l8.56-8.56Zm-3-3c.44-.44,1.15-.44,1.59,0s.44,1.15,0,1.58l-7.86,7.86c-.4-.63-.96-1.15-1.65-1.52l7.92-7.92Zm-8.53,14.64c-1.44,1.44-3.31,1.1-4.58.61,1.09-.98,1.13-1.99,1.04-3.16-.02-.22-.04-.46-.04-.71,0-.7.29-1.23.86-1.59.68-.42,1.66-.49,2.31-.16.65.32.99.81,1.18,1.28l-.05.05.1.1c.05.16.09.32.12.47.18,1.09-.22,2.37-.96,3.11Z"/><path d="m2.32,6.49l2.21.98.98,2.21c.09.19.28.32.49.32s.4-.12.49-.32l.98-2.21,2.21-.98c.19-.09.32-.28.32-.49s-.12-.4-.32-.49l-2.21-.98-.98-2.21c-.08-.19-.27-.32-.48-.32-.21-.02-.4.12-.49.31l-.99,2.14-2.23,1.07c-.19.09-.3.28-.3.49s.13.39.32.48Z"/><path d="m21.76,18.63l-1.66-.74-.74-1.66c-.06-.14-.21-.24-.36-.24-.16-.01-.3.09-.37.23l-.74,1.6-1.67.8c-.14.07-.23.21-.23.37,0,.16.1.3.24.36l1.66.74.74,1.66c.06.14.21.24.37.24s.3-.09.37-.24l.74-1.66,1.66-.74c.14-.06.24-.21.24-.37s-.09-.3-.24-.37Z"/>
</svg>
      </span>
      <span>Textes Inteligentes</span>
    </li>

    <li class="side-item">
      <span class="material-symbols-rounded">settings</span>
      <span>Definições</span>
    </li>
  </ul>

  <!-- BOTÃO SAIR -->
  <button id="sideLogoutBtn" class="logout-btn side-logout" class="side-menu-footer">
    <span class="material-symbols-rounded">logout</span>
    <span>Sair</span>
  </button>
</div>

<!-- Overlay -->
<div id="menuOverlay" class="menu-overlay"></div>
    <!-- App Header -->
    <header class="app-header">
      <h1 class="heading">Hello, Aluno</h1>
      <h4 class="sub-heading">Como posso ajudar-te hoje? amigo/a</h4>
    </header>
    
    <!-- LOGIN MODAL -->
<div id="loginModal" class="login-modal">
  <div class="login-box">
    <img src="images/Logo.png" class="login-logo" />
    <h2>Bem-vindo à FocoPrime IA escolar 2026</h2>
    <p>Digite o seu nome para continuar</p>

    <input
      type="text"
      id="loginName"
      placeholder="Ex: João, Maria..."
    />

    <button id="loginBtn">Entrar</button>
  </div>
</div>
    
    <!-- Suggestions List -->
    <ul class="suggestions">
      <li class="suggestions-item">
        <p class="text">Podes ajudar me com as minhas aulas escolares?.</p>
        <span class="icon material-symbols-rounded">draw</span>
      </li>
      <li class="suggestions-item">
        <p class="text">Como posso aumentar o meu desempenho escolar?</p>
        <span class="icon material-symbols-rounded">lightbulb</span>
      </li>
      <li class="suggestions-item">
        <p class="text">Peço sugestões de exames escolares para praticar?.</p>
        <span class="icon material-symbols-rounded">explore</span>
      </li>
      <li class="suggestions-item">
        <p class="text">Crie uma lista das disciplinas mais essenciais no meu país.</p>
        <span class="icon material-symbols-rounded">code_blocks</span>
      </li>
    </ul>
    
    <!-- Chats -->
    <div class="chats-container"></div>
    
    <!-- Prompt Input -->
    <div class="prompt-container">
      <div class="prompt-wrapper">
        <form action="#" class="prompt-form">
          <input type="text" placeholder="Perguntar á focoprime" class="prompt-input" required />
          <div class="prompt-actions">
            <!-- File Upload Wrapper -->
            <div class="file-upload-wrapper">
              <img src="#" class="file-preview" />
              <input id="file-input" type="file" accept="image/*, .pdf, .txt, .csv" hidden />
              <button type="button" class="file-icon material-symbols-rounded">description</button>
              <button id="cancel-file-btn" type="button" class="material-symbols-rounded">close</button>
              <button id="add-file-btn" type="button" class="material-symbols-rounded">
                <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="m5 17.41 3-3 1.29 1.29c.39.39 1.02.39 1.41 0l5.29-5.29 3 3V14h2V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H5zM19 5v5.59L16.71 8.3a.996.996 0 0 0-1.41 0l-5.29 5.29-1.29-1.29a.996.996 0 0 0-1.41 0l-2.29 2.29V5h14Z"></path><path d="M8.5 7a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3m13.22 11.07-1.94-.86-.86-1.94a.46.46 0 0 0-.42-.28c-.19-.02-.35.1-.43.27l-.86 1.87-1.95.94c-.16.08-.27.25-.26.43 0 .18.11.35.28.42l1.94.86.86 1.94a.471.471 0 0 0 .86 0l.86-1.94 1.94-.86a.471.471 0 0 0 0-.86Z"></path>
</svg>
              </button>
            </div>
            
            <!-- Send Prompt and Stop Response Buttons -->
            <button id="stop-response-btn" type="button" class="material-symbols-rounded">stop_circle</button>
            <button id="send-prompt-btn" class="material-symbols-rounded">arrow_upward</button>
          </div>
        </form>
        
        <!-- Theme and Delete Chats Buttons -->
        <button id="theme-toggle-btn" class="material-symbols-rounded">light_mode</button>
        <button id="delete-chats-btn" class="material-symbols-rounded menu-icon">
          <svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="M4 11h5c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2m0-7h5v5H4zm11 9c-1.1 0-2 .9-2 2v5c0 1.1.9 2 2 2h5c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2zm0 7v-5h5v5zM4 20h3v2l4-3-4-3v2H4v-5H2v5c0 1.1.9 2 2 2M22 6c0-1.1-.9-2-2-2h-3V2l-4 3 4 3V6h3v5h2z"></path>
</svg>
        </button>
      </div>
      
      <p class="disclaimer-text">Focoprime@2026 criada por <strong>Iriano Gonçalves.</strong></p>
    </div>
  </div>
  
  <script src="script.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</body>

  </html>
