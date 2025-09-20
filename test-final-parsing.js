// Test final de la fonction de parsing avec l'exemple fourni
import { parseEditorJsToHtml } from './src/utils/parseEditorJs.ts';

// Contenu de test exact de l'utilisateur avec les liens malformés
const testContent = `{"time":1758315571526,"blocks":[{"id":"6y5ZoYsOHN","type":"paragraph","data":{"text":"أعلنت منصة الاتحاد الدولي لكرة القدم \"فيفا\" الخاصة بتغيير الجنسية الرياضية، عن موافقة لوكا زيدان، نجل أسطورة الكرة الفرنسية&nbsp;<a href=\"\\&quot;https://ar.wikipedia.org/wiki/%D8%B2%D9%8A%D9%86_%D8%A7%D9%84%D8%AF%D9%8A%D9%86_%D8%B2%D9%8A%D8%AF%D8%A7%D9%86\\&quot;\">زين الدين زيدان</a>، على تمثيل منتخب الجزائر خلال المرحلة المقبلة، بعد أن لعب سابقًا بقميص منتخب فرنسا في الفئات السنية."}},{"id":"cChJmMG8b-","type":"paragraph","data":{"text":"وكان لوكا قد تُوّج مع منتخب فرنسا ببطولة يورو تحت 17 عامًا في عام 2015، لكنه قرر اليوم تغيير انتمائه الدولي والانضمام إلى كتيبة \"محاربي الصحراء\"."}},{"id":"9X5EtOt5BV","type":"paragraph","data":{"text":"شارك لوكا هذا الموسم في 4 مباريات مع غرناطة، استقبل خلالها 10 أهداف، دون أن ينجح في الحفاظ على شباكه نظيفة حتى الآن."}},{"id":"5V5YjSPinr","type":"paragraph","data":{"text":"بدأ لوكا زيدان مسيرته الكروية داخل أكاديمية ريال مدريد، وتدرج في مختلف فئاته العمرية حتى وصل للفريق الأول."}},{"id":"UROJgAD4xX","type":"paragraph","data":{"text":"ثم انتقل على سبيل الإعارة إلى راسينج سانتاندير في صيف 2019، قبل أن يرحل بشكل نهائي إلى رايو فايكانو عام 2020."}},{"id":"NMsyZiaMtM","type":"paragraph","data":{"text":"وفي 2022، انضم إلى إيبار، ثم انتقل إلى غرناطة في صيف 2024 مقابل نصف مليون يورو."}},{"id":"eFkqZCDPER","type":"paragraph","data":{"text":""}}],"version":"2.31.0"}`;

// Test avec contenu tableaux
const tableContent = `{"time":1758316942701,"blocks":[{"id":"1dgK7g9oWY","type":"table","data":{"withHeadings":false,"stretched":false,"content":[["السبت","ليفربول ضد إيفرتون"],["الأحد","مصر والسعودية","وقت 2:30 مساء بتوقيت مصر والسعودية","وقت 1 بصوت حسن العيدروس"]]}}],"version":"2.31.0"}`;

console.log('🔍 Test du parsing avec le contenu problématique...\n');

try {
  const result = parseEditorJsToHtml(testContent);
  console.log('✅ Parsing réussi !');
  console.log('\n📝 Contenu parsé :');
  console.log(result);
  
  // Vérifier que les liens sont corrects
  if (result.includes('href="https://ar.wikipedia.org')) {
    console.log('\n✅ Lien corrigé : Les URLs sont propres sans échappement');
  } else {
    console.log('\n❌ Problème de lien : Les URLs contiennent encore des échappements');
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

console.log('\n' + '='.repeat(60));
console.log('🔍 Test du parsing avec tableau...\n');

try {
  const tableResult = parseEditorJsToHtml(tableContent);
  console.log('✅ Parsing tableau réussi !');
  console.log('\n📝 Contenu tableau parsé :');
  console.log(tableResult);
  
  // Vérifier que le tableau est affiché
  if (tableResult.includes('<table')) {
    console.log('\n✅ Tableau : Le tableau HTML est généré correctement');
  } else {
    console.log('\n❌ Problème tableau : Le tableau n\'est pas généré');
  }
  
} catch (error) {
  console.log('❌ Erreur de parsing tableau :', error);
}