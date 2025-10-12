/**
 * Génère un slug à partir d'un titre d'article
 * Convertit les caractères arabes et latins en format URL-friendly
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, '-')
    // Supprimer les caractères non alphanumériques (garder les lettres arabes et latines)
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-z0-9-]/g, '')
    // Supprimer les tirets multiples
    .replace(/-+/g, '-')
    // Supprimer les tirets au début et à la fin
    .replace(/(^-+)|(-+$)/g, '')
    // Limiter la longueur à 100 caractères
    .substring(0, 100)
    // Supprimer le tiret final si la coupe crée un tiret à la fin
    .replace(/-$/, '');
}

/**
 * Génère un slug unique en ajoutant l'ID à la fin
 */
export function generateUniqueSlug(title: string, id: number | string): string {
  const baseSlug = generateSlug(title);
  
  // Si le slug est vide ou trop court, utiliser un fallback
  if (!baseSlug || baseSlug.length < 3) {
    return `article-${id}`;
  }
  
  return `${baseSlug}-${id}`;
}

/**
 * Extrait l'ID d'un slug qui contient l'ID à la fin
 */
export function extractIdFromSlug(slug: string): string | null {
  // Chercher un pattern WordPress comme "titre-article-wp_123"
  if (slug.includes('wp_')) {
    const wpMatch = /wp_(\d+)$/.exec(slug);
    if (wpMatch) {
      return `wp_${wpMatch[1]}`;
    }
  }
  
  // Chercher un pattern Supabase comme "titre-article-123"
  const regex = /-(\d+)$/;
  const match = regex.exec(slug);
  return match ? match[1] : null;
}

/**
 * Vérifie si un slug est pour une news WordPress
 */
export function isWordPressSlug(slug: string): boolean {
  return slug.startsWith('wp_') || slug.includes('wp_');
}

/**
 * Génère un slug pour les articles WordPress
 */
export function generateWordPressSlug(title: string, wpId: number): string {
  const baseSlug = generateSlug(title);
  
  if (!baseSlug || baseSlug.length < 3) {
    return `wp_${wpId}`;
  }
  
  return `${baseSlug}-wp_${wpId}`;
}