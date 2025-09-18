# Guide de Configuration Google AdSense pour Koora.com

Ce guide vous accompagne dans la configuration complète de Google AdSense pour votre site koora.com, incluant la gestion des sponsors locaux.

## 📋 Table des Matières

1. [Configuration Google AdSense](#configuration-google-adsense)
2. [Configuration des Variables d'Environnement](#configuration-des-variables-denvironnement)
3. [Utilisation des Composants](#utilisation-des-composants)
4. [Gestion des Sponsors Locaux](#gestion-des-sponsors-locaux)
5. [Monitoring et Analytics](#monitoring-et-analytics)
6. [Dépannage](#dépannage)

## 🚀 Configuration Google AdSense

### Étape 1: Créer un Compte AdSense

1. **Inscription AdSense**
   - Allez sur [www.google.com/adsense](https://www.google.com/adsense)
   - Cliquez sur "Commencer" et connectez-vous avec votre compte Google
   - Ajoutez votre site web : `koora.com` (votre domaine)
   - Sélectionnez votre pays/région et devise

2. **Vérification du Site**
   - Copiez le code HTML AdSense fourni
   - Le code est déjà intégré dans `index.html` - il vous suffit de remplacer l'ID client

### Étape 2: Configurer le Code AdSense

1. **Modifier index.html**
   ```html
   <!-- Remplacez "ca-pub-XXXXXXXXXXXXXXXX" par votre vrai ID client -->
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-VOTRE_VRAI_ID_CLIENT"></script>
   ```

2. **Créer les Unités Publicitaires**
   - Connectez-vous à votre compte AdSense
   - Allez dans "Annonces" > "Par unité publicitaire"
   - Créez les unités suivantes :

   | Type | Nom | Taille | Emplacement |
   |------|-----|--------|-------------|
   | Display | Header Banner | 728x90 (Leaderboard) | En-tête |
   | Display | Sidebar Ad | 300x250 (Rectangle) | Barre latérale |
   | Display | Mobile Banner | 320x50 (Mobile Banner) | Mobile |
   | In-article | Article Content | Responsive | Dans les articles |

## ⚙️ Configuration des Variables d'Environnement

1. **Créer le fichier .env**
   ```bash
   # Copiez .env.example vers .env
   cp .env.example .env
   ```

2. **Configurer les variables AdSense**
   ```env
   # Configuration Google AdSense
   VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-VOTRE_VRAI_ID_CLIENT
   VITE_GOOGLE_ADSENSE_SLOT_HEADER=1234567890
   VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR=0987654321
   VITE_GOOGLE_ADSENSE_SLOT_MOBILE=1122334455
   VITE_GOOGLE_ADSENSE_SLOT_IN_ARTICLE=5544332211
   VITE_GOOGLE_ADSENSE_TEST_MODE=false

   # Configuration Sponsors Locaux
   VITE_SPONSORS_API_URL=https://api.koora.com/sponsors
   VITE_SPONSORS_TRACKING_ENABLED=true
   ```

3. **Obtenir les Slot IDs**
   - Dans AdSense, pour chaque unité publicitaire créée
   - Copiez le `data-ad-slot` du code généré
   - Collez dans les variables d'environnement correspondantes

## 🛠 Utilisation des Composants

### AdWrapper Component

Le composant `AdWrapper` combine AdSense et sponsors locaux :

```tsx
import { AdWrapper } from '@/components/AdWrapper';

// Dans vos pages
function HomePage() {
  return (
    <div>
      {/* En-tête */}
      <AdWrapper.HeaderAd />
      
      {/* Contenu principal */}
      <main>
        {/* Contenu de la page */}
      </main>
      
      {/* Barre latérale */}
      <aside>
        <AdWrapper.SidebarAd />
        <AdWrapper.SponsorsSection />
      </aside>
      
      {/* Mobile uniquement */}
      <AdWrapper.MobileAd />
    </div>
  );
}
```

### GoogleAdSense Component

Pour un contrôle plus fin :

```tsx
import { GoogleAdSense } from '@/components/GoogleAdSense';

// Utilisation avancée
<GoogleAdSense 
  format="leaderboard"
  responsive={true}
  className="my-4"
  testMode={false}
/>
```

### LocalSponsors Component

Pour afficher uniquement les sponsors locaux :

```tsx
import { LocalSponsors } from '@/components/LocalSponsors';

// Sponsors par catégorie
<LocalSponsors 
  category="main"
  maxCount={3}
  showDescription={true}
  title="الشركاء الرئيسيون"
/>
```

## 👥 Gestion des Sponsors Locaux

### Ajout de Sponsors

1. **Préparer les Logos**
   ```bash
   # Créer le dossier sponsors
   mkdir -p public/sponsors
   
   # Ajouter les logos (format recommandé: PNG, 200x100px)
   public/sponsors/
   ├── sponsor-1.png
   ├── sponsor-2.png
   └── sponsor-3.png
   ```

2. **Utiliser le Hook useSponsors**
   ```tsx
   import { useSponsors } from '@/hooks/useSponsors';
   
   function SponsorManagement() {
     const { addSponsor, updateSponsor, removeSponsor } = useSponsors();
     
     const handleAddSponsor = async () => {
       const result = await addSponsor({
         name: 'شركة جديدة',
         logo: '/sponsors/new-sponsor.png',
         url: 'https://example.com',
         category: 'partner',
         active: true,
         priority: 1
       });
       
       if (result.success) {
         console.log('Sponsor ajouté avec succès');
       }
     };
   }
   ```

### Structure des Données Sponsor

```typescript
interface SponsorData {
  id: string;
  name: string;              // Nom du sponsor
  logo: string;              // Chemin vers le logo
  url: string;               // Lien du sponsor
  description?: string;      // Description optionnelle
  category: 'main' | 'secondary' | 'partner';
  active: boolean;           // Statut actif/inactif
  startDate?: string;        // Date de début
  endDate?: string;          // Date de fin
  priority: number;          // Ordre d'affichage
  clicks: number;            // Nombre de clics
  impressions: number;       // Nombre d'impressions
}
```

## 📊 Monitoring et Analytics

### Tracking AdSense

1. **Vérifier les Performances**
   - Connectez-vous à AdSense
   - Allez dans "Rapports" pour voir les statistiques
   - Surveillez : CTR, CPC, Revenus

2. **Optimisation**
   - Testez différents emplacements
   - Analysez les heatmaps avec les outils de votre choix
   - Ajustez les tailles selon les performances

### Tracking des Sponsors

```tsx
import { useSponsors } from '@/hooks/useSponsors';

function Analytics() {
  const { sponsors } = useSponsors();
  
  // Analyser les performances
  const analytics = sponsors.map(sponsor => ({
    name: sponsor.name,
    ctr: sponsor.clicks / sponsor.impressions * 100,
    totalRevenue: sponsor.clicks * 0.5 // Exemple
  }));
}
```

## 🔧 Dépannage

### Problèmes Courants

1. **Les publicités ne s'affichent pas**
   ```bash
   # Vérifiez les variables d'environnement
   echo $VITE_GOOGLE_ADSENSE_CLIENT_ID
   
   # Vérifiez la console du navigateur
   # Recherchez les erreurs AdSense
   ```

2. **Mode Test Permanent**
   ```env
   # Assurez-vous que le mode test est désactivé en production
   VITE_GOOGLE_ADSENSE_TEST_MODE=false
   ```

3. **Sponsors ne se chargent pas**
   ```tsx
   // Vérifiez le hook useSponsors
   const { sponsors, loading, error } = useSponsors();
   
   if (error) {
     console.error('Erreur sponsors:', error);
   }
   ```

### Validation

1. **Test AdSense**
   - Utilisez l'inspecteur AdSense de Google
   - Vérifiez que les unités publicitaires sont correctement configurées

2. **Test Responsive**
   ```bash
   # Testez sur différentes tailles d'écran
   # Mobile : 320px-768px
   # Tablet : 768px-1024px  
   # Desktop : 1024px+
   ```

## 🚀 Déploiement

### Avant la Mise en Production

1. **Checklist AdSense**
   - [ ] ID client correct dans index.html
   - [ ] Toutes les variables d'environnement configurées
   - [ ] Mode test désactivé
   - [ ] Unités publicitaires créées dans AdSense

2. **Checklist Sponsors**
   - [ ] Logos optimisés et ajoutés dans /public/sponsors/
   - [ ] Données sponsors configurées
   - [ ] Tracking fonctionnel

3. **Performance**
   ```bash
   # Construire le projet
   npm run build
   
   # Tester la build
   npm run preview
   ```

### Variables de Production

```env
# Production .env
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-VOTRE_VRAI_ID
VITE_GOOGLE_ADSENSE_SLOT_HEADER=VRAI_SLOT_ID
VITE_GOOGLE_ADSENSE_SLOT_SIDEBAR=VRAI_SLOT_ID
VITE_GOOGLE_ADSENSE_SLOT_MOBILE=VRAI_SLOT_ID
VITE_GOOGLE_ADSENSE_SLOT_IN_ARTICLE=VRAI_SLOT_ID
VITE_GOOGLE_ADSENSE_TEST_MODE=false
VITE_SPONSORS_TRACKING_ENABLED=true
```

## 📈 Monétisation Avancée

### Stratégies de Placement

1. **Above the Fold**
   - Header banner pour une visibilité maximale
   - Attention au Core Web Vitals

2. **Content Integration**
   - Publicités in-article pour un CTR élevé
   - Respecter l'expérience utilisateur

3. **Responsive Strategy**
   - Bannières mobiles optimisées
   - Adaptation automatique aux tailles d'écran

### Optimisation des Revenus

1. **A/B Testing**
   - Testez différents emplacements
   - Comparez les performances

2. **Seasonal Adjustments**
   - Adaptez selon les événements sportifs
   - Ajustez les sponsors selon les saisons

---

## 📞 Support

Pour toute question concernant cette configuration :

1. **Documentation AdSense** : [support.google.com/adsense](https://support.google.com/adsense)
2. **Code Sources** : Vérifiez les composants dans `/src/components/`
3. **Logs** : Consultez la console du navigateur pour les erreurs

---

*Guide créé pour koora.com - Système de monétisation intégré avec Google AdSense et sponsors locaux*