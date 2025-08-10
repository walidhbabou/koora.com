import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Clock, Eye, Heart, Share2, Filter } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";

const Videos = () => {
  const featuredVideos = [
    {
      id: "1",
      title: "أهداف مباراة الكلاسيكو - ريال مدريد ضد برشلونة",
      thumbnail: "/placeholder.svg",
      duration: "8:45",
      views: "2.5M",
      publishedAt: "منذ يوم واحد",
      category: "أهداف",
      league: "الليجا"
    },
    {
      id: "2", 
      title: "ملخص مباراة مانشستر سيتي ضد ليفربول",
      thumbnail: "/placeholder.svg",
      duration: "12:30",
      views: "1.8M",
      publishedAt: "منذ يومين",
      category: "ملخصات",
      league: "البريمير ليج"
    }
  ];

  const latestVideos = [
    {
      id: "3",
      title: "أفضل التمريرات في دوري الأبطال هذا الأسبوع",
      thumbnail: "/placeholder.svg",
      duration: "5:20",
      views: "890K",
      publishedAt: "منذ 3 ساعات",
      category: "مهارات",
      league: "دوري الأبطال"
    },
    {
      id: "4",
      title: "مهارات ميسي الخرافية ضد باريس سان جيرمان",
      thumbnail: "/placeholder.svg",
      duration: "6:15",
      views: "1.2M",
      publishedAt: "منذ 5 ساعات",
      category: "مهارات",
      league: "الليج 1"
    },
    {
      id: "5",
      title: "أهداف الجولة الأخيرة من البوندسليجا",
      thumbnail: "/placeholder.svg",
      duration: "10:45",
      views: "650K",
      publishedAt: "منذ 8 ساعات",
      category: "أهداف",
      league: "البوندسليجا"
    },
    {
      id: "6",
      title: "تحليل تكتيكي: كيف فاز يوفنتوس على نابولي؟",
      thumbnail: "/placeholder.svg",
      duration: "15:30",
      views: "420K",
      publishedAt: "منذ 12 ساعة",
      category: "تحليل",
      league: "السيريا أ"
    }
  ];

  const categories = [
    { name: "جميع الفيديوهات", active: true, count: 1250 },
    { name: "أهداف", active: false, count: 450 },
    { name: "ملخصات", active: false, count: 320 },
    { name: "مهارات", active: false, count: 280 },
    { name: "تحليل", active: false, count: 120 },
    { name: "مقابلات", active: false, count: 80 }
  ];

  const playlists = [
    {
      name: "أفضل أهداف الأسبوع",
      videoCount: 25,
      thumbnail: "/placeholder.svg",
      totalViews: "5.2M"
    },
    {
      name: "مهارات النجوم",
      videoCount: 18,
      thumbnail: "/placeholder.svg", 
      totalViews: "3.8M"
    },
    {
      name: "ملخصات دوري الأبطال",
      videoCount: 32,
      thumbnail: "/placeholder.svg",
      totalViews: "7.1M"
    }
  ];

  const VideoCard = ({ video, size = "normal" }: { video: any, size?: "normal" | "large" }) => (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group ${
      size === "large" ? "md:col-span-2" : ""
    }`}>
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className={`w-full object-cover ${size === "large" ? "h-64" : "h-48"}`}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <Play className="w-12 h-12 text-white" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {video.duration}
        </div>
        <Badge className="absolute top-2 right-2 bg-sport-green">
          {video.category}
        </Badge>
      </div>
      
      <div className="p-4">
        <h3 className={`font-semibold text-sport-dark line-clamp-2 ${
          size === "large" ? "text-lg" : "text-base"
        }`}>
          {video.title}
        </h3>
        
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {video.views}
            </div>
            <span>{video.publishedAt}</span>
          </div>
          <Badge variant="outline">{video.league}</Badge>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="h-8 px-2">
              <Heart className="w-4 h-4 mr-1" />
              إعجاب
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-2">
              <Share2 className="w-4 h-4 mr-1" />
              مشاركة
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  الفيديوهات
                </h1>
                <p className="text-muted-foreground mt-1">أفضل لقطات ومقاطع كرة القدم</p>
              </div>
              
              <div className="flex gap-3">
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

            {/* Featured Videos */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sport-dark">الفيديوهات المميزة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featuredVideos.map((video) => (
                  <VideoCard key={video.id} video={video} size="large" />
                ))}
              </div>
            </div>

            {/* Latest Videos */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-sport-dark">أحدث الفيديوهات</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {latestVideos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button size="lg" variant="outline" className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white">
                تحميل المزيد من الفيديوهات
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <Sidebar />
            
            {/* Playlists */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">قوائم التشغيل</h3>
              <div className="space-y-4">
                {playlists.map((playlist, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-sport-light/20 cursor-pointer transition-colors"
                  >
                    <img 
                      src={playlist.thumbnail} 
                      alt={playlist.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground">{playlist.videoCount} فيديو</p>
                      <p className="text-xs text-muted-foreground">{playlist.totalViews} مشاهدة</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Popular Categories */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">الفئات الأكثر شعبية</h3>
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
      
      <Footer />
    </div>
  );
};

export default Videos;
