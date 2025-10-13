# Guide de Test AdSense - Annonces Réelles en Mode Sécurisé

## 🎯 Objectif

Ce guide t'explique comment tester des **vraies annonces Google AdSense** sur ton site **koora.com** sans risquer de pénalités ou d'impact sur tes statistiques réelles.

## 🔧 Nouveaux Composants Créés

### 1. `GoogleAdSenseTestMode.tsx`
Composant spécialement conçu pour afficher de vraies annonces avec `data-adtest="on"`.

### 2. `RealAdTestPage.tsx`
Page de test complète pour tester tous les formats d'annonces.

## 🧪 Comment ça fonctionne

### Mode Test Sécurisé (`data-adtest="on"`)

```tsx
<GoogleAdSenseTestMode
  client="ca-pub-XXXXXXXXXXXXXXXX"
  slot="1234567890"
  format="rectangle"
  enableTestMode={true}  // ← Active le mode test
/>
```

**Ce qui se passe :**
- ✅ Annonces **réelles** de Google
- ✅ Design et comportement authentiques  
- ✅ Test des dimensions et responsive
- ❌ **AUCUN** impact sur les statistiques
- ❌ **AUCUNE** facturation des impressions/clics

## 📋 Variables d'Environnement Requises

Assure-toi d'avoir ces variables dans ton fichier `.env` :

```env
# AdSense Configuration
VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_HEADER_SLOT=1234567890
VITE_ADSENSE_SIDEBAR_SLOT=0987654321
VITE_ADSENSE_MOBILE_SLOT=1122334455
VITE_ADSENSE_ARTICLE_SLOT=5544332211
VITE_ADSENSE_FOOTER_SLOT=9988776655
```

## 🚀 Comment Tester

### 1. Accéder à la page de test

```bash
# Lance ton serveur de développement
npm run dev

# Ou avec bun
bun dev
```

Puis navigue vers la **page de test** (selon ton routing).

### 2. Utiliser le composant dans tes pages

```tsx
import GoogleAdSenseTestMode from '@/components/GoogleAdSenseTestMode';

function TestPage() {
  return (
    <div>
      <h1>Test AdSense</h1>
      
      {/* Test Header Ad */}
      <GoogleAdSenseTestMode
        client={import.meta.env.VITE_ADSENSE_CLIENT}
        slot={import.meta.env.VITE_ADSENSE_HEADER_SLOT}
        format="leaderboard"
        enableTestMode={true}
      />
      
      {/* Test Sidebar Ad */}
      <GoogleAdSenseTestMode
        client={import.meta.env.VITE_ADSENSE_CLIENT}
        slot={import.meta.env.VITE_ADSENSE_SIDEBAR_SLOT}
        format="rectangle"
        enableTestMode={true}
      />
    </div>
  );
}
```

## 🔍 Formats de Test Disponibles

| Format | Dimensions | Usage Recommandé |
|--------|------------|------------------|
| `leaderboard` | 728x90 | Header/Footer |
| `rectangle` | 300x250 | Sidebar |
| `large-rectangle` | 336x280 | Sidebar large |
| `banner` | 320x50 | Mobile header |
| `mobile-banner` | 320x100 | Mobile content |
| `responsive` | Auto | Adaptatif |
| `in-article` | Auto | Dans les articles |

## 🎮 Contrôles de Test

### Toggle Test Mode

```tsx
const [testMode, setTestMode] = useState(true);

<GoogleAdSenseTestMode
  enableTestMode={testMode}  // ← Contrôle dynamique
  // ... autres props
/>

<button onClick={() => setTestMode(!testMode)}>
  {testMode ? '🧪 Test ON' : '🚨 Test OFF'}
</button>
```

## 🛡️ Sécurité

### ⚠️ IMPORTANT - Ne PAS faire :

```tsx
// ❌ DANGER - Mode production sans test
<GoogleAdSenseTestMode
  enableTestMode={false}  // ← Peut générer de vrais clics
/>
```

### ✅ TOUJOURS faire en développement :

```tsx
// ✅ SÉCURISÉ - Mode test actif
<GoogleAdSenseTestMode
  enableTestMode={true}   // ← Mode test sécurisé
/>
```

## 🔧 Debug et Vérification

### 1. Vérifier les requêtes réseau
- Ouvre les DevTools (F12)
- Onglet **Network**
- Cherche les requêtes vers `googleads.g.doubleclick.net`
- Vérifie que `adtest=on` est présent dans l'URL

### 2. Console logs
Le composant affiche des logs utiles :

```
🧪 Chargement AdSense en mode TEST avec vraies annonces
✅ Mode Test: Activé (data-adtest=on)
```

### 3. Indicateur visuel
Un badge "🧪 TEST MODE" apparaît sur chaque annonce en mode test.

## 📊 Différences avec l'ancien système

| Ancien (`GoogleAdSense`) | Nouveau (`GoogleAdSenseTestMode`) |
|--------------------------|-----------------------------------|
| Mode test = placeholders | Mode test = vraies annonces |
| Pas de test authentique | Test avec vraie API Google |
| Design approximatif | Design exact |

## 🌐 Intégration avec tes Pages Existantes

### Exemple : Remplacer dans Index.tsx

```tsx
// Avant
import GoogleAdSense from '@/components/GoogleAdSense';

// Après  
import GoogleAdSenseTestMode from '@/components/GoogleAdSenseTestMode';

// Dans le composant
<GoogleAdSenseTestMode
  client={import.meta.env.VITE_ADSENSE_CLIENT}
  slot={import.meta.env.VITE_ADSENSE_HEADER_SLOT}
  format="leaderboard"
  enableTestMode={true}  // ← Pour tester
/>
```

## 🎯 Prochaines Étapes

1. **Configure tes variables d'environnement**
2. **Teste la `RealAdTestPage`**
3. **Intègre dans tes pages principales**
4. **Vérifie le comportement responsive**
5. **Passe en mode production** (`enableTestMode={false}`) quand prêt

## 📞 Support

Si tu as des questions ou des problèmes :
- Vérifie les variables d'environnement
- Consulte la console pour les logs
- Assure-toi que ton Client ID AdSense est valide

---

**🚨 Rappel Important :** Toujours utiliser `enableTestMode={true}` pendant le développement pour éviter les clics accidentels sur les vraies annonces.