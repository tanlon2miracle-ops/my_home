document$.subscribe(() => {
  if (typeof mermaid === "undefined") {
    return;
  }

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "loose",
  });

  document.querySelectorAll(".mermaid").forEach((element) => {
    element.removeAttribute("data-processed");
  });

  mermaid.run({
    querySelector: ".mermaid",
  });
});

