try {
  const preference = localStorage.getItem("edison-theme") || "system";
  const dark =
    preference === "dark" ||
    (preference === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
} catch {
  /* System theme remains the default if storage is unavailable. */
}
