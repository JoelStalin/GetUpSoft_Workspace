// Nodo scroll-paginator: recorre un listado de scroll infinito (sin paginacion por URL/boton)
// acumulando ofertas unicas hasta que dejan de aparecer nuevas o se llega al limite. Generico
// por diseno: recibe `scrollAndExtract` inyectado (como `page` en job-discovery-core.mjs) para
// poder probarse sin un navegador real.
export async function paginateByScroll({
  scrollAndExtract,
  dedupeKey = (item) => item.link || item.url || item.id,
  maxScrolls = 15,
  maxResults = 30,
  stableScrollsBeforeStop = 2,
} = {}) {
  if (typeof scrollAndExtract !== 'function') return { ok: false, reason: 'falta scrollAndExtract inyectado' };

  const seen = new Map();
  let scrolls = 0;
  let stableScrolls = 0;

  while (scrolls < maxScrolls && seen.size < maxResults && stableScrolls < stableScrollsBeforeStop) {
    const before = seen.size;
    // eslint-disable-next-line no-await-in-loop
    const batch = await scrollAndExtract({ scrollIndex: scrolls, alreadyCollected: seen.size });
    scrolls += 1;
    for (const item of batch || []) {
      const key = dedupeKey(item);
      if (key && !seen.has(key)) seen.set(key, item);
      if (seen.size >= maxResults) break;
    }
    // Nada nuevo en esta pasada: probablemente ya se llego al final del listado (o el scroll
    // no esta cargando mas contenido). Dos pasadas seguidas sin novedad y se detiene, en vez
    // de seguir scrolleando indefinidamente sobre el mismo contenido.
    stableScrolls = seen.size === before ? stableScrolls + 1 : 0;
  }

  const stoppedBecause = seen.size >= maxResults ? 'max_results_reached'
    : stableScrolls >= stableScrollsBeforeStop ? 'no_more_new_items'
      : 'max_scrolls_reached';

  return { ok: true, applied: false, items: Array.from(seen.values()), total_unique: seen.size, scrolls_performed: scrolls, stopped_because: stoppedBecause };
}
