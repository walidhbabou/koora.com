import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, TrendingUp, Calendar, Loader2 } from "lucide-react";
import TeamsLogos from "@/components/TeamsLogos";
import { useMainTeamsTransfers } from "@/hooks/useTransfers";
import { useTranslation } from "@/hooks/useTranslation";
import { Transfer } from "@/config/api";
import { useState } from "react";
import "../styles/rtl.css";

const Transfers = () => {
  const { t, currentLanguage } = useTranslation();
  const currentSeason = new Date().getFullYear();
  const { data, loading, error } = useMainTeamsTransfers(currentSeason);
  const [activeTab, setActiveTab] = useState("confirmed");
  const isRTL = currentLanguage === "ar";

  const transfers = data?.response || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مؤكد":
      case "confirmed": return "bg-green-500";
      case "شائعة":
      case "rumor": return "bg-yellow-500";
      case "مرفوض":
      case "rejected": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const formatTransferFee = (fee: string | number) => {
    if (typeof fee === 'string') return fee;
    if (!fee || fee === 0) return isRTL ? "مجاناً" : "Free";
    if (fee >= 1000000) return `€${(fee / 1000000).toFixed(1)}M`;
    if (fee >= 1000) return `€${(fee / 1000).toFixed(0)}K`;
    return `€${fee}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return isRTL ? "غير محدد" : "TBD";
    const date = new Date(dateStr);
    return isRTL ?
      date.toLocaleDateString('ar-SA') :
      date.toLocaleDateString('en-GB');
  };

  const TransferCard = ({ transfer }: { transfer: Transfer }) => (
    <Card className={`p-6 hover:shadow-lg transition-shadow ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <Badge className="bg-green-500">
          {isRTL ? "مؤكد" : "Confirmed"}
        </Badge>
        <div className={isRTL ? "text-left" : "text-right"}>
          <span className="text-xs text-muted-foreground">
            {formatDate(transfer.date)}
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <img
          src={transfer.player?.photo || "/placeholder.svg"}
          alt={transfer.player?.name || "Player"}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className={`font-bold text-lg text-sport-dark ${isRTL ? 'text-right' : 'text-left'}`}>
            {transfer.player?.name || "Unknown Player"}
          </h3>
          <p className={`text-muted-foreground text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
            {transfer.type || "Transfer"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 my-6">
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <img
            src={transfer.teams?.out?.logo || "/placeholder.svg"}
            alt={transfer.teams?.out?.name || "From Team"}
            className="w-8 h-8"
          />
          <span className="font-medium text-sm">{transfer.teams?.out?.name || "From Team"}</span>
        </div>

        <ArrowRightLeft className={`w-6 h-6 text-sport-green ${isRTL ? 'rotate-180' : ''}`} />

        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <img
            src={transfer.teams?.in?.logo || "/placeholder.svg"}
            alt={transfer.teams?.in?.name || "To Team"}
            className="w-8 h-8"
          />
          <span className="font-medium text-sm">{transfer.teams?.in?.name || "To Team"}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-muted-foreground">
            {isRTL ? "نوع الانتقال:" : "Transfer Type:"}
          </span>
          <span className="font-medium">{transfer.type || "Permanent"}</span>
        </div>
        <div className={`flex justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-muted-foreground">
            {isRTL ? "التاريخ:" : "Date:"}
          </span>
          <span className="font-medium">{formatDate(transfer.date)}</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <Header />
        <TeamsLogos />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-sport-green" />
            <span className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
        <Header />
        <TeamsLogos />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">{isRTL ? "خطأ في تحميل البيانات" : "Error loading data"}</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header />
      <TeamsLogos />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  {isRTL ? "الانتقالات" : "Transfers"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isRTL ? "آخر أخبار سوق الانتقالات والصفقات" : "Latest transfer market news and deals"}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? "نافذة الانتقالات" : "Transfer Window"}
                </Button>
              </div>
            </div>

            {/* Latest Confirmed Transfers */}
            <div className="space-y-6">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <TrendingUp className="w-5 h-5 text-sport-green" />
                <h2 className="text-xl font-bold text-sport-dark">
                  {isRTL ? "آخر الانتقالات المؤكدة" : "Latest Confirmed Transfers"}
                </h2>
              </div>
              
              {transfers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {transfers.slice(0, 10).map((transfer, index) => (
                    <TransferCard key={transfer.player?.id || index} transfer={transfer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isRTL ? "لا توجد انتقالات متاحة حالياً" : "No transfers available at the moment"}
                  </p>
                </div>
              )}
            </div>

            {/* Load More */}
            {transfers.length > 10 && (
              <div className="flex justify-center pt-8">
                <Button size="lg" variant="outline" className="border-sport-green text-sport-green hover:bg-sport-green hover:text-white">
                  {isRTL ? "تحميل المزيد من الانتقالات" : "Load More Transfers"}
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
            <Sidebar />
            
            {/* Transfer Deadline */}
            <Card className={`p-6 border-l-4 border-l-red-500 ${isRTL ? 'border-l-0 border-r-4 border-r-red-500' : ''}`}>
              <h3 className={`text-lg font-bold text-sport-dark mb-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "عداد نافذة الانتقالات" : "Transfer Window Countdown"}
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">26</div>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? "يوم متبقي على إغلاق النافذة" : "Days until window closes"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isRTL ? "31 أغسطس 2025" : "August 31, 2025"}
                </p>
              </div>
            </Card>

            {/* Recent Transfers Summary */}
            <Card className="p-6">
              <h3 className={`text-lg font-bold text-sport-dark mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? "ملخص الانتقالات الأخيرة" : "Recent Transfers Summary"}
              </h3>
              <div className="space-y-3">
                {transfers.slice(0, 5).map((transfer, index) => (
                  <div key={index} className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-sm">
                      {transfer.player?.name} → {transfer.teams?.in?.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDate(transfer.date)}
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

export default Transfers;
