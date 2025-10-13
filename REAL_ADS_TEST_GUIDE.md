# 🧪 Guide de Test - Vraies Annonces AdSense

## ✅ Configuration Actuelle

Ton site **koora.com** est maintenant configuré pour tester de **vraies annonces AdSense** en mode sécurisé :

- **Client ID réel :** `ca-pub-3552433452432828`
- **Mode test :** Activé avec `data-adtest="on"`
- **Types d'annonces :** Display + Ad Breaks

## 🚀 Comment Tester

### 1. **Page de Test Dédiée**
Accède à la nouvelle page `RealAdsTestPage.tsx` pour tester tous les formats :
- Header ads (728x90)
- Sidebar ads (300x250)  
- Mobile ads (320x100)
- In-article ads
- Ad Breaks interstitielles

### 2. **Sur tes Pages Principales**
Les pages `Index.tsx` et `News.tsx` sont maintenant configurées avec :
```typescript
<HeaderAd testMode={true} />
<SidebarAd testMode={true} />
<MobileAd testMode={true} />
```

## 🔒 Mode Test Sécurisé

### Ce qui est SÛR avec `testMode={true}` :
- ✅ **Vraies annonces** Google affichées
- ✅ **Aucune facturation** des impressions/clics
- ✅ **Statistiques non impactées**
- ✅ **Design et comportement authentiques**
- ✅ **Badge indicateur** visible (🧪 TEST MODE)

### Paramètres techniques appliqués :
```html
<!-- Pour annonces display -->
<ins class="adsbygoogle" data-adtest="on">

<!-- Pour Ad Breaks -->
<script data-adbreak-test="on" src="...">
```

## 📊 Tests à Effectuer

### 1. **Vérification Visuelle**
- [ ] Les annonces s'affichent correctement
- [ ] Badge "🧪 TEST MODE" visible
- [ ] Pas d'erreurs dans la console
- [ ] Responsive sur mobile/desktop

### 2. **Test des Formats**
- [ ] **Header :** 728x90 (desktop uniquement)
- [ ] **Sidebar :** 300x250 (desktop/tablet)
- [ ] **Mobile :** 320x100 (mobile uniquement)
- [ ] **In-Article :** Adaptatif dans le contenu
- [ ] **Ad Breaks :** Interstitielles plein écran

### 3. **Vérification Console**
Logs attendus :
```
🧪 AdSense script loaded (test: true)
✅ Mode Test: Activé (data-adtest=on)
🎮 Ad Breaks initialized
```

### 4. **Network Tab (DevTools)**
- Requêtes vers `googlesyndication.com`
- Présence de `adtest=on` dans les URLs
- Présence de `adbreak-test` pour Ad Breaks

## 🎯 Utilisation des Ad Breaks

### Moments idéaux sur koora.com :
```typescript
// Fin de lecture d'article
triggerAdBreak({ type: 'next', name: 'fin-article' });

// Navigation vers classements
triggerAdBreak({ type: 'browse', name: 'avant-classements' });

// Après quiz football
triggerAdBreak({ type: 'reward', name: 'quiz-termine' });
```

## 🔄 Passage en Production

### Quand tu es satisfait des tests :

1. **Désactiver le mode test :**
```typescript
<HeaderAd testMode={false} />
<SidebarAd testMode={false} />
<MobileAd testMode={false} />
```

2. **Ou utiliser une variable d'environnement :**
```env
VITE_ADSENSE_TEST_MODE=false
```

3. **Redéployer le site**

## ⚠️ Points d'Attention

### NE PAS faire :
- ❌ Cliquer excessivement sur les annonces (même en test)
- ❌ Passer en production sans avoir testé
- ❌ Oublier de vérifier le mode test

### TOUJOURS faire :
- ✅ Vérifier le badge "🧪 TEST MODE"
- ✅ Tester sur différents appareils
- ✅ Contrôler les logs console
- ✅ Valider la compatibilité mobile

## 📞 Support

### Si les annonces ne s'affichent pas :
1. Vérifier le Client ID dans `.env`
2. Contrôler les slots AdSense
3. Vérifier la console pour erreurs
4. Tester la connectivité réseau

### Logs de debug utiles :
```javascript
// Dans la console
console.log(typeof window.adBreak); // doit être "function"
console.log(window.adsbygoogle); // doit être un array
```

---

**🎉 Ton site est maintenant prêt pour tester de vraies annonces AdSense en toute sécurité !**