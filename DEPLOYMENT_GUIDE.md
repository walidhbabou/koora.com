# Guide de Déploiement - Koora.com

Ce guide vous accompagne dans le déploiement de votre site koora.com avec intégration Google Analytics et Google Search Console.

## 📋 Pré-requis

1. **Domaine koora.com** - Assurez-vous d'avoir accès à la configuration DNS
2. **Compte Google Analytics** - Pour obtenir votre ID de suivi
3. **Compte Google Search Console** - Pour la vérification et l'indexation
4. **Service d'hébergement** (Vercel, Netlify, ou autre)

## 🚀 Étapes de Déploiement

### 1. Configuration Google Analytics

1. **Créer une propriété Google Analytics :**
   - Aller sur [Google Analytics](https://analytics.google.com)
   - Créer un compte ou se connecter
   - Créer une nouvelle propriété pour "koora.com"
   - Noter votre **ID de mesure** (format: G-XXXXXXXXXX)

2. **Configurer l'ID dans votre projet :**
   ```bash
   # Dans le fichier .env, remplacer :
   REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   # Par votre véritable ID
   ```

3. **Mettre à jour index.html :**
   ```html
   <!-- Remplacer G-XXXXXXXXXX par votre ID dans index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=VOTRE_ID_REEL"></script>
   ```

### 2. Configuration Google Search Console

1. **Ajouter votre domaine :**
   - Aller sur [Google Search Console](https://search.google.com/search-console)
   - Ajouter une propriété pour "https://koora.com"
   - Choisir "Préfixe d'URL"

2. **Obtenir le code de vérification :**
   - Choisir "Balise HTML" comme méthode de vérification
   - Copier le code de vérification
   - Remplacer dans index.html :
   ```html
   <meta name="google-site-verification" content="VOTRE_CODE_DE_VERIFICATION" />
   ```

### 3. Déploiement sur Vercel (Recommandé)

1. **Installation et configuration :**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configuration du domaine :**
   - Dans le dashboard Vercel, aller dans "Domains"
   - Ajouter "koora.com" et "www.koora.com"
   - Configurer les enregistrements DNS selon les instructions Vercel

3. **Variables d'environnement :**
   - Dans Vercel Dashboard > Settings > Environment Variables
   - Ajouter toutes les variables de votre fichier .env

### 4. Configuration DNS

Configurer les enregistrements DNS de votre domaine :

```
Type: A
Name: @
Value: 76.76.19.61 (IP Vercel)

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: *
Value: cname.vercel-dns.com
```

### 5. Vérifications Post-Déploiement

1. **Test Google Analytics :**
   - Ouvrir votre site
   - Vérifier dans GA que les visites sont trackées (Temps réel > Aperçu)

2. **Test Google Search Console :**
   - Vérifier la propriété dans Search Console
   - Tester l'URL avec "Inspection d'URL"
   - Soumettre le sitemap : `https://koora.com/sitemap.xml`

3. **Test de performance :**
   - [PageSpeed Insights](https://pagespeed.web.dev/)
   - [GTmetrix](https://gtmetrix.com/)

## 📊 Suivi et Analytics

### Événements trackés automatiquement :
- ✅ Pages vues (toutes les pages)
- ✅ Clics sur articles
- ✅ Navigation entre sections
- ✅ Recherches (à implémenter)
- ✅ Clics sur matchs (à implémenter)

### Utilisation des fonctions de tracking :

```typescript
import { trackArticleClick, trackSearch, trackMatchClick } from '@/utils/googleAnalytics';

// Tracker un clic d'article
trackArticleClick('article-123', 'Titre de l\'article');

// Tracker une recherche
trackSearch('Real Madrid');

// Tracker un clic de match
trackMatchClick('match-456', 'Real Madrid vs Barcelona');
```

## 🔧 Configuration Avancée

### 1. Robots.txt et Sitemap
- ✅ robots.txt déjà configuré
- ✅ sitemap.xml déjà configuré
- Soumettre le sitemap à Google Search Console

### 2. Métadonnées SEO
- ✅ Open Graph configuré
- ✅ Twitter Cards configuré
- ✅ Schema.org configuré

### 3. Performance
- Activer la compression gzip
- Configurer le cache des ressources statiques
- Optimiser les images (WebP, lazy loading)

## 🚨 Points d'attention

1. **Mode Test AdSense :** Désactiver avant production
2. **Variables d'environnement :** Ne jamais committer les vraies clés
3. **HTTPS :** Obligatoire pour Google Analytics
4. **Redirections :** Configurer www → non-www ou vice versa

## 📞 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Tester en mode développement local
3. Vérifier la console navigateur pour erreurs JS
4. Consulter Google Analytics Real-time pour validation

## ✅ Checklist de Déploiement

- [ ] ID Google Analytics configuré
- [ ] Code Search Console ajouté
- [ ] Domaine pointé vers Vercel
- [ ] Variables d'environnement configurées
- [ ] Site accessible via https://koora.com
- [ ] Analytics fonctionnel (test temps réel)
- [ ] Search Console vérifié
- [ ] Sitemap soumis
- [ ] Performance testée
- [ ] Mode production AdSense