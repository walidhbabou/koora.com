import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => (
  <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
    <Header />
    <main className="container mx-auto flex-grow py-8 px-4">
      <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-8 text-right" dir="rtl">
        <h2 className="text-xl font-bold mb-4 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">من نحن</h2>
        <p className="mb-2 dark:text-gray-200" dir="rtl">مرحبًا بكم في <span className="font-semibold" dir="rtl">كورة</span>!</p>
        <p className="mb-4 dark:text-gray-200" dir="rtl">نحن فريق متخصص في تقديم تحديثات لحظية دقيقة عن الأحداث الرياضية، بخبرات تمتد لعشرات السنين. يسعدنا أن نكون وجهتك الأولى لعالم الرياضة، حيث نسعى لتلبية احتياجات عشاق الرياضة في جميع أنحاء العالم.</p>
        
        <h2 className="text-lg font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">رؤيتنا:</h2>
        <p className="mb-4 dark:text-gray-200" dir="rtl">نسعى لأن نكون الرائدين في تقديم المعلومات الرياضية الموثوقة، مع التركيز على الدقة وسرعة التحديث. نحن هنا لضمان أن تكون على اطلاع دائم بأحدث الأخبار والنتائج.</p>

        <h2 className="text-lg font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">قيمنا:</h2>
        <ul className="list-none pr-4 mb-4" dir="rtl">
          <li className="mb-1 dark:text-gray-200" dir="rtl"><span className="font-bold text-[#1dbf73] dark:text-[#1dbf73]">الدقة:</span> نضمن أن المعلومات التي نقدمها دقيقة وموثوقة.</li>
          <li className="mb-1 dark:text-gray-200"><span className="font-bold text-[#1dbf73] dark:text-[#1dbf73]">الشغف:</span> نحن نحب الرياضة، ونسعى لنقل هذا الشغف لزوارنا.</li>
          <li className="mb-1 dark:text-gray-200"><span className="font-bold text-[#1dbf73] dark:text-[#1dbf73]">التفاعل:</span> نحن نستمع إلى تعليقاتكم ونحرص على تحسين خدماتنا باستمرار.</li>
        </ul>
        
        <h2 className="text-lg font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]"dir="rtl">مميزاتنا:</h2>
        <ul className="list-none pr-4 mb-4" dir="rtl">
          <li className="mb-1 dark:text-gray-200">متابعة لحظية دقيقة للأحداث الرياضية.</li>
          <li className="mb-1 dark:text-gray-200">التعرف على مواعيد المباريات حسب دولتك.</li>
          <li className="mb-1 dark:text-gray-200">معلومات عن القنوات الناقلة والمعلقين.</li>
          <li className="mb-1 dark:text-gray-200">ترتيب البطولات والهدافين.</li>
          <li className="mb-1 dark:text-gray-200">تحديثات مستمرة حول آخر المستجدات الرياضية.</li>
        </ul>
        
        <p className="mt-6 font-semibold dark:text-gray-200" dir="rtl">نشكركم على دعمكم وثقتكم بنا. نتطلع إلى تقديم أفضل تجربة رياضية لكم!</p>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;