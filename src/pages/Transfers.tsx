import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Clock, DollarSign, User, Calendar } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";

const Transfers = () => {
  const latestTransfers = [
    {
      id: "1",
      player: {
        name: "كيليان مبابي",
        photo: "/placeholder.svg",
        age: 25,
        position: "مهاجم",
        nationality: "فرنسا"
      },
      fromTeam: {
        name: "باريس سان جيرمان",
        logo: "/placeholder.svg",
        league: "الليج 1"
      },
      toTeam: {
        name: "ريال مدريد",
        logo: "/placeholder.svg",
        league: "الليجا"
      },
      transferType: "انتقال حر",
      fee: "مجاناً",
      date: "2025-08-01",
      status: "مؤكد"
    },
    {
      id: "2",
      player: {
        name: "هاري كين",
        photo: "/placeholder.svg",
        age: 30,
        position: "مهاجم",
        nationality: "إنجلترا"
      },
      fromTeam: {
        name: "توتنهام",
        logo: "/placeholder.svg",
        league: "البريمير ليج"
      },
      toTeam: {
        name: "بايرن ميونخ",
        logo: "/placeholder.svg",
        league: "البوندسليجا"
      },
      transferType: "انتقال دائم",
      fee: "€100M",
      date: "2025-07-28",
      status: "مؤكد"
    }
  ];

  const rumors = [
    {
      id: "3",
      player: {
        name: "ديكلان رايس",
        photo: "/placeholder.svg",
        age: 24,
        position: "لاعب وسط",
        nationality: "إنجلترا"
      },
      fromTeam: {
        name: "وست هام",
        logo: "/placeholder.svg",
        league: "البريمير ليج"
      },
      toTeam: {
        name: "آرسنال",
        logo: "/placeholder.svg",
        league: "البريمير ليج"
      },
      transferType: "انتقال دائم",
      fee: "€120M",
      probability: 85,
      status: "شائعة"
    },
    {
      id: "4",
      player: {
        name: "فيكتور أوسيمين",
        photo: "/placeholder.svg",
        age: 24,
        position: "مهاجم",
        nationality: "نيجيريا"
      },
      fromTeam: {
        name: "نابولي",
        logo: "/placeholder.svg",
        league: "السيريا أ"
      },
      toTeam: {
        name: "تشيلسي",
        logo: "/placeholder.svg",
        league: "البريمير ليج"
      },
      transferType: "انتقال دائم",
      fee: "€150M",
      probability: 65,
      status: "شائعة"
    }
  ];

  const topClubs = [
    {
      name: "ريال مدريد",
      logo: "/placeholder.svg",
      transfers: 5,
      spent: "€200M",
      received: "€50M",
      netSpent: "-€150M"
    },
    {
      name: "برشلونة",
      logo: "/placeholder.svg",
      transfers: 3,
      spent: "€80M",
      received: "€120M",
      netSpent: "+€40M"
    },
    {
      name: "مانشستر سيتي",
      logo: "/placeholder.svg",
      transfers: 4,
      spent: "€180M",
      received: "€30M",
      netSpent: "-€150M"
    },
    {
      name: "باريس سان جيرمان",
      logo: "/placeholder.svg",
      transfers: 2,
      spent: "€60M",
      received: "€200M",
      netSpent: "+€140M"
    }
  ];

  const transferWindows = [
    { name: "الصيف 2025", active: true, deadline: "31 أغسطس" },
    { name: "الشتاء 2025", active: false, deadline: "31 يناير" },
    { name: "الصيف 2024", active: false, deadline: "منتهي" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مؤكد": return "bg-green-500";
      case "شائعة": return "bg-yellow-500";
      case "مرفوض": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    if (probability >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const TransferCard = ({ transfer, isRumor = false }: { transfer: any, isRumor?: boolean }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <Badge className={getStatusColor(transfer.status)}>
          {transfer.status}
        </Badge>
        {isRumor && (
          <div className="text-right">
            <span className="text-sm text-muted-foreground">احتمالية التحقق</span>
            <p className={`font-bold ${getProbabilityColor(transfer.probability)}`}>
              {transfer.probability}%
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <img 
          src={transfer.player.photo} 
          alt={transfer.player.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-sport-dark">{transfer.player.name}</h3>
          <p className="text-muted-foreground">{transfer.player.position} • {transfer.player.age} سنة</p>
          <p className="text-sm text-muted-foreground">{transfer.player.nationality}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 my-6">
        <div className="flex items-center gap-2">
          <img 
            src={transfer.fromTeam.logo} 
            alt={transfer.fromTeam.name}
            className="w-8 h-8"
          />
          <span className="font-medium">{transfer.fromTeam.name}</span>
        </div>
        
        <ArrowRightLeft className="w-6 h-6 text-sport-green" />
        
        <div className="flex items-center gap-2">
          <img 
            src={transfer.toTeam.logo} 
            alt={transfer.toTeam.name}
            className="w-8 h-8"
          />
          <span className="font-medium">{transfer.toTeam.name}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">نوع الانتقال:</span>
          <span className="font-medium">{transfer.transferType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">القيمة:</span>
          <span className="font-medium text-sport-green">{transfer.fee}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">التاريخ:</span>
          <span className="font-medium">{transfer.date}</span>
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
                  الانتقالات
                </h1>
                <p className="text-muted-foreground mt-1">آخر أخبار سوق الانتقالات والصفقات</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  نافذة الانتقالات
                </Button>
              </div>
            </div>

            {/* Transfer Windows */}
            <div className="flex flex-wrap gap-2">
              {transferWindows.map((window, index) => (
                <Badge 
                  key={index}
                  variant={window.active ? "default" : "secondary"}
                  className={`cursor-pointer px-4 py-2 ${
                    window.active 
                      ? "bg-sport-green text-white" 
                      : "hover:bg-sport-green/10"
                  }`}
                >
                  {window.name} - {window.deadline}
                </Badge>
              ))}
            </div>

            {/* Latest Confirmed Transfers */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">آخر الانتقالات المؤكدة</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestTransfers.map((transfer) => (
                  <TransferCard key={transfer.id} transfer={transfer} />
                ))}
              </div>
            </div>

            {/* Transfer Rumors */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">الشائعات والأخبار</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rumors.map((rumor) => (
                  <TransferCard key={rumor.id} transfer={rumor} isRumor={true} />
                ))}
              </div>
            </div>

            {/* Club Transfer Activity */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">نشاط الأندية في السوق</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topClubs.map((club, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={club.logo} 
                        alt={club.name}
                        className="w-10 h-10"
                      />
                      <h3 className="font-bold text-sport-dark">{club.name}</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">الانتقالات</p>
                        <p className="font-bold text-sport-green">{club.transfers}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الإنفاق</p>
                        <p className="font-bold text-red-600">{club.spent}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">الإيرادات</p>
                        <p className="font-bold text-green-600">{club.received}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">صافي الإنفاق</p>
                        <p className={`font-bold ${
                          club.netSpent.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {club.netSpent}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Load More */}
            <div className="flex justify-center pt-8">
              <Button size="lg" variant="outline" className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white">
                تحميل المزيد من الانتقالات
              </Button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <Sidebar />
            
            {/* Transfer Deadline */}
            <Card className="p-6 border-l-4 border-l-red-500">
              <h3 className="text-lg font-bold text-sport-dark mb-3">عداد نافذة الانتقالات</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">26</div>
                <p className="text-sm text-muted-foreground">يوم متبقي على إغلاق النافذة</p>
                <p className="text-xs text-muted-foreground mt-1">31 أغسطس 2025</p>
              </div>
            </Card>

            {/* Most Expensive Transfers */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-sport-dark mb-4">أغلى انتقالات الصيف</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">نيمار → الهلال</span>
                  <Badge variant="secondary">€300M</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">بيليجهام → ريال مدريد</span>
                  <Badge variant="secondary">€180M</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">رايس → آرسنال</span>
                  <Badge variant="secondary">€120M</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">كين → بايرن ميونخ</span>
                  <Badge variant="secondary">€100M</Badge>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transfers;
