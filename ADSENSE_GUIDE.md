# Guide de Configuration Google AdSense

## 📋 Vue d'ensemble

Ce guide explique comment configurer et tester les publicités Google AdSense sur le site Koora.com avec un mode test sécurisé.

## 🔧 Configuration des Variables d'Environnement

### Mode Test (Développement)

Votre fichier `.env` est actuellement configuré avec les ID de test officiels de Google :

```env
# Google AdSense Configuration - MODE TEST
VITE_ADSENSE_CLIENT=ca-pub-3940256099942544
VITE_ADSENSE_HEADER_SLOT=6300978111
VITE_ADSENSE_SIDEBAR_SLOT=1033173712
VITE_ADSENSE_MOBILE_SLOT=5214956675
VITE_ADSENSE_ARTICLE_SLOT=3419835294
VITE_ADSENSE_FOOTER_SLOT=5764895930
VITE_ADSENSE_TEST_MODE=true
```

### Mode Production (Site Live)

Quand vous serez prêt à lancer le site en production, remplacez par vos vrais ID AdSense :

```env
# Google AdSense Configuration - MODE PRODUCTION
VITE_ADSENSE_CLIENT=ca-pub-VOTRE_VRAI_ID_CLIENT
VITE_ADSENSE_HEADER_SLOT=VOTRE_SLOT_HEADER
VITE_ADSENSE_SIDEBAR_SLOT=VOTRE_SLOT_SIDEBAR
VITE_ADSENSE_MOBILE_SLOT=VOTRE_SLOT_MOBILE
VITE_ADSENSE_ARTICLE_SLOT=VOTRE_SLOT_ARTICLE
VITE_ADSENSE_FOOTER_SLOT=VOTRE_SLOT_FOOTER
VITE_ADSENSE_TEST_MODE=false
```

## 🧪 Page de Test

### Accéder à la page de test
Visitez : `http://localhost:5173/ad-test`

Cette page vous permet de :
- ✅ Tester tous les formats d'annonces
- ✅ Voir les placeholders en mode test
- ✅ Vérifier la configuration des variables d'environnement
- ✅ Prévisualiser le layout final

### Formats d'annonces disponibles

1. **Header Ad** - Leaderboard (728x90)
2. **Sidebar Ad** - Rectangle (300x250) 
3. **Mobile Ad** - Mobile Banner (320x100)
4. **In-Article Ad** - Format article
5. **Footer Ad** - Leaderboard (728x90)

## 🎯 Utilisation dans les Pages

### Import des composants

```tsx
import { 
  HeaderAd, 
  SidebarAd, 
  MobileAd, 
  InArticleAd, 
  FooterAd 
} from '@/components/AdWrapper';
```

### Exemples d'utilisation

```tsx
// Dans le header
<HeaderAd />

// Dans la sidebar
<SidebarAd />

// Dans un article
<InArticleAd />

// Avec contrôle manuel du mode test
<HeaderAd testMode={true} />
```

## 🔒 Sécurité et Bonnes Pratiques

### Mode Test Automatique
- En développement (`VITE_ADSENSE_TEST_MODE=true`), seuls des placeholders s'affichent
- Aucun appel aux serveurs AdSense en mode test
- Prévient les clics accidentels et violations des conditions AdSense

### Transition vers la Production

1. **Obtenez votre compte AdSense approuvé**
2. **Créez vos unités publicitaires** dans votre dashboard AdSense
3. **Copiez les ID client et slots**
4. **Mettez à jour le fichier `.env`**
5. **Changez `VITE_ADSENSE_TEST_MODE=false`**
6. **Testez sur un domaine de staging** avant la production

## 📱 Responsive et Mobile

Les annonces sont configurées pour être :
- ✅ Responsive par défaut
- ✅ Optimisées mobile
- ✅ Adaptées aux écrans RTL (arabe)

## 🚫 Annonces Indésirables

Pour éviter les annonces inappropriées :
1. Configurez les **contrôles de contenu** dans AdSense
2. Utilisez la **liste de blocage** pour exclure certains annonceurs
3. Activez le **filtrage de contenu sensible**

## 📊 Suivi et Analytics

Une fois en production, vous pourrez :
- Suivre les revenus dans votre dashboard AdSense
- Analyser les performances par page
- Optimiser l'emplacement des annonces

## ⚠️ Important - Conditions AdSense

- Ne jamais cliquer sur vos propres annonces
- Ne pas inciter les utilisateurs à cliquer
- Respecter les politiques de contenu Google
- Maintenir un ratio contenu/publicité équilibré

## 🔄 Commandes Utiles

```bash
# Démarrer en mode test
npm run dev

# Vérifier les variables d'environnement
echo $VITE_ADSENSE_TEST_MODE

# Accéder à la page de test
http://localhost:5173/ad-test
```

## 🆘 Dépannage

### Les annonces ne s'affichent pas
1. Vérifiez `VITE_ADSENSE_TEST_MODE=true` pour voir les placeholders
2. Contrôlez les variables d'environnement dans `/ad-test`
3. Ouvrez la console pour voir les erreurs

### Erreurs de configuration
- ID client invalide → Vérifiez le format `ca-pub-XXXXXXXXXXXXXXXX`
- Slots manquants → Créez les unités publicitaires dans AdSense
- CORS errors → Normal en localhost, testez sur domaine

---

💡 **Conseil** : Gardez toujours `VITE_ADSENSE_TEST_MODE=true` jusqu'à ce que votre site soit complètement prêt pour la production !