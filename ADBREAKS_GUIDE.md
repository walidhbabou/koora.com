# Guide Ad Breaks - Test d'Annonces Interstitielles Réelles

## 🎯 Objectif

Ce guide t'explique comment implémenter et tester des **Ad Breaks** (annonces interstitielles) avec de vraies annonces Google AdSense en mode sécurisé sur ton site **koora.com**.

## 🎮 Qu'est-ce que Ad Breaks ?

**Ad Breaks** est la solution AdSense conçue pour les **jeux** et **applications interactives**. Contrairement aux bannières classiques, ce sont des annonces **plein écran** qui s'affichent à des **moments naturels** choisis par le développeur.

### Différences principales :

| Ad Breaks | Annonces Display |
|-----------|------------------|
| Interstitiel plein écran | Bannière intégrée |
| Déclenchement programmé | Affichage automatique |
| Optimisé pour jeux/apps | Optimisé pour sites web |
| `data-adbreak-test="on"` | `data-adtest="on"` |

## 🧪 Implémentation du Mode Test

### 1. Script HTML (exactement comme tu l'as mentionné)

```html
<script async
    data-adbreak-test="on"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
    crossorigin="anonymous">
</script>

<script>
   window.adsbygoogle = window.adsbygoogle || [];
   var adBreak = adConfig = function(o) {adsbygoogle.push(o);}
</script>
```

### 2. Notre Implémentation React

J'ai créé plusieurs composants pour intégrer ça proprement :

#### `loadAdBreaksScript()` dans `adsenseLoader.ts`

```typescript
export const loadAdBreaksScript = (clientId: string, testMode = false) => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    // ⚠️ CLEF DU MODE TEST
    if (testMode) {
      script.setAttribute('data-adbreak-test', 'on');
    }
    
    // Initialise adBreak et adConfig
    script.onload = () => {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adBreak = window.adConfig = function(o) {
        window.adsbygoogle.push(o);
      };
      resolve();
    };
    
    document.head.appendChild(script);
  });
};
```

#### `triggerAdBreak()` pour déclencher les annonces

```typescript
export const triggerAdBreak = (options: {
  type: 'start' | 'pause' | 'next' | 'browse' | 'reward';
  name?: string;
  beforeAd?: () => void;
  afterAd?: () => void;
  adDismissed?: () => void;
  adViewed?: () => void;
}) => {
  if (window.adBreak) {
    window.adBreak({
      type: options.type,
      name: options.name || `adBreak-${options.type}`,
      beforeAd: options.beforeAd,
      afterAd: options.afterAd,
      adDismissed: options.adDismissed,
      adViewed: options.adViewed
    });
  }
};
```

## 🔧 Composants Créés

### 1. `AdBreaksTest.tsx`
Composant principal pour tester tous les types d'Ad Breaks avec interface graphique.

### 2. `AdBreaksTestPage.tsx`
Page complète de test avec explications et exemples.

## 🚀 Comment Utiliser

### 1. Configuration

Assure-toi d'avoir ton Client ID dans `.env` :

```env
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
```

### 2. Utilisation Basique

```tsx
import { loadAdBreaksScript, triggerAdBreak } from '@/utils/adsenseLoader';

// Charger le script en mode test
await loadAdBreaksScript('ca-pub-XXXXXXXXXXXXXXXX', true);

// Déclencher un Ad Break
triggerAdBreak({
  type: 'start',
  name: 'debut-session',
  beforeAd: () => console.log('Pub va commencer'),
  afterAd: () => console.log('Pub terminée')
});
```

### 3. Types d'Ad Breaks

| Type | Quand l'utiliser | Exemple koora.com |
|------|------------------|-------------------|
| `start` | Début de session | Première visite du site |
| `pause` | Pause naturelle | Fin de lecture article |
| `next` | Progression | Changement de page/section |
| `browse` | Navigation | Accès aux classements |
| `reward` | Récompense | Quiz foot avec récompense |

## 🔒 Sécurité du Mode Test

### ✅ Ce qui est sûr avec `data-adbreak-test="on"`

- **Vraies annonces** Google affichées
- **Aucune facturation** des impressions
- **Aucun impact** sur les statistiques AdSense
- **Clics non comptabilisés** (même accidentels)
- **Pas de pénalités** possibles

### ⚠️ À éviter absolument

```typescript
// ❌ DANGER - Mode production sans être sûr
loadAdBreaksScript(clientId, false); // Peut générer de vrais revenus
```

```typescript
// ✅ SÉCURISÉ - Mode test pendant développement
loadAdBreaksScript(clientId, true); // Mode test activé
```

## 🎯 Cas d'Usage pour Koora.com

### Moments Idéaux pour Ad Breaks

1. **Après lecture complète d'un article**
   ```typescript
   // Quand l'utilisateur arrive en bas de l'article
   triggerAdBreak({ type: 'next', name: 'fin-article' });
   ```

2. **Navigation vers section importante**
   ```typescript
   // Avant d'afficher les classements
   triggerAdBreak({ type: 'browse', name: 'avant-classements' });
   ```

3. **Pause entre mi-temps (live)**
   ```typescript
   // Pendant la mi-temps d'un match en direct
   triggerAdBreak({ type: 'pause', name: 'mi-temps' });
   ```

4. **Quiz/Jeu interactif**
   ```typescript
   // Récompense après un quiz sur le foot
   triggerAdBreak({ type: 'reward', name: 'quiz-termine' });
   ```

## 📊 Debug et Vérification

### 1. Console du navigateur

```javascript
// Vérifier que Ad Breaks est chargé
console.log(typeof window.adBreak); // doit afficher "function"

// Vérifier le mode test
const scripts = document.querySelectorAll('script[data-adbreak-test]');
console.log(scripts.length > 0 ? 'Mode test activé' : 'Mode production');
```

### 2. Network tab (DevTools)

- Cherche les requêtes vers `googlesyndication.com`
- Vérifie la présence de `adbreak-test` dans les paramètres
- Les requêtes en mode test ont des identifiants spéciaux

### 3. Callbacks de debug

```typescript
triggerAdBreak({
  type: 'start',
  beforeAd: () => console.log('🎬 Ad Break commence'),
  afterAd: () => console.log('✅ Ad Break terminé'),
  adDismissed: () => console.log('❌ Utilisateur a fermé'),
  adViewed: () => console.log('👁️ Pub vue complètement')
});
```

## 🔄 Migration depuis Annonces Display

Si tu veux remplacer certaines bannières par des Ad Breaks :

### Avant (Display)
```tsx
<GoogleAdSense
  client="ca-pub-XXXXX"
  slot="123456789"
  format="rectangle"
  testMode={true}
/>
```

### Après (Ad Break)
```tsx
<button onClick={() => triggerAdBreak({ type: 'browse' })}>
  Voir les Classements
</button>
```

## 📱 Responsive et Mobile

Ad Breaks fonctionne parfaitement sur mobile et desktop. Les annonces s'adaptent automatiquement à la taille d'écran.

## 🚨 Points Importants

1. **Toujours tester d'abord** avec `data-adbreak-test="on"`
2. **Ne pas abuser** : max 1-2 Ad Breaks par session utilisateur
3. **Moments naturels** : ne pas interrompre une action importante
4. **Feedback utilisateur** : utiliser les callbacks pour améliorer l'UX

## 📞 Support et Debugging

Si ça ne fonctionne pas :

1. **Vérifier le Client ID** dans la console réseau
2. **Consulter les logs** de notre composant `AdBreaksTest`
3. **Tester d'abord en mode test** avant production
4. **Vérifier la compatibilité** avec tes autres scripts

---

**🎮 Résumé :** Tu as maintenant un système complet pour tester de vraies annonces interstitielles AdSense en mode sécurisé, exactement comme tu le demandais avec `data-adbreak-test="on"` !