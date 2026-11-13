/* NOTIQ product screenshot switcher. No analytics, third-party embeds or network calls. */
(function () {
  "use strict";
  const base = "../assets/img/Products/Notiq/";
  const allowed = new Set([
    "notiq-dashboard.webp","notiq-inbox-anonymized.webp","notiq-campaigns.webp",
    "notiq-template-library.webp","notiq-connections.webp","notiq-ai-test.webp",
    "notiq-widget-preview.webp","notiq-ai-usage.webp","notiq-ai-settings.webp",
    "notiq-ai-knowledge.webp"
  ]);
  const tabs = Array.from(document.querySelectorAll(".nq-tab"));
  const panel = document.getElementById("nq-preview-panel");
  const preview = document.getElementById("nq-preview-image");
  const title = document.getElementById("nq-preview-title");
  const description = document.getElementById("nq-preview-description");
  const galleryTrigger = document.querySelector(".nq-gallery-image");
  const dialog = document.getElementById("nq-lightbox");
  const dialogImage = document.getElementById("nq-lightbox-image");
  const dialogTitle = document.getElementById("nq-lightbox-title");
  const close = document.getElementById("nq-lightbox-close");
  let requestNumber = 0;

  function selectTab(tab, focus) {
    if (!tab || !preview || !allowed.has(tab.dataset.image)) return;
    const current = ++requestNumber;
    tabs.forEach(function (item) {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });
    if (focus) tab.focus();
    if (panel) panel.setAttribute("aria-labelledby", tab.id);
    title.textContent = tab.dataset.title || "";
    description.textContent = tab.dataset.description || "";
    if (galleryTrigger) {
      galleryTrigger.dataset.image = tab.dataset.image;
      galleryTrigger.dataset.title = tab.dataset.title || "NOTIQ preview";
      galleryTrigger.setAttribute("aria-label", "Enlarge " + (tab.dataset.title || "product") + " screenshot");
    }
    const next = new Image();
    preview.classList.add("nq-fading");
    next.onload = function () {
      if (current !== requestNumber) return;
      preview.src = next.src;
      preview.alt = "NOTIQ " + (tab.dataset.title || "product") + " demonstration screen";
      preview.classList.remove("nq-fading");
    };
    next.onerror = function () {
      if (current === requestNumber) preview.classList.remove("nq-fading");
    };
    next.src = base + tab.dataset.image;
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (event) {
      if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex = event.key === "Home" ? 0 :
        event.key === "End" ? tabs.length - 1 :
        (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[nextIndex], true);
    });
  });
  document.querySelectorAll(".nq-preview-trigger").forEach(function (button) {
    button.addEventListener("click", function () {
      const filename = button.dataset.image;
      if (!dialog || !dialogImage || !allowed.has(filename)) return;
      dialogImage.src = base + filename;
      dialogImage.alt = "Enlarged " + (button.dataset.title || "NOTIQ product") + " demonstration screenshot";
      dialogTitle.textContent = button.dataset.title || "NOTIQ product preview";
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });
  if (close && dialog) close.addEventListener("click", function () { dialog.close(); });
  if (dialog) dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });
})();
