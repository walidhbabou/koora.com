// Test pour vérifier le parsing du contenu JSON Editor.js avec les échappements de liens

// Fonction de nettoyage des échappements
const cleanEscapedText = (text) => {
  if (!text) return '';
  
  // Nettoyer les échappements doubles et triples
  const cleaned = text
    // Nettoyer les échappements d'attributs href
    .replace(/href="\\"([^"]*)\\""/g, 'href="$1"')
    .replace(/href="\\&quot;([^"]*)\\&quot;"/g, 'href="$1"')
    .replace(/href="&quot;([^"]*)&quot;"/g, 'href="$1"')
    // Nettoyer les espaces insécables échappés
    .replace(/&nbsp;/g, ' ')
    // Décoder les entités HTML basiques
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  return cleaned;
};

// Fonction de parsing
const parseEditorJsToHtml = (content) => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.blocks && Array.isArray(parsed.blocks)) {
      return parsed.blocks
        .map((block, index) => {
          switch (block.type) {
            case 'paragraph': {
              if (!block.data.text) return '';
              const cleanText = cleanEscapedText(block.data.text);
              return `<p>${cleanText}</p>`;
            }
            
            case 'header': {
              const level = block.data.level || 2;
              if (!block.data.text) return '';
              const cleanText = cleanEscapedText(block.data.text);
              return `<h${level}>${cleanText}</h${level}>`;
            }
            
            case 'list': {
              if (block.data.items && Array.isArray(block.data.items)) {
                const listItems = block.data.items
                  .map(item => `<li>${cleanEscapedText(item)}</li>`)
                  .join('');
                return `<ul>${listItems}</ul>`;
              }
              return '';
            }
            
            case 'quote': {
              if (!block.data.text) return '';
              const cleanText = cleanEscapedText(block.data.text);
              return `<blockquote>${cleanText}</blockquote>`;
            }
            
            default: {
              if (!block.data.text) return '';
              const cleanText = cleanEscapedText(block.data.text);
              return `<p>${cleanText}</p>`;
            }
          }
        })
        .filter(Boolean)
        .join('');
    }
  } catch (e) {
    console.error('Erreur de parsing JSON:', e);
    return `<p>${content}</p>`;
  }
  return `<p>${content}</p>`;
};

// Test avec l'exemple fourni
const testContent = `{"time":1758315571526,"blocks":[{"id":"6y5ZoYsOHN","type":"paragraph","data":{"text":"أعلنت منصة الاتحاد الدولي لكرة القدم \\"فيفا\\" الخاصة بتغيير الجنسية الرياضية، عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href=\\"&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86&quot;\\">زين الدين زيدان</a>، على تمثيل منتخب الجزائر خلال المرحلة المقبلة، بعد أن لعب سابقًا بقميص منتخب فرنسا في الفئات السنية."}},{"id":"cChJmMG8b-","type":"paragraph","data":{"text":"وكان لوكا قد تُوّج مع منتخب فرنسا ببطولة يورو تحت 17 عامًا في عام 2015، لكنه قرر اليوم تغيير انتمائه الدولي والانضمام إلى كتيبة \\"محاربي الصحراء\\"."}},{"id":"9X5EtOt5BV","type":"paragraph","data":{"text":"شارك لوكا هذا الموسم في 4 مباريات مع غرناطة، استقبل خلالها 10 أهداف، دون أن ينجح في الحفاظ على شباكه نظيفة حتى الآن."}},{"id":"5V5YjSPinr","type":"paragraph","data":{"text":"بدأ لوكا زيدان مسيرته الكروية داخل أكاديمية ريال مدريد، وتدرج في مختلف فئاته العمرية حتى وصل للفريق الأول."}},{"id":"UROJgAD4xX","type":"paragraph","data":{"text":"ثم انتقل على سبيل الإعارة إلى راسينج سانتاندير في صيف 2019، قبل أن يرحل بشكل نهائي إلى رايو فايكانو عام 2020."}},{"id":"NMsyZiaMtM","type":"paragraph","data":{"text":"وفي 2022، انضم إلى إيبار، ثم انتقل إلى غرناطة في صيف 2024 مقابل نصف مليون يورو."}},{"id":"eFkqZCDPER","type":"paragraph","data":{"text":""}}],"version":"2.31.0"}`;

console.log('=== Test de parsing du contenu avec liens échappés ===\n');

console.log('Contenu original:');
console.log(testContent);
console.log('\n' + '='.repeat(50) + '\n');

console.log('Contenu parsé:');
const parsed = parseEditorJsToHtml(testContent);
console.log(parsed);
console.log('\n' + '='.repeat(50) + '\n');

// Test spécifique du lien problématique
const problematicLink = `أعلنت منصة الاتحاد الدولي لكرة القدم "فيفا" الخاصة بتغيير الجنسية الرياضية، عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href="&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86&quot;">زين الدين زيدان</a>، على تمثيل منتخب الجزائر خلال المرحلة المقبلة، بعد أن لعب سابقًا بقميص منتخب فرنسا في الفئات السنية.`;

console.log('Lien problématique original:');
console.log(problematicLink);
console.log('\nLien après nettoyage:');
console.log(cleanEscapedText(problematicLink));
console.log('\n' + '='.repeat(50) + '\n');

// Vérifier que le lien est correctement formé
const cleanedResult = cleanEscapedText(problematicLink);
const linkMatch = cleanedResult.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/);

if (linkMatch) {
  console.log('✅ Lien extrait avec succès:');
  console.log('URL:', linkMatch[1]);
  console.log('Texte:', linkMatch[2]);
  
  // Vérifier que l'URL est valide
  try {
    new URL(linkMatch[1]);
    console.log('✅ URL valide');
  } catch (e) {
    console.log('❌ URL invalide:', e.message);
  }
} else {
  console.log('❌ Impossible d\'extraire le lien');
}