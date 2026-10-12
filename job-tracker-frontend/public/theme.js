// Apply the theme before first paint: the saved choice (key matches useThemeStore), else the system setting
(function () {
  var savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch {
    // Storage blocked (private window): follow the system setting
  }
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', savedTheme ? savedTheme === 'dark' : prefersDark);
})();
