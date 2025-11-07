import React, { useState } from "react";
import SEO from "@/components/SEO";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    message: false
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      message: !formData.message.trim()
    };

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.message) {
      // Simulate form submission
      console.log("Form submitted:", formData);
      setSubmitStatus('success');
      setFormData({ name: "", email: "", message: "" });
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f8fa] dark:bg-[#181a1b]" dir="rtl">
      <SEO 
        title="اتصل بنا | كورة - تواصل مع فريق الموقع"
        description="تواصل مع فريق كورة للاستفسارات والاقتراحات. نحن هنا لخدمتك وتقديم أفضل تجربة في متابعة الأخبار الرياضية."
        keywords={["اتصل بنا", "تواصل", "استفسارات", "دعم العملاء", "فريق كورة"]}
        type="website"
      />
      <Header />

      <main className="container mx-auto flex-grow py-8 px-4" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
            اتصل بنا
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-6">
              <div className="space-y-6 text-gray-700 dark:text-gray-200">
                <p>
                  نحن في <span className="font-semibold text-[#1dbf73]">Koora.com</span> 
                  نرحب بجميع استفساراتكم، اقتراحاتكم، وآرائكم. إذا كانت لديكم أي أسئلة 
                  أو ترغبون في التواصل معنا، فلا تترددوا في مراسلتنا. فريق الدعم لدينا 
                  مستعد للرد على جميع استفساراتكم في أقرب وقت ممكن.
                </p>

                <h2 className="text-xl font-semibold mt-6 text-[#1dbf73]">طرق التواصل:</h2>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">📧 البريد الإلكتروني:</h3>
                    <p className="text-sm">
                      <a href="mailto:support@koora.com" className="text-[#1dbf73] hover:underline">
                        support@koora.com
                      </a> – للأمور المتعلقة بالدعم الفني أو الاستفسارات العامة.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">📝 الشكاوى والاقتراحات:</h3>
                    <p className="text-sm">
                      <a href="mailto:feedback@koora.com" className="text-[#1dbf73] hover:underline">
                        feedback@koora.com
                      </a> – إذا كانت لديكم اقتراحات لتحسين الموقع أو ترغبون في تقديم شكوى.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">📢 الإعلانات والشراكات:</h3>
                    <p className="text-sm">
                      <a href="mailto:ads@koora.com" className="text-[#1dbf73] hover:underline">
                        ads@koora.com
                      </a> – إذا كنتم ترغبون في الإعلان على موقعنا أو الشراكة معنا.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🌐 مواقع التواصل الاجتماعي:</h3>
                    <p className="text-sm mb-2">تابعونا على وسائل التواصل الاجتماعي:</p>
                    <ul className="space-y-1 text-sm">
                      <li>
                        تويتر: <a href="https://twitter.com/KooraOfc" target="_blank" rel="noopener noreferrer" className="text-[#1dbf73] hover:underline">@KooraOfc</a>
                      </li>
                      <li>
                        فيسبوك: <a href="https://facebook.com/KooraOffc" target="_blank" rel="noopener noreferrer" className="text-[#1dbf73] hover:underline">facebook.com/KooraOffc</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white dark:bg-[#23272a] rounded-lg shadow p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      اسمك <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-[#2c3034] dark:text-white ${
                        errors.name 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#1dbf73]'
                      }`}
                      placeholder=""
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> This field is required
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                      بريدك الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-[#2c3034] dark:text-white ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-[#1dbf73]'
                      }`}
                      placeholder=""
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <span>⚠</span> This field is required
                      </p>
                    )}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    رسالتك <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 dark:bg-[#2c3034] dark:text-white resize-none ${
                      errors.message 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-[#1dbf73]'
                    }`}
                    placeholder=""
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> This field is required
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#1dbf73] text-white font-medium rounded-md hover:bg-[#19a863] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1dbf73] focus:ring-offset-2"
                  >
                    إرسال
                  </button>
                </div>

                {/* Success Message */}
                {submitStatus === 'success' && (
                  <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-md">
                    تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
