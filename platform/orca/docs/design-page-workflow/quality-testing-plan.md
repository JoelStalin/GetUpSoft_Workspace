# Plan de pruebas de calidad

## Calidad UX/UI

- Jerarquia visual clara.
- CTA above the fold.
- Responsive desktop, tablet y mobile.
- Estados hover, focus, loading y disabled.
- Componentes reutilizables.
- Sin cards anidadas innecesarias.
- Sin texto que se desborde en mobile.

## Calidad visual premium

- Direccion sobria, empresarial y tecnica.
- Animaciones funcionales, no decorativas sin proposito.
- WebGL con lazy loading.
- Poster frame para videos.
- Reduced motion.
- Paleta controlada, sin exceso de neon.

## Calidad SEO

- H1 unico.
- Meta title y description.
- Canonical.
- Hreflang si aplica.
- Open Graph.
- Twitter/X card.
- JSON-LD.
- Sitemap y robots.

## Calidad tecnica

- Sin imagenes rotas.
- Sin links internos rotos.
- Sin errores severos de consola.
- Formularios con labels.
- Navegacion por teclado.
- Contraste WCAG AA minimo.
- LCP/CLS/INP considerados antes de publicar.

## Gates de aprobacion

Un proyecto no pasa a `approved` si falla cualquiera de estos gates:

- imagen rota;
- formulario inutilizable;
- H1 duplicado;
- CTA principal ausente;
- asset hero sin fallback;
- workflow sin memoria Obsidian;
- paquete NotebookLM incompleto;
- reporte Selenium ausente cuando hay UI interactiva.

