// Mermaid initialization for MkDocs Material
// Uses instant loading event for SPA navigation
document$.subscribe(() => {
  if (typeof mermaid === "undefined") return;

  const isDark = document.body.getAttribute("data-md-color-scheme") === "slate";

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
    theme: isDark ? "dark" : "default",
    fontFamily: "var(--md-text-font-family, sans-serif)",
  });

  document.querySelectorAll(".mermaid").forEach((el) => {
    el.removeAttribute("data-processed");
  });

  mermaid.run({ querySelector: ".mermaid" });
});
