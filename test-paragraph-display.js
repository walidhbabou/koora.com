// Test de l'affichage optimisé des paragraphes
const testContent = `{
  "time": 1758315571526,
  "blocks": [
    {
      "id": "test1",
      "type": "paragraph",
      "data": {
        "text": "   يواصل الجناح الدولي التشيليني باولو ديبالا    صانعة التاريخ مع تشيلسي رقم فياسين جديد    "
      }
    },
    {
      "id": "test2", 
      "type": "paragraph",
      "data": {
        "text": "يواصل الجناح الدولي التشيليني باولو ديبالا، صانعة التاريخ مع تشيلسي\\n\\nوذلك منذ انتقاله هناك قادما من صفوف مانشستر سيتي في صيف عام 2023."
      }
    },
    {
      "id": "test3",
      "type": "paragraph", 
      "data": {
        "text": "بعدما تمتعت تشيلسي مع الثنائي الذي انتقل   من اللاعب الذي  مقابل 47 مليون يورو   حيث وقع عل عقدة حتى عام 2030 لكن ثالثة"
      }
    },
    {
      "id": "empty",
      "type": "paragraph",
      "data": {
        "text": "   \\n\\n   "
      }
    }
  ],
  "version": "2.31.0"
}`;

console.log('🔍 Test de l\'affichage optimisé des paragraphes...\n');

// Simulation simplifiée de la fonction parseEditorJsToHtml
function testParagraphCleaning() {
  try {
    const parsed = JSON.parse(testContent);
    
    console.log('📝 Blocs trouvés:', parsed.blocks.length);
    
    parsed.blocks.forEach((block, index) => {
      if (block.type === 'paragraph') {
        const originalText = block.data.text || '';
        console.log(`\n🔸 Paragraphe ${index + 1}:`);
        console.log('   Texte original:', JSON.stringify(originalText));
        
        // Simulation du nettoyage
        let cleanedText = originalText
          .replace(/&nbsp;/g, ' ')
          .replace(/\\n/g, ' ')
          .replace(/\t/g, ' ')
          .replace(/\s+/g, ' ')
          .replace(/^\s+|\s+$/g, '')
          .trim();
        
        console.log('   Texte nettoyé:', JSON.stringify(cleanedText));
        console.log('   Longueur:', cleanedText.length);
        
        if (!cleanedText || cleanedText.length < 2) {
          console.log('   ❌ Paragraphe vide ou trop court - sera ignoré');
        } else {
          console.log('   ✅ Paragraphe valide - sera affiché');
          console.log('   📖 Aperçu:', cleanedText.substring(0, 50) + '...');
        }
      }
    });
    
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
}

testParagraphCleaning();

console.log('\n' + '='.repeat(60));
console.log('🎨 Exemple d\'affichage final optimal:\n');

const exampleHtml = `<p style="margin-bottom: 18px; line-height: 1.8; text-align: justify; font-size: 16px; color: #333;">يواصل الجناح الدولي التشيليني باولو ديبالا صانعة التاريخ مع تشيلسي رقم فياسين جديد</p>`;

console.log('HTML généré:', exampleHtml);
console.log('\n✅ Avantages de l\'affichage optimisé:');
console.log('   • Espacement amélioré (18px entre paragraphes)');
console.log('   • Interligne confortable (1.8)');
console.log('   • Justification du texte pour un meilleur rendu');
console.log('   • Taille de police lisible (16px)');
console.log('   • Couleur appropriée (#333)');
console.log('   • Filtrage des paragraphes vides');
console.log('   • Nettoyage des espaces superflus');