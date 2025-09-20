// Test spécifique pour les liens malformés
import { parseEditorJsToHtml } from './src/utils/parseEditorJs.js';

// Test avec le lien exact problématique (échappements doubles)
const problematicContent = String.raw`{"time":1758315571526,"blocks":[{"id":"6y5ZoYsOHN","type":"paragraph","data":{"text":"أعلنت منصة الاتحاد الدولي لكرة القدم \"فيفا\" الخاصة بتغيير الجنسية الرياضية، عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href=\"\&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86\&quot;\">زين الدين زيدان</a>، على تمثيل منتخب الجزائر خلال المرحلة المقبلة."}}],"version":"2.31.0"}`;

console.log('🔍 Test spécifique pour les liens malformés...\n');

try {
  const result = parseEditorJsToHtml(problematicContent);
  console.log('✅ Parsing réussi !');
  console.log('\n📝 Contenu parsé :');
  console.log(result);
  
  // Extraire l'URL du href
  const hrefMatch = result.match(/href="([^"]+)"/);
  if (hrefMatch) {
    const extractedUrl = hrefMatch[1];
    console.log('\n🔗 URL extraite :', extractedUrl);
    
    // Vérifications
    if (extractedUrl.includes('%22') || extractedUrl.includes('localhost')) {
      console.log('❌ PROBLÈME : L\'URL contient encore des échappements ou localhost');
      console.log('URL problématique :', extractedUrl);
    } else if (extractedUrl.startsWith('https://ar.wikipedia.org/wiki/')) {
      console.log('✅ SUCCÈS : L\'URL est propre et correcte !');
      console.log('URL finale :', extractedUrl);
    } else {
      console.log('⚠️  ATTENTION : URL différente de celle attendue');
      console.log('URL actuelle :', extractedUrl);
    }
  } else {
    console.log('❌ ERREUR : Aucun lien trouvé dans le résultat');
  }
  
  // Vérifier target="_blank"
  if (result.includes('target="_blank"')) {
    console.log('✅ Target blank : Les liens s\'ouvriront dans une nouvelle fenêtre');
  } else {
    console.log('❌ Target manquant : Les liens ne s\'ouvriront pas dans une nouvelle fenêtre');
  }
  
} catch (error) {
  console.log('❌ Erreur de parsing :', error);
}

// Test avec d'autres variations de liens malformés
console.log('\n' + '='.repeat(60));
console.log('🔍 Test avec autres variations de liens malformés...\n');

const variations = [
  String.raw`{"blocks":[{"type":"paragraph","data":{"text":"Test <a href='\\"https://example.com\\"'>lien</a>"}}]}`,
  String.raw`{"blocks":[{"type":"paragraph","data":{"text":"Test <a href='&quot;https://example.com&quot;'>lien</a>"}}]}`,
  String.raw`{"blocks":[{"type":"paragraph","data":{"text":"Test <a href='https://example.com'>lien</a>"}}]}`
];

variations.forEach((variation, index) => {
  try {
    const result = parseEditorJsToHtml(variation);
    const hrefMatch = result.match(/href="([^"]+)"/);
    if (hrefMatch) {
      console.log(`Variation ${index + 1}: ${hrefMatch[1]}`);
    }
  } catch (error) {
    console.log(`Variation ${index + 1}: Erreur -`, error.message);
  }
});