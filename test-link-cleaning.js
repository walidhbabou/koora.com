// Test spécifique pour les liens échappés
import { parseEditorJsToHtml } from './src/utils/parseEditorJs.ts';

// Contenu de test avec le lien échappé exact
const testContentWithEscapedLink = `{
  "time": 1758315571526,
  "blocks": [
    {
      "id": "6y5ZoYsOHN",
      "type": "paragraph",
      "data": {
        "text": "أعلنت منصة الاتحاد الدولي لكرة القدم فيفا عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href=\\"\\&quot;https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD\\&quot;\\">محمد صلاح</a>، على تمثيل منتخب الجزائر."
      }
    }
  ],
  "version": "2.31.0"
}`;

console.log('🔗 Test du nettoyage des liens échappés...\n');

try {
  const result = parseEditorJsToHtml(testContentWithEscapedLink);
  console.log('✅ Parsing réussi !');
  console.log('\n📝 Contenu parsé :');
  console.log(result);
  
  // Vérifier que les liens sont correctement nettoyés
  if (result.includes('href="https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD"')) {
    console.log('\n✅ Lien nettoyé : URL directe sans échappement');
  } else {
    console.log('\n❌ Problème de nettoyage : Le lien contient encore des échappements');
    console.log('Recherche de patterns dans le résultat...');
    
    // Debug : montrer ce qui est trouvé
    const hrefMatches = result.match(/href="[^"]*"/g);
    if (hrefMatches) {
      console.log('URLs trouvées :', hrefMatches);
    }
  }
  
  // Vérifier target="_blank"
  if (result.includes('target="_blank"')) {
    console.log('✅ Target blank : Les liens s\'ouvriront dans une nouvelle fenêtre');
  } else {
    console.log('❌ Target manquant : Les liens ne s\'ouvriront pas dans une nouvelle fenêtre');
  }
  
  // Vérifier qu'il n'y a pas de localhost
  if (!result.includes('localhost')) {
    console.log('✅ Pas de localhost : Les liens ne redirigeront pas vers localhost');
  } else {
    console.log('❌ Localhost détecté : Les liens pourraient encore rediriger vers localhost');
  }
  
} catch (error) {
  console.log('❌ Erreur de parsing :', error);
}

console.log('\n' + '='.repeat(60));
console.log('🔗 Test avec différents formats d\'échappement...\n');

// Test avec d'autres formats d'échappement
const testVariations = [
  {
    name: 'Format 1: \\&quot;',
    content: `{"blocks":[{"type":"paragraph","data":{"text":"Lien: <a href=\\"\\&quot;https://example.com\\&quot;\\">Texte</a>"}}]}`
  },
  {
    name: 'Format 2: &quot;',
    content: `{"blocks":[{"type":"paragraph","data":{"text":"Lien: <a href=\\"&quot;https://example.com&quot;\\">Texte</a>"}}]}`
  },
  {
    name: 'Format 3: guillemets simples',
    content: `{"blocks":[{"type":"paragraph","data":{"text":"Lien: <a href='\\"https://example.com\\"'>Texte</a>"}}]}`
  }
];

testVariations.forEach(test => {
  console.log(`\n🧪 ${test.name}:`);
  try {
    const result = parseEditorJsToHtml(test.content);
    const hrefMatch = result.match(/href="([^"]*)"/);
    if (hrefMatch) {
      console.log(`   URL extraite: ${hrefMatch[1]}`);
      if (hrefMatch[1] === 'https://example.com') {
        console.log('   ✅ Nettoyage réussi');
      } else {
        console.log('   ❌ Nettoyage échoué');
      }
    } else {
      console.log('   ❌ Aucun lien trouvé');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error}`);
  }
});