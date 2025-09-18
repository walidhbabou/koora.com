import React from "react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
    <SEO 
      title="سياسة الخصوصية | كورة - حماية بياناتك"
      description="اطلع على سياسة الخصوصية الخاصة بموقع كورة وكيفية حماية بياناتك الشخصية عند استخدام خدماتنا."
      keywords={["سياسة الخصوصية", "حماية البيانات", "الأمان", "خصوصية المستخدم"]}
      type="website"
      noindex={false}
    />
    <Header />

    {/* Contenu principal */}
    <main className="container mx-auto flex-grow py-8 px-4" dir="rtl">
      <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]">
          سياسة الخصوصية لموقع Koora.com
        </h1>

        <div className="space-y-6 text-lg leading-relaxed dark:text-gray-200">
          {/* 1. مقدمة */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">1. مقدمة</h2>
          <p>
            نحن في <span className="font-semibold text-[#1dbf73]">koora.com</span> ملتزمون بحماية خصوصيتك وضمان أن يتم استخدام معلوماتك الشخصية وفقًا للقوانين المعمول بها. 
            توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لبياناتك الشخصية عند استخدامك لموقعنا.
          </p>

          {/* 2. البيانات التي نجمعها */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">2. البيانات التي نجمعها</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>
              <span className="font-semibold">المعلومات الشخصية:</span> مثل اسمك، عنوان البريد الإلكتروني، أو أي معلومات شخصية أخرى تقدمها طواعية عند التسجيل أو الاشتراك.
            </li>
            <li>
              <span className="font-semibold">البيانات التقنية:</span> مثل عنوان IP الخاص بك، نوع المتصفح، نظام التشغيل، ومعلومات حول كيفية تفاعلك مع موقعنا.
            </li>
            <li>
              <span className="font-semibold">ملفات تعريف الارتباط:</span> نستخدم الكوكيز لتحسين تجربتك على الموقع. يمكنك الاطلاع على سياسة ملفات تعريف الارتباط للمزيد.
            </li>
          </ul>

          {/* 3. كيفية استخدام البيانات */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">3. كيفية استخدام البيانات</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>تحسين خدمات الموقع: لتخصيص تجربتك وتقديم محتوى مناسب.</li>
            <li>التواصل معك: لإرسال التحديثات أو الرد على استفساراتك.</li>
            <li>الأمان: لمنع محاولات الاحتيال وتحليل الأنشطة المشبوهة.</li>
            <li>الإعلانات المخصصة: بناءً على اهتماماتك وسلوكك على الموقع.</li>
          </ul>
          <p>
            <span className="font-semibold">الإعلانات وملفات تعريف الارتباط الخاصة بالأطراف الثالثة:</span> 
            يستخدم موقعنا خدمات مثل Google AdMob لعرض إعلانات مخصصة. 
            يمكنك مراجعة سياسة خصوصية Google لمعرفة كيفية استخدام بياناتك وإدارة الإعلانات.
          </p>

          {/* 4. مشاركة البيانات */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">4. مشاركة البيانات</h2>
          <p>نحن لا نبيع أو نؤجر بياناتك الشخصية. ومع ذلك، قد نشاركها في الحالات التالية:</p>
          <ul className="list-disc pr-6 space-y-2">
            <li>مع مزودي الخدمة (مثل التحليلات أو التسويق) بشرط الالتزام بسياسات الخصوصية.</li>
            <li>للامتثال للقانون أو استجابة لطلبات السلطات.</li>
          </ul>

          {/* 5. حماية البيانات */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">5. حماية البيانات</h2>
          <p>
            نتخذ تدابير أمنية مناسبة لحماية بياناتك من الوصول غير المصرح به أو التعديل أو الإفصاح. 
            ومع ذلك، لا يمكننا ضمان الأمان الكامل للبيانات المرسلة عبر الإنترنت.
          </p>

          {/* 6. حقوقك */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">6. حقوقك</h2>
          <ul className="list-disc pr-6 space-y-2">
            <li>الوصول إلى بياناتك وطلب نسخة منها.</li>
            <li>تصحيح أي معلومات غير دقيقة.</li>
            <li>حذف بياناتك في ظروف معينة.</li>
            <li>تقييد معالجة بياناتك.</li>
            <li>الاعتراض على المعالجة لأغراض التسويق المباشر.</li>
          </ul>
          <p>
            للمزيد حول حقوقك بموجب <span className="font-semibold">GDPR</span>، يرجى زيارة صفحة اللائحة العامة لحماية البيانات الخاصة بنا.
          </p>

          {/* 7. ملفات تعريف الارتباط */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">7. استخدام ملفات تعريف الارتباط</h2>
          <p>
            لمعرفة المزيد عن كيفية استخدامنا للكوكيز وكيفية إدارتها، يرجى زيارة صفحة سياسة ملفات تعريف الارتباط.
          </p>

          {/* 8. روابط الطرف الثالث */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">8. روابط الطرف الثالث</h2>
          <p>
            قد يحتوي موقعنا على روابط لمواقع خارجية. نحن لسنا مسؤولين عن سياسات الخصوصية الخاصة بها، 
            لذا ننصحك بمراجعتها قبل تقديم أي بيانات.
          </p>

          {/* 9. التغييرات */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">9. التغييرات على سياسة الخصوصية</h2>
          <p>
            قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في ممارساتنا أو القوانين. 
            سيتم نشر أي تحديثات على هذه الصفحة.
          </p>

          {/* 10. الاتصال بنا */}
          <h2 className="text-2xl font-semibold text-[#1dbf73]">10. الاتصال بنا</h2>
          <p>
            إذا كانت لديك أي استفسارات، يمكنك التواصل معنا عبر البريد الإلكتروني: 
            <span className="font-medium text-[#1dbf73]"> content@koora.com</span> 
            أو من خلال نموذج الاتصال على موقعنا.
          </p>
        </div>
      </div>
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

export default Privacy;
