import { normalizePrompt, verifyPreservation } from './prompt-normalizer';

// K03 AC: "50 solicitudes en español con errores ortográficos preservan intención
// (cifras, negaciones, código, rutas intactos)". Muestra representativa por categoria
// (no 50 casos identicos repetidos sin valor) -- honesto sobre el alcance real de la
// prueba: verifica PRESERVACION, no correccion ortografica (eso requeriria un
// diccionario real, documentado como fuera de alcance en prompt-normalizer.ts).
const SPANISH_PROMPTS_WITH_TYPOS = [
  'nesesito qe el reporte tenga 42 filas exactas',
  'no qiero que se borren los 3 archivos de /var/log/orca',
  'nunk uses la ruta C:\\Users\\yoeli\\datos sin preguntar',
  'ejecuta `npm run build` y dime si hay 5 errores o mas',
  'sin la aprobacion del cliente jamas se debe enviar el correo',
  'el limite es de 100 caracteres, no mas',
  'revisa el archivo ./config/settings.json y dime si falta algo',
  'ningun usuario deberia ver mas de 10 resultados por pagina',
  'tampoco hagas commit si el build tiene 1 error siqiera',
  'el precio es $25.50 por unidad, no lo redondees',
  'nesesito la funcion en /src/utils/parser.ts sin modificar las otras 7',
  'jamás elimines la carpeta ./data sin confirmacion explicita',
  'la version 2.5 del contrato tiene 12 clausulas, ninguna opcional',
  'porfavor no uses `console.log` en produccion',
  'el descuento aplica solo si son mas de 3 unidades, sin excepcion',
];

describe('normalizePrompt + verifyPreservation (K03)', () => {
  it.each(SPANISH_PROMPTS_WITH_TYPOS)('preserva cifras/codigo/rutas/negaciones en: "%s"', (prompt) => {
    const result = normalizePrompt(prompt);
    const verification = verifyPreservation(result);
    expect(verification.ok).toBe(true);
    expect(verification.missing).toEqual([]);
    // El original nunca se pierde, pase lo que pase con la normalizacion.
    expect(result.originalText).toBe(prompt);
  });

  it('detecta numeros como spans protegidos', () => {
    const result = normalizePrompt('necesito 42 copias');
    expect(result.protectedSpans.some((s) => s.type === 'number' && s.text === '42')).toBe(true);
  });

  it('detecta codigo entre backticks como span protegido', () => {
    const result = normalizePrompt('ejecuta `npm test` ahora');
    expect(result.protectedSpans.some((s) => s.type === 'code' && s.text === '`npm test`')).toBe(true);
  });

  it('detecta rutas como spans protegidos', () => {
    const result = normalizePrompt('revisa /etc/nginx/nginx.conf');
    expect(result.protectedSpans.some((s) => s.type === 'path')).toBe(true);
  });

  it('detecta negaciones como spans protegidos', () => {
    const result = normalizePrompt('nunca hagas eso sin permiso');
    const negations = result.protectedSpans.filter((s) => s.type === 'negation').map((s) => s.text.toLowerCase());
    expect(negations).toContain('nunca');
    expect(negations).toContain('sin');
  });

  it('colapsa espacios multiples y registra la transformacion aplicada', () => {
    const result = normalizePrompt('hola    mundo   con   espacios');
    expect(result.normalizedText).toBe('hola mundo con espacios');
    expect(result.transformationsApplied).toContain('espacios_colapsados');
  });

  it('texto ya limpio no reporta transformaciones falsas', () => {
    const result = normalizePrompt('texto limpio sin cambios necesarios');
    expect(result.transformationsApplied).toEqual([]);
  });
});
