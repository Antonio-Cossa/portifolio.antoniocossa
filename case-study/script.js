/* =================================================================
   CASE STUDY — script.js
   JavaScript puro (ES6), sem bibliotecas.

   Funcionalidades:
   1. Reveal ao rolar a página (Intersection Observer)
   2. Lightbox da galeria (abrir / fechar por clique fora e ESC)
   3. Ano automático no rodapé
   4. Fallback de lazy loading para navegadores antigos

   Observação: o scroll suave é feito por CSS (scroll-behavior: smooth)
   e o lazy loading das imagens usa o atributo nativo loading="lazy".
   ================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Helpers reutilizáveis
     --------------------------------------------------------------- */
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  /* ===============================================================
     1. REVEAL AO ROLAR — Intersection Observer
     Adiciona a classe .is-visible aos elementos .reveal quando
     entram na viewport. Cada elemento é observado uma única vez.
     =============================================================== */
  function initScrollReveal() {
    const targets = $$(".reveal");

    // Se o navegador não suportar IntersectionObserver, mostra tudo.
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // anima só uma vez
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    targets.forEach((el, i) => {
      // pequeno atraso escalonado para um efeito mais elegante
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      observer.observe(el);
    });
  }

  /* ===============================================================
     2. LIGHTBOX DA GALERIA
     Abre um modal com a imagem ampliada. Fecha ao:
     - clicar no botão de fechar;
     - clicar fora da imagem (no fundo);
     - pressionar ESC.
     =============================================================== */
  function initLightbox() {
    const lightbox = $("#lightbox");
    const lightboxImg = $("#lightboxImg");
    const closeBtn = $("#lightboxClose");
    const items = $$(".gallery__item");

    if (!lightbox || !lightboxImg) return;

    // Abre o modal com a imagem clicada
    function openLightbox(imgEl) {
      lightboxImg.src = imgEl.src;
      lightboxImg.alt = imgEl.alt || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // trava o scroll de fundo
    }

    // Fecha o modal
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    // Liga cada item da galeria
    items.forEach((item) => {
      const img = $("img", item);
      if (!img) return;
      item.addEventListener("click", () => openLightbox(img));
    });

    // Botão de fechar
    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

    // Clique fora da imagem (no fundo do overlay)
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Tecla ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  /* ===============================================================
     3. ANO AUTOMÁTICO NO RODAPÉ
     =============================================================== */
  function initFooterYear() {
    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ===============================================================
     4. FALLBACK DE LAZY LOADING
     Navegadores modernos usam loading="lazy" nativo. Para os que
     não suportam, carregamos via IntersectionObserver a partir de
     um data-src (se existir).
     =============================================================== */
  function initLazyFallback() {
    const supportsNative = "loading" in HTMLImageElement.prototype;
    if (supportsNative) return; // nada a fazer

    const lazyImgs = $$("img[data-src]");
    if (!("IntersectionObserver" in window)) {
      lazyImgs.forEach((img) => (img.src = img.dataset.src));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        obs.unobserve(img);
      });
    });

    lazyImgs.forEach((img) => io.observe(img));
  }

  /* ===============================================================
     INICIALIZAÇÃO
     =============================================================== */
  function init() {
    initScrollReveal();
    initLightbox();
    initFooterYear();
    initLazyFallback();
  }

  // Garante que o DOM esteja pronto antes de rodar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();


function showPopup(message) {
  // Remove popup existente
  const oldPopup = document.querySelector(".popup-overlay");
  if (oldPopup) oldPopup.remove();

  // Cria elementos
  const overlay = document.createElement("div");
  overlay.className = "popup-overlay";

  overlay.innerHTML = `
      <div class="popup-box">
          <div class="popup-message">${message}</div>
          <button class="popup-btn">OK</button>
      </div>
  `;

  document.body.appendChild(overlay);

  // Ativa animação
  requestAnimationFrame(() => {
    overlay.classList.add("active");
  });

  function closePopup() {
    overlay.classList.remove("active");

    setTimeout(() => {
      overlay.remove();
    }, 250);
  }

  // Botão
  overlay.querySelector(".popup-btn").addEventListener("click", closePopup);

  // Clique fora
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      closePopup();
    }
  });

  // ESC
  document.addEventListener("keydown", function esc(e) {
    if (e.key === "Escape") {
      closePopup();
      document.removeEventListener("keydown", esc);
    }
  });
}


