// Test de la nouvelle fonction de parsing avec correction des URLs

// Simulation de la fonction cleanUrl
const cleanUrl = (url) => {
  if (!url) return '';
  
  // Nettoyer les échappements multiples et guillemets
  let cleanedUrl = url
    .replace(/^["\\&quot;]+|["\\&quot;]+$/g, '') // Supprimer les guillemets au début et à la fin
    .replace(/\\&quot;/g, '') // Supprimer \&quot;
    .replace(/&quot;/g, '') // Supprimer &quot;
    .replace(/\\"/g, '') // Supprimer \"
    .replace(/^"|"$/g, '') // Supprimer les guillemets simples
    .replace(/\\\\/g, '/') // Remplacer les doubles backslash
    .trim();
  
  // Vérifier si l'URL est valide
  try {
    new URL(cleanedUrl);
    return cleanedUrl;
  } catch {
    // Si l'URL n'est pas valide, essayer de la réparer
    if (!cleanedUrl.startsWith('http')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }
    return cleanedUrl;
  }
};

// Simulation de la fonction cleanHtmlText
const cleanHtmlText = (htmlText) => {
  if (!htmlText) return '';
  
  // Nettoyer le texte de base
  let cleaned = htmlText
    .replace(/&nbsp;/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\');
  
  // Corriger les liens avec des href malformés
  cleaned = cleaned.replace(/href=["\\&quot;]*([^"\\&]+)["\\&quot;]*/g, (match, url) => {
    const cleanedUrl = cleanUrl(url);
    return `href="${cleanedUrl}" target="_blank" rel="noopener noreferrer"`;
  });
  
  // Ajouter target="_blank" aux liens qui n'en ont pas
  cleaned = cleaned.replace(/<a\s+([^>]*href="[^"]*"[^>]*)>/g, (match, attributes) => {
    if (!attributes.includes('target=')) {
      return `<a ${attributes} target="_blank" rel="noopener noreferrer">`;
    }
    return match;
  });
  
  return cleaned;
};

// Test avec l'exemple problématique
const testText = 'أعلنت منصة الاتحاد الدولي لكرة القدم "فيفا" الخاصة بتغيير الجنسية الرياضية، عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href="\\&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86\\&quot;">زين الدين زيدان</a>، على تمثيل منتخب الجزائر خلال المرحلة المقبلة، بعد أن لعب سابقًا بقميص منتخب فرنسا في الفئات السنية.';

console.log('=== Test de correction des URLs ===');
console.log('Texte original:');
console.log(testText);
console.log('\nTexte corrigé:');
const correctedText = cleanHtmlText(testText);
console.log(correctedText);

// Test de l'URL séparément
const problematicUrl = '\\&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86\\&quot;';
console.log('\n=== Test URL individuelle ===');
console.log('URL problématique:', problematicUrl);
console.log('URL nettoyée:', cleanUrl(problematicUrl));

// Test avec contenu de tableau
const tableContent = [
  ["الفريق", "المباريات", "النقاط"],
  ["ليفربول", "20", "47"],
  ["مان سيتي", "20", "44"]
];

console.log('\n=== Test tableau ===');
console.log('Contenu tableau:', JSON.stringify(tableContent, null, 2));

// Simulation d'affichage de tableau
let tableHTML = '<div style="overflow-x: auto; margin: 20px 0;"><table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd; background: white; min-width: 500px;">';

tableContent.forEach((row, index) => {
  const isHeader = index === 0;
  const cellTag = isHeader ? 'th' : 'td';
  const cellStyle = isHeader 
    ? 'background-color: #f8f9fa; font-weight: bold; padding: 12px; border: 1px solid #ddd; text-align: center; color: #333;'
    : 'padding: 12px; border: 1px solid #ddd; text-align: center; color: #333;';
  
  tableHTML += '<tr>';
  row.forEach(cell => {
    const cleanCell = String(cell || '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/<[^>]*>/g, '')
      .trim();
    tableHTML += `<${cellTag} style="${cellStyle}">${cleanCell}</${cellTag}>`;
  });
  tableHTML += '</tr>';
});

tableHTML += '</table></div>';

console.log('HTML tableau généré:');
console.log(tableHTML);