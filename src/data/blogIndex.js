// Light index of blog posts (for the blog list, routes and sitemap). Full articles live in blog.js.
export const POST_INDEX = [
 {
  "slug": "wedding-stage-decoration-ideas-nagercoil",
  "title": "Wedding Stage Decoration Ideas for Nagercoil | VRK Decor",
  "desc": "Wedding stage decoration ideas from real VRK Decor stages in Nagercoil. Traditional mandapams, white and green florals, pastel and royal stage looks.",
  "h1": "Wedding stage decoration ideas for Nagercoil weddings",
  "date": "2026-10-24",
  "dateLabel": "24 October 2026",
  "cover": "royal-gold-mandap"
 },
 {
  "slug": "church-temple-wedding-decoration-nagercoil",
  "title": "Planning Church and Temple Wedding Decoration | VRK Decor",
  "desc": "A simple guide to planning decoration for church and temple weddings in Nagercoil, from venue rules and timings to flowers, entrances and the reception.",
  "h1": "How to plan decoration for church and temple weddings in Nagercoil",
  "date": "2026-10-24",
  "dateLabel": "24 October 2026",
  "cover": "grand-entrance-aisle"
 }
]

export const postIndexBySlug = slug => POST_INDEX.find(p => p.slug === slug)
