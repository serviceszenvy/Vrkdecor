// Server/prerender build: every page module loaded up front
export const MODS = import.meta.glob('../pages/*.jsx', { eager: true })
export const EAGER = true
