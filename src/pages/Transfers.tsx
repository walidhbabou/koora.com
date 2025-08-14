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
import { TransferEnriched } from "@/hooks/useTransfers";
import { useState } from "react";
import "../styles/rtl.css";

const Transfers = () => {
  const { t, currentLanguage } = useTranslation();
  const currentSeason = new Date().getFullYear();
  const { data, loading, error } = useMainTeamsTransfers();
  const [activeTab, setActiveTab] = useState("confirmed");
  const isRTL = currentLanguage === "ar";

  // Barre de recherche
  const [search, setSearch] = useState("");
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Tri par date décroissante
  const sortedTransfers = (data?.response || []).slice().sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Filtrage par recherche
  const filteredTransfers = sortedTransfers.filter(tr => {
    const playerName = tr.player?.name?.toLowerCase() || "";
    const clubName = tr.teams?.in?.name?.toLowerCase() || "";
    return (
      playerName.includes(search.toLowerCase()) ||
      clubName.includes(search.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredTransfers.length / pageSize);
  const paginatedTransfers = filteredTransfers.slice((page - 1) * pageSize, page * pageSize);

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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const TransferCard = ({ transfer }: { transfer: TransferEnriched }) => (
    <div
      className={`flex items-center mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} rounded-[20px] overflow-hidden shadow-lg bg-gradient-to-r from-[#5563c1] to-[#7b6fc7]`}
      style={{ minHeight: 70 }}
    >
      {/* Left: Club logo & date */}
      <div className={`flex items-center gap-2 px-6 py-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-[#5563c1]`} style={{ borderRadius: isRTL ? '0 20px 20px 0' : '20px 0 0 20px', minWidth: 180 }}>
        <span className="font-bold text-base text-white">{formatDate(transfer.date)}</span>
        <img src={transfer.teams?.in?.logo || "/placeholder.svg"} alt={transfer.teams?.in?.name || "Club"} className="w-10 h-10 rounded-full border-2 border-white" />
      </div>
      {/* Center: Fee & arrow & type */}
      <div className="flex-1 flex items-center justify-center">
        <span className="font-bold text-xl text-white mr-2 ml-2">{formatTransferFee(transfer.type)}</span>
        <div className="flex items-center">
          <span className="w-8 h-1 bg-white mx-2 rounded-full" />
          <span className="px-4 py-1 rounded-full bg-white text-[#5563c1] font-bold text-base shadow" style={{ minWidth: 80, textAlign: 'center' }}>{isRTL ? "انتقال" : "Transfer"}</span>
          <span className="w-8 h-1 bg-white mx-2 rounded-full" />
          <span className="text-white text-lg">{isRTL ? '←' : '→'}</span>
        </div>
      </div>
      {/* Right: Player info & logo */}
      <div className={`flex items-center gap-2 px-6 py-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'} bg-[#7b6fc7]`} style={{ borderRadius: isRTL ? '20px 0 0 20px' : '0 20px 20px 0', minWidth: 220, justifyContent: isRTL ? 'flex-start' : 'flex-end' }}>
        <div className={`flex flex-col ${isRTL ? 'text-left' : 'text-right'} text-white`}>
          <span className="font-bold text-base">{transfer.player?.name}</span>
          <span className="text-sm opacity-80">{transfer.player?.position || (isRTL ? "لا يوجد مركز" : "No position")}</span>
        </div>
        <img src={transfer.player?.photo || "/placeholder.svg"} alt={transfer.player?.name || "Player"} className="w-12 h-12 rounded-full border-2 border-white" />
        <img src={transfer.teams?.out?.logo || "/placeholder.svg"} alt={transfer.teams?.out?.name || "From Club"} className="w-8 h-8 rounded-full border-2 border-white" />
      </div>
    </div>
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
              
              {/* Barre de recherche */}
              <div className="mb-6 flex justify-center">
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder={isRTL ? "ابحث عن لاعب أو نادي..." : "Search player or club..."}
                  className="px-4 py-2 rounded-lg border w-full max-w-md text-black"
                  style={{ direction: isRTL ? "rtl" : "ltr" }}
                />
              </div>

              {paginatedTransfers.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {paginatedTransfers.map((transfer, index) => (
                    <TransferCard key={`${transfer.player?.id || 'unknown'}-${transfer.date || 'nodate'}-${index}`} transfer={transfer} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {isRTL ? "لا توجد انتقالات متاحة حالياً" : "No transfers available at the moment"}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-8">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >{isRTL ? "السابق" : "Previous"}</Button>
                  <span className="px-3 font-bold">{page} / {totalPages}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >{isRTL ? "التالي" : "Next"}</Button>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredTransfers.length > 10 && (
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
                {filteredTransfers.slice(0, 5).map((transfer, index) => (
                  <div key={`${transfer.player?.id || 'unknown'}-${transfer.date || 'nodate'}-${index}`} className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
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
