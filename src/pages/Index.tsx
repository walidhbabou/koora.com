import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import NewsCard from "@/components/NewsCard";
import realMadridImage from "@/assets/real-madrid-news.jpg";
import neymarImage from "@/assets/neymar-news.jpg";
import manCityImage from "@/assets/man-city-news.jpg";

const Index = () => {
  const newsItems = [
    {
      id: "1",
      title: "Le Real Madrid décide de ne pas conclure de nouveaux transferts",
      summary: "La journaliste Arancha Rodriguez a révélé que la direction du club n'a pas l'intention de conclure",
      imageUrl: realMadridImage,
      publishedAt: "2025-08-04",
      category: "Transfert"
    },
    {
      id: "2", 
      title: "La réalité du transfert potentiel de Neymar à la",
      summary: "Les dernières informations sur l'avenir du joueur brésilien et les négociations en cours",
      imageUrl: neymarImage,
      publishedAt: "2025-08-04",
      category: "Transfert"
    },
    {
      id: "3",
      title: "Manchester City sécurise Ruben Dias",
      summary: "Le défenseur portugais reste un pilier de l'équipe de Pep Guardiola pour la saison à venir",
      imageUrl: manCityImage,
      publishedAt: "2025-08-04",
      category: "Actualités"
    },
    {
      id: "4",
      title: "Analyse tactique des matches de préparation",
      summary: "Un regard approfondi sur les stratégies utilisées par les grandes équipes européennes",
      imageUrl: realMadridImage,
      publishedAt: "2025-08-03",
      category: "Analyse"
    },
    {
      id: "5",
      title: "Les jeunes talents à surveiller cette saison",
      summary: "Portrait des joueurs émergents qui pourraient faire sensation",
      imageUrl: neymarImage,
      publishedAt: "2025-08-03",
      category: "Jeunes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-sport-light/20 to-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sport-dark to-sport-green bg-clip-text text-transparent">
                  Actualités Sport
                </h1>
                <p className="text-muted-foreground mt-1">Dernières nouvelles et résultats en direct</p>
              </div>
            </div>
            
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              <NewsCard news={newsItems[0]} size="large" />
              <NewsCard news={newsItems[1]} size="medium" />
              <NewsCard news={newsItems[2]} size="medium" />
              <NewsCard news={newsItems[3]} size="small" />
              <NewsCard news={newsItems[4]} size="small" />
            </div>
            
            {/* Additional News Section */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-sport-dark mb-6">Plus d'actualités</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {newsItems.map((news) => (
                  <NewsCard key={news.id} news={news} size="small" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
