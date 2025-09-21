// Test pour le contenu spécifique fourni par l'utilisateur
import { parseEditorJsToHtml } from './src/utils/parseEditorJs';

const testContent = `{"time":1758316942701,"blocks":[{"id":"tpBie86iSR","type":"paragraph","data":{"text":"ينتظر نجم منتخب مصر المصري <a href=\"https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD\&quot;\">محمد صلاح</a>، لاعب ليفربول الإنجليزي، رقمين قياسيين، خلال مباراة \"الريدز\" ضد إيفرتون، مساء غدٍ السبت، في الدوري الإنجليزي."}},{"id":"9MR0CA0fJ-","type":"paragraph","data":{"text":"ويحتاج محمد صلاح هدف وحيد ضد إيفرتون، لمعادلة رقم أسطورة ليفربول ستيفن جيرارد، الذي سجل 9 أهداف، فيما أحرز صلاح 8 أهداف."}},{"id":"bXxdCDePJd","type":"paragraph","data":{"text":"وفي المجمل، يتطلع محمد صلاح للوصول إلى هدفه رقم 250 مع ليفربول، في مختلف المنافسات، إذ إنه يمتلك 248 هدفًا، خلال 407 مباريات."}},{"id":"fB88S1AaLZ","type":"paragraph","data":{"text":"ويستضيف فريق <a href=\"\&quot\">https://beta.koora.com/team/40\&quot\">ليفربول</a> نظيره إيفرتون ظهر اليوم السبت الموافق 20-9-2025، في تمام الساعة 2:30 مساءً بتوقيت القاهرة ومكة المكرمة، فى إطار منافسات الجولة الخامسة من الدوري الإنجليزي الممتاز."}},{"id":"dn1aP9zxrf","type":"paragraph","data":{"text":"ويتصدر ليفربول جدول ترتيب الدوري الإنجليزي برصيد 12 نقطة، بينما يحتل فريق إيفرتون المركز السادس برصيد 7 نقاط."}},{"id":"1dgK7g9oWY","type":"table","data":{"withHeadings":false,"stretched":false,"content":[["المباراة ","الموعد ","التوقيت","القناة والمعلق"],["<b>ليفربول</b> ضد إيفرتون","السبت 20 سبتمبر 2025","2:30 مساءً بتوقيت مصر والسعودية","بي إن سبورت 1 بصوت حسن العيدروس"]]}},{"id":"c77mfeb-kh","type":"paragraph","data":{"text":"\\n\\n"}}],"version":"2.31.0"}`;

console.log('=== Test de parsing du contenu ===');
console.log('Contenu original (100 premiers caractères):', testContent.substring(0, 100));

try {
  const result = parseEditorJsToHtml(testContent);
  console.log('\\n=== Résultat du parsing ===');
  console.log('Longueur du résultat:', result.length);
  console.log('Contient "news-table":', result.includes('news-table'));
  console.log('Contient "ليفربول":', result.includes('ليفربول'));
  console.log('\\nPremiers 500 caractères du résultat:');
  console.log(result.substring(0, 500));
  
  if (result.includes('<table')) {
    console.log('\\n✅ Tableau détecté dans le résultat');
    const tableMatch = result.match(/<table[^>]*>.*?<\/table>/s);
    if (tableMatch) {
      console.log('Contenu du tableau:', tableMatch[0]);
    }
  } else {
    console.log('\\n❌ Aucun tableau trouvé dans le résultat');
  }
  
} catch (error) {
  console.error('Erreur de parsing:', error);
}