import React, { useState } from 'react';
import { parseEditorJsToHtml } from '@/utils/parseEditorJs';
import DOMPurify from 'dompurify';

const NewsContentTest: React.FC = () => {
  // Données JSON exactes comme fournies dans l'exemple
  const [newsData] = useState({
    "time": 1758316942701,
    "blocks": [
      {
        "id": "tpBie86iSR",
        "type": "paragraph",
        "data": {
          "text": "ينتظر نجم منتخب مصر المصري <a href=\"https://ar.wikipedia.org/wiki/%D9%85%D8%AD%D9%85%D8%AF_%D8%B5%D9%84%D8%A7%D8%AD\">محمد صلاح</a>، لاعب ليفربول الإنجليزي، رقمين قياسيين، خلال مباراة \"الريدز\" ضد إيفرتون، مساء غدٍ السبت، في الدوري الإنجليزي."
        }
      },
      {
        "id": "9MR0CA0fJ-",
        "type": "paragraph",
        "data": {
          "text": "ويحتاج محمد صلاح هدف وحيد ضد إيفرتون، لمعادلة رقم أسطورة ليفربول ستيفن جيرارد، الذي سجل 9 أهداف، فيما أحرز صلاح 8 أهداف."
        }
      },
      {
        "id": "bXxdCDePJd",
        "type": "paragraph",
        "data": {
          "text": "وفي المجمل، يتطلع محمد صلاح للوصول إلى هدفه رقم 250 مع ليفربول، في مختلف المنافسات، إذ إنه يمتلك 248 هدفًا، خلال 407 مباريات."
        }
      },
      {
        "id": "fB88S1AaLZ",
        "type": "paragraph",
        "data": {
          "text": "ويستضيف فريق <a href=\"https://beta.koora.com/team/40\">ليفربول</a> نظيره إيفرتون ظهر اليوم السبت الموافق 20-9-2025، في تمام الساعة 2:30 مساءً بتوقيت القاهرة ومكة المكرمة، فى إطار منافسات الجولة الخامسة من الدوري الإنجليزي الممتاز."
        }
      },
      {
        "id": "dn1aP9zxrf",
        "type": "paragraph",
        "data": {
          "text": "ويتصدر ليفربول جدول ترتيب الدوري الإنجليزي برصيد 12 نقطة، بينما يحتل فريق إيفرتون المركز السادس برصيد 7 نقاط."
        }
      },
      {
        "id": "1dgK7g9oWY",
        "type": "table",
        "data": {
          "withHeadings": false,
          "stretched": false,
          "content": [
            ["المباراة ", "الموعد ", "التوقيت", "القناة والمعلق"],
            ["<b>ليفربول</b> ضد إيفرتون", "السبت 20 سبتمبر 2025", "2:30 مساءً بتوقيت مصر والسعودية", "بي إن سبورت 1 بصوت حسن العيدروس"]
          ]
        }
      },
      {
        "id": "c77mfeb-kh",
        "type": "paragraph",
        "data": {
          "text": "\n\n"
        }
      }
    ],
    "version": "2.31.0"
  });

  // Exemples de contenus avec embeds
  const [embedExamples] = useState([
    // YouTube Embed
    {
      id: "youtube-example",
      type: "embed",
      data: {
        service: "youtube",
        source: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        caption: "فيديو من YouTube"
      }
    },
    // Twitter Embed
    {
      id: "twitter-example",
      type: "embed",
      data: {
        service: "twitter",
        source: "https://twitter.com/FCBarcelona/status/1234567890123456789",
        caption: "تغريدة من برشلونة"
      }
    },
    // Header Example
    {
      id: "header-example",
      type: "header",
      data: {
        text: "عنوان رئيسي مهم",
        level: 2
      }
    },
    // Quote Example
    {
      id: "quote-example",
      type: "quote",
      data: {
        text: "كرة القدم ليست مجرد لعبة، إنها شغف وحياة",
        caption: "بيب غوارديولا"
      }
    },
    // List Example
    {
      id: "list-example",
      type: "list",
      data: {
        items: [
          "ليفربول في المركز الأول",
          "مانشستر سيتي في المركز الثاني", 
          "أرسنال في المركز الثالث",
          "تشيلسي في المركز الرابع"
        ]
      }
    }
  ]);

  // Parse le contenu principal
  const parsedContent = parseEditorJsToHtml(JSON.stringify(newsData));

  // Parse les exemples d'embeds
  const parsedEmbeds = embedExamples.map(block => 
    parseEditorJsToHtml(JSON.stringify({ blocks: [block] }))
  );

  // Fonction pour charger un fichier JSON
  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          console.log('JSON chargé:', jsonData);
          
          // Tenter de parser le nouveau contenu
          const newParsedContent = parseEditorJsToHtml(JSON.stringify(jsonData));
          console.log('Contenu parsé:', newParsedContent);
          
          // Afficher une alerte avec un aperçu
          alert(`Contenu chargé avec succès!\nBlocs trouvés: ${jsonData.blocks?.length || 0}\nVersion: ${jsonData.version || 'N/A'}`);
        } catch (error) {
          console.error('Erreur JSON:', error);
          alert('Erreur lors de la lecture du fichier JSON: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header avec informations */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">اختبار عارض محتوى الأخبار</h1>
          <div className="text-sm text-gray-500">
            Version: {newsData.version}
          </div>
        </div>
        
        {/* Option pour charger un nouveau fichier JSON */}
        <div className="border-t pt-4">
          <label htmlFor="json-upload" className="block text-sm font-medium text-gray-700 mb-2">
            تحميل ملف JSON جديد للاختبار:
          </label>
          <input
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleFileLoad}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <span>عدد البلوكات الأساسية: {newsData.blocks.length}</span>
          <span className="mx-2">|</span>
          <span>التاريخ: {new Date(newsData.time).toLocaleString('ar')}</span>
        </div>
      </div>

      {/* المحتوى الأساسي المُحسن */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-blue-600">المحتوى الأساسي (مُحسن)</h2>
        <div 
          className="news-content prose prose-slate dark:prose-invert max-w-none"
          dir="auto"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(parsedContent) 
          }}
        />
      </div>

      {/* أمثلة على أنواع المحتوى المختلفة */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-xl font-bold mb-4 text-green-600">أمثلة على أنواع المحتوى المدعومة</h2>
        <div className="space-y-6">
          {parsedEmbeds.map((content, index) => (
            <div key={`embed-${embedExamples[index].id}`} className="border-b pb-4 last:border-b-0">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {embedExamples[index].type.toUpperCase()} Block
              </h3>
              <div 
                className="news-content"
                dir="auto"
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(content) 
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* معلومات تقنية */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">معلومات تقنية متقدمة</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>الأنواع المدعومة:</strong> paragraph, header, list, table, quote, image, embed, delimiter, raw, warning</p>
          <p><strong>منصات التواصل:</strong> YouTube, Twitter/X, Instagram, Vimeo</p>
          <p><strong>ميزات متقدمة:</strong> تنظيف الروابط، معالجة الأخطاء، تصميم متجاوب</p>
          <p><strong>الأمان:</strong> تنظيف HTML باستخدام DOMPurify</p>
          <p><strong>معرف الطابع الزمني:</strong> {newsData.time}</p>
        </div>
      </div>

      {/* الستايل المُحسن للمحتوى */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* نفس الستايلات من NewsDetails مع تحسينات إضافية */
          .news-content {
            line-height: 1.8;
            font-size: 16px;
            color: #333;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
          
          .news-content p {
            margin: 16px 0;
            text-align: justify;
            line-height: 1.8;
          }
          
          .news-content a {
            color: #0066cc;
            text-decoration: underline;
            font-weight: 500;
            transition: all 0.2s ease;
            border-radius: 3px;
            padding: 1px 2px;
          }
          
          .news-content a:hover {
            color: #004499;
            background-color: rgba(0, 102, 204, 0.1);
          }
          
          .news-content h1, .news-content h2, .news-content h3, 
          .news-content h4, .news-content h5, .news-content h6 {
            font-weight: bold;
            margin: 24px 0 16px 0;
            color: #222;
            line-height: 1.3;
          }
          
          .news-content h1 { 
            font-size: 2em; 
            border-bottom: 3px solid #0066cc; 
            padding-bottom: 10px; 
          }
          .news-content h2 { 
            font-size: 1.5em; 
            color: #0066cc; 
          }
          .news-content h3 { 
            font-size: 1.3em; 
            color: #333; 
          }
          
          .news-content table {
            margin: 24px 0;
            border-collapse: collapse;
            width: 100%;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .news-content th {
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
            color: white;
            font-weight: bold;
            padding: 16px 12px;
            text-align: center;
            font-size: 14px;
            border: none;
          }
          
          .news-content td {
            padding: 14px 12px;
            border-bottom: 1px solid #e9ecef;
            text-align: center;
            font-size: 14px;
            transition: background-color 0.2s ease;
          }
          
          .news-content tr:hover td {
            background-color: #f1f3f4;
          }
          
          .news-content blockquote {
            border-right: 4px solid #0066cc;
            padding: 20px 24px;
            margin: 24px 0;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            font-style: italic;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            position: relative;
          }
          
          .news-content blockquote::before {
            content: """;
            font-size: 3em;
            color: #0066cc;
            position: absolute;
            top: -5px;
            right: 15px;
            font-family: Georgia, serif;
          }
          
          .news-content ul, .news-content ol {
            margin: 16px 0;
            padding-right: 24px;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 16px 24px 16px 16px;
          }
          
          .news-content li {
            margin: 8px 0;
            line-height: 1.6;
          }
          
          /* Animations */
          .news-content * {
            animation: fadeInUp 0.6s ease-out;
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `
      }} />
    </div>
  );
};

export default NewsContentTest;