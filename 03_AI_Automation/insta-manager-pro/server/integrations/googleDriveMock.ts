/**
 * Mock Google Drive Integration for Testing
 * Simulates photo fetching when real Google Drive is not accessible
 */

export interface MockPhoto {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  thumbnailLink: string;
}

/**
 * Get mock photos for testing
 * Uses real Unsplash images for better visual experience
 */
export function getMockPhotos(): MockPhoto[] {
  return [
    {
      id: "mock-1",
      name: "sunset-beach-1.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80",
    },
    {
      id: "mock-2",
      name: "urban-street-photography.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&q=80",
    },
    {
      id: "mock-3",
      name: "nature-landscape.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
    },
    {
      id: "mock-4",
      name: "portrait-studio.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    },
    {
      id: "mock-5",
      name: "food-photography.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=200&q=80",
    },
    {
      id: "mock-6",
      name: "travel-adventure.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80",
    },
    {
      id: "mock-7",
      name: "lifestyle-moment.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80",
    },
    {
      id: "mock-8",
      name: "architecture-design.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1479839672679-a46482f0e7e8?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1479839672679-a46482f0e7e8?w=200&q=80",
    },
    {
      id: "mock-9",
      name: "cultural-event.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=200&q=80",
    },
    {
      id: "mock-10",
      name: "creative-concept.jpg",
      mimeType: "image/jpeg",
      webViewLink: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
      thumbnailLink: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&q=80",
    },
  ];
}

/**
 * Get mock Spanish captions for photos
 */
export function getMockSpanishCaptions(): Record<string, { caption: string; hashtags: string[] }> {
  return {
    "mock-1": {
      caption:
        "La magia del atardecer en la playa 🌅 Cada momento es una oportunidad para capturar la belleza de la naturaleza. ¿Cuál es tu lugar favorito para ver la puesta de sol?",
      hashtags: ["#atardecer", "#playa", "#naturaleza", "#fotografía", "#viajes"],
    },
    "mock-2": {
      caption:
        "Las calles urbanas cuentan historias 🏙️ Cada esquina tiene su propio encanto y misterio. La ciudad nunca duerme, y tampoco lo hace la creatividad.",
      hashtags: ["#urbano", "#calle", "#fotografía", "#ciudad", "#arte"],
    },
    "mock-3": {
      caption:
        "La naturaleza es el mejor artista 🌿 Montañas, ríos y bosques que nos recuerdan lo pequeños que somos en este vasto universo.",
      hashtags: ["#naturaleza", "#paisaje", "#montañas", "#viajes", "#aventura"],
    },
    "mock-4": {
      caption:
        "Retrato de un momento perfecto 📸 La luz, la expresión, la emoción... todo converge en un solo frame que cuenta mil historias.",
      hashtags: ["#retrato", "#fotografía", "#estudio", "#arte", "#belleza"],
    },
    "mock-5": {
      caption:
        "La comida es arte, la fotografía es pasión 🍽️ Cada plato es una masterpiece que merece ser compartida y celebrada.",
      hashtags: ["#comida", "#fotografía", "#gastronomía", "#delicioso", "#arte"],
    },
    "mock-6": {
      caption:
        "Viajar es vivir 🌍 Cada destino nos deja una huella en el corazón y una historia para contar. ¿Cuál es tu próximo destino?",
      hashtags: ["#viajes", "#aventura", "#destino", "#explorar", "#mundo"],
    },
    "mock-7": {
      caption:
        "Los momentos simples son los más hermosos ✨ La vida no se trata de grandes eventos, sino de los pequeños detalles que hacen la diferencia.",
      hashtags: ["#estilo", "#vida", "#momentos", "#belleza", "#inspiración"],
    },
    "mock-8": {
      caption:
        "La arquitectura es la poesía del espacio 🏛️ Líneas, formas y estructuras que desafían la gravedad y la imaginación.",
      hashtags: ["#arquitectura", "#diseño", "#arte", "#construcción", "#belleza"],
    },
    "mock-9": {
      caption:
        "La cultura nos une, la diversidad nos enriquece 🎭 Cada evento es una celebración de quiénes somos y de dónde venimos.",
      hashtags: ["#cultura", "#evento", "#tradición", "#comunidad", "#celebración"],
    },
    "mock-10": {
      caption:
        "La creatividad no tiene límites 🎨 Cuando dejas que tu imaginación vuele, los resultados pueden ser extraordinarios.",
      hashtags: ["#creatividad", "#arte", "#imaginación", "#diseño", "#inspiración"],
    },
  };
}
