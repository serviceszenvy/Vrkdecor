// Browser build: each page module becomes its own chunk, loaded on demand
export const MODS = import.meta.glob('../pages/*.jsx')
export const EAGER = false
