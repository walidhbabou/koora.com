// Test des fonctions de nettoyage directement
console.log('🔧 Test des fonctions de nettoyage d\'URL...\n');

// Fonction de nettoyage (copie de parseEditorJs.ts)
const cleanUrl = (url) => {
  if (!url) return '';
  
  // Nettoyer les échappements multiples et guillemets de manière plus agressive
  let cleanedUrl = url
    // Supprimer tous les types de guillemets au début et à la fin
    .replace(/^["'\\&quot;]+|["'\\&quot;]+$/g, '')
    // Supprimer les échappements doubles et triples
    .replace(/\\&quot;/g, '')
    .replace(/&quot;/g, '')
    .replace(/\\"/g, '')
    .replace(/\\"$/g, '')
    .replace(/^\\"/g, '')
    // Supprimer les guillemets simples et doubles
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
    // Nettoyer les backslashes
    .replace(/\\\\/g, '/')
    .replace(/\\$/g, '')
    .replace(/^\\/, '')
    .trim();
  
  // Décoder les caractères encodés en URL
  try {
    cleanedUrl = decodeURIComponent(cleanedUrl);
  } catch (e) {
    // Si le décodage échoue, continuer avec l'URL actuelle
  }
  
  // Vérifier si l'URL est valide
  try {
    new URL(cleanedUrl);
    return cleanedUrl;
  } catch {
    // Si l'URL n'est pas valide, essayer de la réparer
    if (!cleanedUrl.startsWith('http')) {
      if (cleanedUrl.startsWith('//')) {
        cleanedUrl = 'https:' + cleanedUrl;
      } else if (cleanedUrl.startsWith('/')) {
        // URL relative, pas besoin de la modifier pour ce cas
        return cleanedUrl;
      } else {
        cleanedUrl = 'https://' + cleanedUrl;
      }
    }
    return cleanedUrl;
  }
};

// Tests avec différents cas problématiques
const testCases = [
  '\\&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86\\&quot;',
  '&quot;https://example.com&quot;',
  '\\"https://example.com\\"',
  '"https://example.com"',
  'https://example.com',
  'https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD/'
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}:`);
  console.log(`  Entrée  : ${testCase}`);
  const result = cleanUrl(testCase);
  console.log(`  Sortie  : ${result}`);
  console.log(`  Valid   : ${result.startsWith('http') ? '✅' : '❌'}`);
  console.log('');
});

console.log('🔧 Test du pattern de nettoyage HTML...\n');

// Test du pattern regex pour href
const htmlPatterns = [
  'href="\\&quot;https://ar.wikipedia.org/wiki/test\\&quot;"',
  'href=\'\\&quot;https://example.com\\&quot;\'',
  'href="&quot;https://example.com&quot;"',
  'href="https://example.com"'
];

htmlPatterns.forEach((pattern, index) => {
  console.log(`Pattern ${index + 1}: ${pattern}`);
  
  // Test du regex amélioré
  const match = pattern.match(/href=["'\\]*([^"'\\>\s]+?)["'\\]*/);
  if (match) {
    const url = match[1];
    const cleaned = cleanUrl(url);
    console.log(`  URL extraite : ${url}`);
    console.log(`  URL nettoyée : ${cleaned}`);
  } else {
    console.log('  Aucun match trouvé');
  }
  console.log('');
});