import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
    {/* Header */}
    <Header />

    {/* Contenu principal */}
    <main className="container mx-auto flex-grow py-8 px-4" dir="rtl">
      <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]">سياسة الخصوصية</h1>

        <div className="space-y-6 text-lg leading-relaxed">
          <p className="dark:text-gray-200">
            في <span className="font-semibold text-[#1dbf73]">كورة</span>، نولي أهمية كبيرة
            لحماية خصوصيتك. توضح هذه السياسة كيفية جمع بياناتك واستخدامها
            والمحافظة عليها.
          </p>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73] dark:text-[#1dbf73]">المعلومات التي نقوم بجمعها:</h2>
          <ul className="list-disc pr-6 space-y-2 dark:text-gray-200">
            <li>المعلومات الشخصية التي تقدمها عند التسجيل أو التواصل معنا.</li>
            <li>معلومات الاستخدام مثل الصفحات التي تزورها ومدة بقائك في الموقع.</li>
            <li>ملفات تعريف الارتباط (Cookies) لتحسين تجربتك.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73] dark:text-[#1dbf73]">كيفية استخدام معلوماتك:</h2>
          <ul className="list-disc pr-6 space-y-2 dark:text-gray-200">
            <li>تقديم محتوى وتجربة مستخدم مخصصة.</li>
            <li>تحسين خدماتنا وتطوير الموقع باستمرار.</li>
            <li>التواصل معك عند الحاجة بخصوص التحديثات أو الدعم.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73] dark:text-[#1dbf73]">حماية البيانات:</h2>
          <p className="dark:text-gray-200">
            نحن نتخذ جميع الإجراءات الأمنية اللازمة لحماية بياناتك من الوصول غير
            المصرح به أو التعديل أو الإفصاح.
          </p>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73] dark:text-[#1dbf73]">مشاركة المعلومات:</h2>
          <p className="dark:text-gray-200">
            لا نقوم بمشاركة بياناتك مع أطراف ثالثة إلا إذا كان ذلك مطلوبًا بموجب
            القانون أو لحمايتك وحماية خدماتنا.
          </p>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73] dark:text-[#1dbf73]">حقوقك:</h2>
          <p className="dark:text-gray-200">
            لديك الحق في طلب تعديل أو حذف بياناتك الشخصية في أي وقت عبر التواصل
            معنا.
          </p>

          <p className="mt-6 font-semibold dark:text-gray-200">
            باستخدامك لموقع <span className="text-[#1dbf73]">كورة</span>، فإنك
            توافق على سياسة الخصوصية هذه.
          </p>
        </div>
      </div>
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

export default Privacy;