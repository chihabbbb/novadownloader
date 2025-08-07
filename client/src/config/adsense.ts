// Configuration AdSense pour NovaDownloader
// Remplacez ces valeurs par vos vrais IDs de slot AdSense

export const ADSENSE_CONFIG = {
  // Votre client ID AdSense (à remplacer)
  CLIENT_ID: "pub-1326206466379328",
  
  // Slots d'annonces par position
  SLOTS: {
    // Bannière principale après le hero
    HERO_BANNER: "1234567890",
    
    // Bannière rectangulaire entre les sections
    MIDDLE_RECTANGLE: "0987654321",
    
    // Bannière avant la section privacy
    PRIVACY_BANNER: "1122334455",
    
    // Bannière dans le footer
    FOOTER_BANNER: "5566778899",
    
    // Sidebar publicitaire (optionnelle)
    SIDEBAR_VERTICAL: "9988776655",
    
    // Bannières supplémentaires (pour tests A/B)
    ALTERNATIVE_1: "1357924680",
    ALTERNATIVE_2: "2468135790",
  },
  
  // Configuration des types d'annonces
  AD_FORMATS: {
    RESPONSIVE: "auto",
    RECTANGLE: "rectangle",
    VERTICAL: "vertical",
    HORIZONTAL: "horizontal",
  },
  
  // Paramètres d'affichage
  DISPLAY_SETTINGS: {
    // Délai avant affichage de la sidebar (en ms)
    SIDEBAR_DELAY: 10000,
    
    // Activer/désactiver la sidebar publicitaire
    ENABLE_SIDEBAR: false,
    
    // Position de la sidebar
    SIDEBAR_POSITION: "right" as "left" | "right",
    
    // Activer les animations
    ENABLE_ANIMATIONS: true,
  }
} as const;

// Fonction utilitaire pour obtenir un slot spécifique
export const getAdSlot = (slotName: keyof typeof ADSENSE_CONFIG.SLOTS): string => {
  return ADSENSE_CONFIG.SLOTS[slotName];
};

// Fonction pour vérifier si AdSense est configuré
export const isAdSenseConfigured = (): boolean => {
  return ADSENSE_CONFIG.CLIENT_ID !== "ca-pub-XXXXXXXXXXXXXXXXX";
};

// Instructions de configuration (en commentaire)
/*
INSTRUCTIONS DE CONFIGURATION ADSENSE :

1. Remplacez CLIENT_ID par votre vrai client ID AdSense
2. Créez des unités publicitaires dans votre compte AdSense
3. Remplacez les SLOTS par vos vrais IDs de slot
4. Configurez DISPLAY_SETTINGS selon vos préférences
5. Mettez à jour le script AdSense dans index.html avec votre client ID

POSITIONS DES ANNONCES :
- HERO_BANNER: Après le titre principal
- MIDDLE_RECTANGLE: Entre les sections download et platforms
- PRIVACY_BANNER: Avant la section privacy
- FOOTER_BANNER: Dans le footer
- SIDEBAR_VERTICAL: Sidebar fixe (optionnelle)

FORMATS RECOMMANDÉS :
- Bannières responsive pour mobile
- Rectangles 300x250 pour desktop
- Verticales 160x600 pour sidebar
*/