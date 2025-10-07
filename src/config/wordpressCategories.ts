// Configuration des catégories WordPress
// Basé sur l'image fournie avec les catégories disponibles

export interface WordPressCategory {
  id: number;
  name: string;
  name_ar: string;
  description?: string;
}

// Catégories WordPress disponibles (basées sur l'image)
export const WORDPRESS_CATEGORIES: WordPressCategory[] = [
  { id: 2, name: "Angleterre - Premier League", name_ar: "إنجلترا - بريمير ليجر" },
  { id: 3, name: "Espagne - La Liga", name_ar: "إسبانيا - ليجا" },
  { id: 4, name: "Italie", name_ar: "إيطاليا" },
  { id: 5, name: "France - Ligue 1", name_ar: "فرنسا - ليجا 1" },
  { id: 6, name: "Allemagne", name_ar: "ألمانيا" },
  { id: 7, name: "Compétitions européennes", name_ar: "البطولات الأوروبية" },
  { id: 8, name: "Coupe d'Asie", name_ar: "كأس آسيا" },
  { id: 9, name: "Coupe d'Amérique", name_ar: "كأس أمريكا" },
  { id: 10, name: "Coupe d'Afrique", name_ar: "كأس أفريقيا" },
  { id: 11, name: "Ligue des champions", name_ar: "دوري أبطال أوروبا" },
  { id: 12, name: "Ligue Europa", name_ar: "الدوري الأوروبي" },
  { id: 13, name: "Compétitions nationales", name_ar: "البطولات الوطنية" },
  { id: 14, name: "Coupe nationale (Portugal)", name_ar: "تاريخ الكأس (البرتغال)" },
  { id: 15, name: "Coupe nationale (Espagne)", name_ar: "الكوريا الإسباني (كأس ملك)" },
  { id: 16, name: "Coupe nationale (Argentine)", name_ar: "الكوريا الأرجنتيني للمنتخب" },
  { id: 17, name: "Eliminatoires Mondiales", name_ar: "تصفيات كأس العالم" },
  { id: 18, name: "Coupe du Monde", name_ar: "كأس العالم لكرة القدم" },
  { id: 19, name: "Compétitions de clubs", name_ar: "البطولات النادية" },
  { id: 20, name: "Coupe arabe", name_ar: "الكوريا العربي" },
  { id: 21, name: "Coupe italienne", name_ar: "كوريا إيطالي آب" },
  { id: 22, name: "Coupe espagnole", name_ar: "كوريا إسبانيا آب" },
  { id: 23, name: "Transferts", name_ar: "الانتقالات" },
  { id: 24, name: "Mercato", name_ar: "الميركاتو" },
  { id: 29, name: "Compétitions locales", name_ar: "البطولات المحلية" }
];

// Mapping entre les catégories Supabase et WordPress
export const SUPABASE_TO_WORDPRESS_MAPPING = {
  // Compétitions internationales (selectedHeaderCategory = 1)
  1: {
    all: [2, 3, 4, 5, 6, 7], // Toutes les compétitions européennes
    subCategories: {
      1: [2], // Premier League anglaise
      2: [3], // La Liga espagnole
      3: [4], // Serie A italienne
      4: [5], // Ligue 1 française
      5: [6], // Bundesliga allemande
      6: [7], // Compétitions européennes (UCL, UEL)
    }
  },
  
  // Compétitions mondiales (selectedHeaderCategory = 2)
  2: {
    all: [8, 9, 10, 17, 18], // Toutes les compétitions mondiales
    subCategories: {
      1: [18], // Coupe du Monde
      2: [17], // Eliminatoires Mondiales
      3: [8],  // Coupe d'Asie
      4: [9],  // Coupe d'Amérique
      5: [10], // Coupe d'Afrique
    }
  },
  
  // Compétitions continentales (selectedHeaderCategory = 3)
  3: {
    all: [11, 12, 20], // Compétitions continentales
    subCategories: {
      1: [11], // Ligue des champions
      2: [12], // Ligue Europa
      3: [20], // Coupe arabe
    }
  },
  
  // Compétitions locales (selectedHeaderCategory = 4)
  4: {
    all: [13, 14, 15, 16, 21, 22, 29], // Toutes les compétitions locales
    subCategories: {
      1: [13], // Compétitions nationales générales
      2: [14], // Coupe Portugal
      3: [15], // Coupe Espagne
      4: [16], // Coupe Argentine
      5: [21], // Coupe italienne
      6: [22], // Coupe espagnole
    }
  },
  
  // Transferts et mercato (selectedHeaderCategory = 5)
  5: {
    all: [23, 24], // Transferts et mercato
    subCategories: {
      1: [23], // Transferts
      2: [24], // Mercato
    }
  }
};