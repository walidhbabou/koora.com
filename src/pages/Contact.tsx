import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => (
  <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
    {/* Header */}
    <Header />

    {/* Contenu principal */}
    <main className="container mx-auto flex-grow py-8 px-4" dir="rtl">
      <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#1dbf73] dark:text-[#1dbf73]">
          اتصل بنا
        </h1>

        <div className="space-y-6 text-lg leading-relaxed dark:text-gray-200">
          <p>
            نحن في <span className="font-semibold text-[#1dbf73]">Koora.com</span> 
            نرحب بجميع استفساراتكم، اقتراحاتكم، وآرائكم. إذا كانت لديكم أي أسئلة 
            أو ترغبون في التواصل معنا، فلا تترددوا في مراسلتنا. فريق الدعم لدينا 
            مستعد للرد على جميع استفساراتكم في أقرب وقت ممكن.
          </p>

          <h2 className="text-2xl font-semibold mt-6 text-[#1dbf73]">طرق التواصل:</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">📧 البريد الإلكتروني:</h3>
              <p>
                <span className="font-medium text-[#1dbf73]">support@koora.com</span> – 
                للأمور المتعلقة بالدعم الفني أو الاستفسارات العامة.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">📝 الشكاوى والاقتراحات:</h3>
              <p>
                <span className="font-medium text-[#1dbf73]">feedback@koora.com</span> – 
                إذا كانت لديكم اقتراحات لتحسين الموقع أو ترغبون في تقديم شكوى، 
                نحن هنا للاستماع إليكم.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">📢 الإعلانات والشراكات:</h3>
              <p>
                <span className="font-medium text-[#1dbf73]">ads@koora.com</span> – 
                إذا كنتم ترغبون في الإعلان على موقعنا أو الشراكة معنا، 
                يرجى التواصل عبر هذا البريد.
              </p>
            </div>

            <div>
              <h3 className="font-semibold">🌐 مواقع التواصل الاجتماعي:</h3>
              <p>تابعونا على وسائل التواصل الاجتماعي للبقاء على اطلاع على آخر الأخبار والتحديثات:</p>
              <ul className="list-disc pr-6 space-y-1">
                <li>
                  تويتر: <span className="font-medium text-[#1dbf73]">@KooraOfc</span>
                </li>
                <li>
                  فيسبوك: <span className="font-medium text-[#1dbf73]">facebook.com/KooraOffc</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>

    {/* Footer */}
    <Footer />
  </div>
);

export default Contact;
