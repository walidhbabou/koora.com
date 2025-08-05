import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, TrendingUp, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

const News = () => {
  const featuredNews = [
    {
      id: "1",
      title: "مبابي يقترب من الانضمام لريال مدريد في صفقة تاريخية",
      summary: "تقارير إسبانية تؤكد أن النجم الفرنسي كيليان مبابي على وشك التوقيع مع ريال مدريد في صفقة انتقال حر",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-05",
      category: "الانتقالات"
    },
    {
      id: "2",
      title: "صلاح يحطم رقمًا قياسيًا جديدًا في البريمير ليج",
      summary: "النجم المصري محمد صلاح يسجل هدفه رقم 200 في البريمير ليج ويدخل التاريخ",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-05",
      category: "إنجازات"
    }
  ];

  const latestNews = [
    {
      id: "3",
      title: "برشلونة يستهدف نجم مانشستر سيتي الصيف المقبل",
      summary: "إدارة برشلونة تضع عينيها على لاعب وسط مانشستر سيتي لتدعيم صفوف الفريق",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-05",
      category: "الانتقالات"
    },
    {
      id: "4",
      title: "الأهلي يتوج بطلاً للدوري المصري للمرة الـ15",
      summary: "النادي الأهلي يحسم لقب الدوري المصري بفوزه على الزمالك في الجولة الأخيرة",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "البطولات"
    },
    {
      id: "5",
      title: "هالاند يغيب عن مباراة مانشستر سيتي القادمة",
      summary: "النجم النرويجي إيرلينغ هالاند سيغيب عن المباراة بسبب إصابة في العضلة الخلفية",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "إصابات"
    },
    {
      id: "6",
      title: "انشيلوتي: راضون عن أداء الفريق في الموسم الجديد",
      summary: "مدرب ريال مدريد كارلو انشيلوتي يعبر عن رضاه عن مستوى اللاعبين في التحضيرات",
      imageUrl: "/placeholder.svg",
      publishedAt: "2025-08-04",
      category: "تصريحات"
    }
  ];

  const categories = [
    { name: "جميع الأخبار", count: 245, active: true },
    { name: "الانتقالات", count: 67, active: false },
    { name: "البطولات", count: 45, active: false },
    { name: "إصابات", count: 23, active: false },
    { name: "تصريحات", count: 38, active: false },
    { name: "إنجازات", count: 29, active: false }
  ];

  const trendingTopics = [
    "مبابي ريال مدريد",
    "صلاح ليفربول", 
    "برشلونة انتقالات",
    "الكلاسيكو",
    "دوري الأبطال"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  الأخبار
                </h1>
                <p className="text-muted-foreground mt-1">آخر أخبار كرة القدم من حول العالم</p>
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input placeholder="البحث في الأخبار..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  تصفية
                </Button>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <Badge 
                  key={index}
                  variant={category.active ? "default" : "secondary"}
                  className={`cursor-pointer px-4 py-2 ${
                    category.active 
                      ? "bg-sport-green text-white" 
                      : "hover:bg-sport-green/10"
                  }`}
                >
                  {category.name} ({category.count})
                </Badge>
              ))}
            </div>

            {/* Featured News */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">الأخبار المميزة</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredNews.map((news) => (
                  <NewsCard key={news.id} news={news} size="large" />
                ))}
              </div>
            </div>

            {/* Latest News */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">آخر الأخبار</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestNews.map((news) => (
                  <NewsCard key={news.id} news={news} size="medium" />
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button size="lg" variant="outline" className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white">
                تحميل المزيد من الأخبار
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <Sidebar />
            
            {/* Trending Topics */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">المواضيع الأكثر بحثاً</h3>
              <div className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-sport-light/20 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-sport-green">#{index + 1}</span>
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* News by Category */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">التصنيفات</h3>
              <div className="space-y-3">
                {categories.slice(1).map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-sport-light/20 cursor-pointer transition-colors"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
