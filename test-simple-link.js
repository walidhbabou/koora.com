// Test simple pour les liens échappés
const testHtml = `<a href="\\&quot;https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD\\&quot;">محمد صلاح</a>`;

console.log('🔗 Test HTML original :', testHtml);

// Fonction de nettoyage simplifiée pour test
function cleanHtmlText(htmlText) {
  if (!htmlText) return '';
  
  // Nettoyer le texte de base
  let cleaned = htmlText
    .replace(/&nbsp;/g, ' ')
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\');
  
  // Corriger les liens avec des href malformés - regex plus précise
  cleaned = cleaned.replace(/href=["']?\\?&quot;([^"&]+)\\?&quot;["']?/g, (match, url) => {
    console.log('🔧 Lien trouvé à nettoyer :', match);
    console.log('🔧 URL extraite :', url);
    
    // Nettoyer l'URL
    let cleanedUrl = url
      .replace(/^["\\&quot;]+|["\\&quot;]+$/g, '')
      .replace(/\\&quot;/g, '')
      .replace(/&quot;/g, '')
      .replace(/\\"/g, '')
      .replace(/^"|"$/g, '')
      .trim();
    
    console.log('🔧 URL nettoyée :', cleanedUrl);
    return `href="${cleanedUrl}" target="_blank" rel="noopener noreferrer"`;
  });
  
  return cleaned;
}

const result = cleanHtmlText(testHtml);
console.log('✅ Résultat :', result);

// Test avec le contenu JSON complet
const jsonContent = `{
  "blocks": [
    {
      "type": "paragraph",
      "data": {
        "text": "Test avec lien <a href=\\"\\\\&quot;https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD\\\\&quot;\\">محمد صلاح</a> dans le texte."
      }
    }
  ]
}`;

console.log('\n🧪 Test avec JSON complet...');
try {
  const parsed = JSON.parse(jsonContent);
  const text = parsed.blocks[0].data.text;
  console.log('📝 Texte original :', text);
  
  const cleaned = cleanHtmlText(text);
  console.log('✅ Texte nettoyé :', cleaned);
} catch (error) {
  console.log('❌ Erreur JSON :', error);
}