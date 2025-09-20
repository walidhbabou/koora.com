// Test spécifique pour l'affichage des tableaux
import { parseEditorJsToHtml } from './src/utils/parseEditorJs.js';

// Contenu de test avec tableau similaire à celui fourni par l'utilisateur
const tableTestContent = `{"time":1758316942701,"blocks":[{"id":"1dgK7g9oWY","type":"table","data":{"withHeadings":false,"stretched":false,"content":[["السبت","ليفربول ضد إيفرتون"],["الأحد","مصر والسعودية","وقت 2:30 مساء بتوقيت مصر والسعودية","وقت 1 بصوت حسن العيدروس"]]}}],"version":"2.31.0"}`;

// Test avec en-têtes
const tableWithHeadersContent = `{"time":1758316942701,"blocks":[{"id":"1dgK7g9oWY","type":"table","data":{"withHeadings":true,"stretched":false,"content":[["اليوم","المباراة","التوقيت","التعليق"],["السبت","ليفربول ضد إيفرتون","مساء","الشوطي"],["الأحد","مصر والسعودية","2:30 مساء","حسن العيدروس"]]}}],"version":"2.31.0"}`;

console.log('🔍 Test de l\'affichage des tableaux...\n');

try {
  console.log('📊 Test 1: Tableau sans en-têtes');
  const result1 = parseEditorJsToHtml(tableTestContent);
  console.log('✅ Parsing réussi !');
  console.log('\n📝 HTML généré :');
  console.log(result1);
  
  // Vérifier que le tableau est affiché
  if (result1.includes('<table')) {
    console.log('\n✅ Tableau : Structure HTML générée correctement');
  } else {
    console.log('\n❌ Problème : Pas de structure de tableau trouvée');
  }
  
  // Vérifier le contenu arabe
  if (result1.includes('السبت') && result1.includes('ليفربول')) {
    console.log('✅ Contenu arabe : Texte arabe affiché correctement');
  } else {
    console.log('❌ Problème : Contenu arabe manquant');
  }
  
  // Vérifier le wrapper responsive
  if (result1.includes('overflow-x: auto')) {
    console.log('✅ Responsive : Wrapper scroll horizontal ajouté');
  } else {
    console.log('❌ Problème : Pas de wrapper responsive');
  }

} catch (error) {
  console.log('❌ Erreur de parsing tableau :', error);
}

console.log('\n' + '='.repeat(60));

try {
  console.log('📊 Test 2: Tableau avec en-têtes');
  const result2 = parseEditorJsToHtml(tableWithHeadersContent);
  console.log('✅ Parsing réussi !');
  console.log('\n📝 HTML généré :');
  console.log(result2);
  
  // Vérifier les en-têtes
  if (result2.includes('<th')) {
    console.log('\n✅ En-têtes : Balises TH générées correctement');
  } else {
    console.log('\n❌ Problème : Pas d\'en-têtes TH trouvés');
  }
  
  // Vérifier le style des en-têtes
  if (result2.includes('font-weight: bold')) {
    console.log('✅ Style : En-têtes en gras');
  } else {
    console.log('❌ Problème : En-têtes pas en gras');
  }

} catch (error) {
  console.log('❌ Erreur de parsing tableau avec en-têtes :', error);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Tests des tableaux terminés !');