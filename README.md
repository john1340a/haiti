# Patrimoine Haïti Nord - Web SIG

Application web cartographique interactive pour explorer le patrimoine culturel et historique du Nord d'Haïti.

## Fonctionnalités

- **Carte interactive** avec fond de carte Jawg Streets (MapLibre GL JS)
- **Marqueurs personnalisés** colorés par catégorie (forteresses, palais, églises, monuments, sites naturels)
- **Filtrage par catégorie** via un panneau latéral
- **Modal détaillé** avec photo, titre et description
- **Mode 360°** interactif pour explorer les panoramas (glisser pour naviguer)

## Prérequis

- Node.js 18+ 
- pnpm (ou npm/yarn)

## Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd patrimoine-haiti-nord
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer la clé API Jawg**

   Le projet utilise des variables d'environnement pour la clé API. 
   - Créez un fichier `.env.local` à la racine du projet.
   - Ajoutez votre jeton d'accès Jawg :
   ```env
   NEXT_PUBLIC_JAWG_ACCESS_TOKEN=VOTRE_CLE_API
   ```
   Vous pouvez obtenir une clé API gratuite sur [jawg.io](https://www.jawg.io/).

4. **Configuration pour Vercel (Production)**

   Lors du déploiement sur Vercel, vous devez ajouter la variable d'environnement dans le tableau de bord Vercel :
   - Allez dans **Settings** > **Environment Variables**.
   - Ajoutez `NEXT_PUBLIC_JAWG_ACCESS_TOKEN` avec votre clé API.

5. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```

6. **Ouvrir dans le navigateur**
   ```
   http://localhost:3000
   ```

## Structure du projet

```
├── app/
│   ├── globals.css       # Styles globaux et tokens de design
│   ├── layout.tsx        # Layout principal
│   └── page.tsx          # Page d'accueil avec la carte
├── components/
│   ├── patrimoine-map.tsx    # Composant carte MapLibre avec marqueurs
│   ├── patrimoine-modal.tsx  # Modal de détail avec vue 360°
│   └── ui/                   # Composants UI (shadcn/ui)
└── public/                   # Assets statiques
```

## Technologies utilisées

- **Next.js 15** - Framework React
- **MapLibre GL JS** - Rendu de carte vectorielle
- **Jawg Maps** - Fournisseur de tuiles cartographiques
- **Tailwind CSS v4** - Styles utilitaires
- **shadcn/ui** - Composants UI
- **Lucide React** - Icônes

## Sites patrimoniaux inclus

| Site | Catégorie | Vue 360° |
|------|-----------|----------|
| Citadelle Laferrière | Forteresse | Oui |
| Palais Sans-Souci | Palais | Oui |
| Cathédrale Notre-Dame du Cap-Haïtien | Église | Non |
| Fort Picolet | Forteresse | Oui |
| Monument de Vertières | Monument | Non |
| Bassin Bleu | Site naturel | Oui |

## Personnalisation

### Ajouter un nouveau site

Dans `components/patrimoine-map.tsx`, ajoutez un objet au tableau `HERITAGE_SITES` :

```typescript
{
  id: "nouveau-site",
  name: "Nom du site",
  description: "Description du site...",
  coordinates: [longitude, latitude], // Format [lng, lat]
  imageUrl: "https://...",
  has360: true, // ou false
  panoramaUrl: "https://...", // optionnel si has360 est false
  category: "fortress" | "palace" | "church" | "monument" | "nature",
}
```

### Modifier les couleurs des catégories

Les couleurs sont définies dans l'objet `categoryColors` du même fichier.

## Déploiement

```bash
pnpm build
pnpm start
```

Ou déployez directement sur [Vercel](https://vercel.com).

## Licence

MIT
