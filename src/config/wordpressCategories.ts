// Configuration des catégories WordPress
// Basé sur l'image fournie avec les catégories disponibles

export interface WordPressCategory {
  id: number;
  name: string;
  name_ar: string;
  slug?: string;
  description?: string;
}

// Catégories WordPress disponibles (basées sur les vraies catégories du site koora.com)
export const WORDPRESS_CATEGORIES: WordPressCategory[] = [
  // Catégories principales
  { id: 1, name: "Uncategorized", name_ar: "غير مصنف", slug: "uncategorized" },
  { id: 2, name: "Transfers and Player News", name_ar: "الانتقالات وأخبار اللاعبين", slug: "transfers-player-news" },
  { id: 3, name: "Player News", name_ar: "أخبار اللاعبين", slug: "player-news" },
  { id: 4, name: "Loans", name_ar: "الإعارات", slug: "loans" },
  { id: 5, name: "Transfer Market", name_ar: "سوق الانتقالات", slug: "transfer-market" },
  { id: 6, name: "Player Deals", name_ar: "صفقات اللاعبين", slug: "player-deals" },
  { id: 7, name: "International Tournaments", name_ar: "البطولات الدولية", slug: "international-tournaments" },
  { id: 8, name: "Asian Cup", name_ar: "كأس آسيا", slug: "asian-cup" },
  { id: 9, name: "African Cup of Nations", name_ar: "كأس أمم أفريقيا", slug: "african-cup-nations" },
  { id: 10, name: "European Championship", name_ar: "كأس أمم أوروبا", slug: "european-championship" },
  { id: 11, name: "World Cup", name_ar: "كأس العالم", slug: "world-cup" },
  { id: 12, name: "Copa America", name_ar: "كوبا أمريكا", slug: "copa-america" },
  { id: 13, name: "World Leagues", name_ar: "البطولات العالمية", slug: "world-leagues" },
  { id: 14, name: "Bundesliga", name_ar: "الدوري الألماني (بوندسليغا)", slug: "bundesliga" },
  { id: 15, name: "La Liga", name_ar: "الدوري الإسباني (لا ليغا)", slug: "la-liga" },
  { id: 16, name: "Premier League", name_ar: "الدوري الإنجليزي الممتاز", slug: "premier-league" },
  { id: 17, name: "Serie A", name_ar: "الدوري الإيطالي (سيريا أ)", slug: "serie-a" },
  { id: 18, name: "Ligue 1", name_ar: "الدوري الفرنسي (ليغ 1)", slug: "ligue-1" },
  { id: 19, name: "Continental Tournaments", name_ar: "البطولات القارية", slug: "continental-tournaments" },
  { id: 20, name: "Europa League", name_ar: "الدوري الأوروبي", slug: "europa-league" },
  { id: 21, name: "AFC Champions League", name_ar: "دوري أبطال آسيا", slug: "afc-champions-league" },
  { id: 22, name: "CAF Champions League", name_ar: "دوري أبطال أفريقيا", slug: "caf-champions-league" },
  { id: 23, name: "UEFA Champions League", name_ar: "دوري أبطال أوروبا", slug: "uefa-champions-league" },
  { id: 24, name: "Copa Libertadores", name_ar: "كوبا ليبرتادوريس", slug: "copa-libertadores" },
  { id: 29, name: "Local Leagues", name_ar: "البطولات المحلية", slug: "local-leagues" },
  { id: 30, name: "Algerian League", name_ar: "الدوري الجزائري", slug: "algerian-league" },
  { id: 31, name: "Saudi League", name_ar: "الدوري السعودي", slug: "saudi-league" },
  { id: 32, name: "Qatari League", name_ar: "الدوري القطري", slug: "qatari-league" },
  { id: 33, name: "Egyptian League", name_ar: "الدوري المصري", slug: "egyptian-league" },
  { id: 34, name: "Moroccan League", name_ar: "الدوري المغربي", slug: "moroccan-league" },
  { id: 74, name: "Arabian Gulf Cup", name_ar: "كأس الخليج العربي", slug: "arabian-gulf-cup" },
  { id: 1696, name: "FIFA Club World Cup", name_ar: "كأس العالم للأندية", slug: "fifa-club-world-cup" }
];

// Mapping entre les catégories Supabase et WordPress (IDs corrigés selon la logique)
export const SUPABASE_TO_WORDPRESS_MAPPING = {
  // Compétitions internationales (selectedHeaderCategory = 1) - Ligues européennes
  1: {
    all: [13, 14, 15, 16, 17, 18], // Toutes les ligues européennes/internationales
    subCategories: {
      1: [14], // الدوري الألماني (Bundesliga) → WordPress ID 14
      2: [16], // الدوري الإنجليزي (Premier League) → WordPress ID 16  
      3: [17], // الدوري الإيطالي (Serie A) → WordPress ID 17
      4: [15], // الدوري الإسباني (La Liga) → WordPress ID 15
      5: [18], // الدوري الفرنسي (Ligue 1) → WordPress ID 18
    }
  },
  
  // Compétitions mondiales (selectedHeaderCategory = 2) - Coupes du monde
  2: {
    all: [7, 8, 9, 10, 11, 12, 74, 1696], // Toutes les compétitions mondiales
    subCategories: {
      1: [1696], // كأس العالم للأندية (FIFA Club World Cup) → WordPress ID 1696
      2: [11],   // كأس العالم (World Cup) → WordPress ID 11
      3: [8],    // كأس آسيا (Asian Cup) → WordPress ID 8
      4: [9],    // كأس أم أفريقيا (African Cup) → WordPress ID 9
      5: [74],   // كأس الخليج العربي (Gulf Cup) → WordPress ID 74
      6: [10],   // كأس أم أوروبا (European Championship) → WordPress ID 10
      7: [12],   // كوبا أمريكا (Copa America) → WordPress ID 12
    }
  },
  
  // Compétitions continentales (selectedHeaderCategory = 3) - Ligues champions continentales
  3: {
    all: [19, 20, 21, 22, 23, 24], // Compétitions continentales
    subCategories: {
      1: [23], // دوري أبطال أوروبا (UEFA Champions League) → WordPress ID 23
      2: [20], // الدوري الأوروبي (Europa League) → WordPress ID 20  
      3: [21], // دوري أبطال آسيا (AFC Champions League) → WordPress ID 21
      4: [22], // دوري أبطال أفريقيا (CAF Champions League) → WordPress ID 22
      5: [24], // كوبا ليبرتادوريس (Copa Libertadores) → WordPress ID 24
    }
  },
  
  // Compétitions locales (selectedHeaderCategory = 4) - Ligues arabes/locales
  4: {
    all: [29, 30, 31, 32, 33, 34], // Toutes les compétitions locales
    subCategories: {
      1: [30], // الدوري الجزائري → WordPress ID 30
      2: [31], // الدوري السعودي → WordPress ID 31
      3: [32], // الدوري القطري → WordPress ID 32
      4: [33], // الدوري المصري → WordPress ID 33
      5: [34], // الدوري المغربي → WordPress ID 34
    }
  },
  
  // Transferts et mercato (selectedHeaderCategory = 5)
  5: {
    all: [2, 3, 4, 5, 6], // Transferts et mercato
    subCategories: {
      // Les transferts n'ont pas de sous-catégories spécifiques visibles
      // On utilise toutes les catégories de transferts
    }
  }
};