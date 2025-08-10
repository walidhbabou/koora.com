import Header from "@/components/Header";
import TeamsLogos from "@/components/TeamsLogos";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import Footer from "@/components/Footer";

const Index = () => {
  const newsItems = [
    {
      id: "1",
      title: "ريال مدريد يقرر عدم إبرام صفقات جديدة",
      summary: "كشفت الصحفية أرانشا رودريغيز أن إدارة النادي لا تنوي إبرام أي صفقات جديدة",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "الانتقالات"
    },
    {
      id: "2", 
      title: "حقيقة الانتقال المحتمل لنيمار",
      summary: "آخر المعلومات حول مستقبل اللاعب البرازيلي والمفاوضات الجارية",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "الانتقالات"
    },
    {
      id: "3",
      title: "مانشستر سيتي يؤمن خدمات روبين دياس",
      summary: "المدافع البرتغالي يبقى عماد فريق بيب غوارديولا للموسم القادم",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "الأخبار"
    },
    {
      id: "4",
      title: "تحليل تكتيكي لمباريات الإعداد",
      summary: "نظرة معمقة على الاستراتيجيات المستخدمة من قبل الأندية الأوروبية الكبرى",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-03",
      category: "تحليل"
    },
    {
      id: "5",
      title: "المواهب الشابة التي يجب متابعتها هذا الموسم",
      summary: "صورة عن اللاعبين الناشئين الذين قد يصنعون الإثارة",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-03",
      category: "الشباب"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar - Hidden on mobile, visible on large screens */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-6 lg:space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  الرئيسية
                </h1>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">مرحباً بكم في منصتكم الرياضية - آخر الأخبار والنتائج المباشرة</p>
              </div>
            </div>
            
            {/* News Grid - Responsive layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
              {newsItems[0] && <NewsCard news={newsItems[0]} size="large" />}
              {newsItems[1] && <NewsCard news={newsItems[1]} size="medium" />}
              {newsItems[2] && <NewsCard news={newsItems[2]} size="medium" />}
              {newsItems[3] && <NewsCard news={newsItems[3]} size="small" />}
              {newsItems[4] && <NewsCard news={newsItems[4]} size="small" />}
            </div>
            
            {/* Additional News Section */}
            <div className="mt-8 lg:mt-12">
              <h2 className="text-lg sm:text-xl font-bold text-sport-dark mb-4 lg:mb-6">المزيد من الأخبار</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {newsItems.map((news) => (
                  <NewsCard key={news.id} news={news} size="small" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
