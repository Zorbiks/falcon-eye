export const getBrowserTheme = () => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')
  if (prefersDark.matches) {
    return 'dark'
  } else {
    return 'light'
  }
}
