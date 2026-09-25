// Apply the saved theme before first paint (key matches useThemeStore)
document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark');
