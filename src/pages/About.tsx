import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => (
  <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
    <Header />
    <main className="container mx-auto flex-grow py-8 px-4">
      <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-8 text-right" dir="rtl">
        
        <h1 className="text-2xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">من نحن</h1>
        <p className="mb-4 dark:text-gray-200" dir="rtl">
          مرحباً بكم في <span className="font-semibold" dir="rtl">Koora.com</span>، المصدر الأول لكل ما يتعلق بعالم كرة القدم! 
          نحن موقع رياضي شامل يهدف إلى تقديم أحدث الأخبار، النتائج، والتحليلات من عالم كرة القدم، سواء على الصعيد المحلي، الإقليمي، أو العالمي.
        </p>

        {/* --- رؤيتنا --- */}
        <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">رؤيتنا</h2>
        <p className="mb-4 dark:text-gray-200" dir="rtl">
          في Koora.com، نسعى إلى أن نكون الوجهة الأولى لعشاق كرة القدم في العالم العربي، 
          من خلال توفير تغطية شاملة للمباريات، البطولات، وأخبار الأندية واللاعبين. 
          نعمل على تقديم محتوى موثوق ومحدث باستمرار لنبقيكم على اطلاع دائم بكل ما يحدث في الساحة الكروية.
        </p>

        {/* --- رسالتنا --- */}
        <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">رسالتنا</h2>
        <ul className="list-disc pr-6 space-y-2 dark:text-gray-200" dir="rtl">
          <li>تغطية شاملة لأهم البطولات والدوريات العالمية والمحلية.</li>
          <li>نقل مباشر للمباريات مع تحديث مستمر للنتائج.</li>
          <li>تحليلات فنية معمقة لأداء الفرق واللاعبين.</li>
          <li>إحصائيات دقيقة تساعد المشجعين على متابعة تفاصيل اللعبة.</li>
          <li>أخبار الانتقالات وأحدث ما يدور في عالم سوق اللاعبين.</li>
        </ul>

        {/* --- فريقنا --- */}
        <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">فريقنا</h2>
        <p className="mb-4 dark:text-gray-200" dir="rtl">
          يتألف فريق Koora.com من نخبة من الصحفيين الرياضيين والمحللين والخبراء في عالم كرة القدم. 
          نعمل على مدار الساعة لتقديم محتوى دقيق وموضوعي يلبي تطلعات جمهورنا في العالم العربي.
        </p>

        {/* --- ماذا نقدم --- */}
        <h2 className="text-xl font-bold mt-6 mb-2 text-[#1dbf73] dark:text-[#1dbf73]" dir="rtl">ماذا نقدم</h2>
        <ul className="list-disc pr-6 space-y-2 dark:text-gray-200" dir="rtl">
          <li>آخر الأخبار الرياضية من الدوريات الكبرى مثل الدوري الإنجليزي، الإسباني، الإيطالي، السعودي، والمصري.</li>
          <li>نتائج مباشرة للمباريات المحلية والدولية.</li>
          <li>إحصائيات وتوقعات للمباريات واللاعبين.</li>
          <li>فيديوهات وملخصات لأبرز اللحظات في المباريات.</li>
          <li>مقالات تحليلية لأداء الفرق وخطط المدربين.</li>
        </ul>

        <p className="mt-6 font-semibold dark:text-gray-200" dir="rtl">
          نحن في Koora.com نؤمن بأن كرة القدم ليست مجرد لعبة، بل هي شغف يجمع بين الملايين حول العالم. 
          تابعونا لتكونوا دائماً في قلب الحدث الكروي!
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
