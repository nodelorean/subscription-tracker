
// SubTrack - Gestionnaire d'abonnements



// VARIABLES GLOBALES


// URL de base pour les appels API (vide car même origine)
const API_BASE = '';

// Tableau stockant les abonnements de l'utilisateur connecté
let subscriptions = [];

// Clé du preset actuellement sélectionné dans le formulaire d'ajout
let selectedPreset = null;

// Devise et langue actuellement sélectionnées
let currentCurrency = 'EUR';
let currentLang = 'fr';

// CONFIGURATION DES DEVISES

/**
 * Données relatives à chaque devise :
 * - symbol : symbole monétaire affiché
 * - rate : taux de conversion depuis l'EUR (base 1)
 * - minWageHourly : salaire minimum horaire dans la devise
 * - minWageMonthly : salaire minimum mensuel dans la devise
 */
const currencies = {
    EUR: { 
        symbol: '€', 
        rate: 1,
        minWageHourly: 11.27,
        minWageMonthly: 1766.92
    },
    USD: { 
        symbol: '$', 
        rate: 1.08,
        minWageHourly: 7.25,
        minWageMonthly: 1257.33
    },
    GBP: { 
        symbol: '£', 
        rate: 0.85,
        minWageHourly: 11.44,
        minWageMonthly: 1976.00
    }
};

// FONCTIONS DE CONVERSION ET FORMATAGE DES PRIX

/**
 * Formate un prix EUR vers la devise sélectionnée avec symbole
 * @param {number} priceEUR - Prix en euros
 * @returns {string} - Prix formaté (ex: "29.99 €")
 */
function formatPrice(priceEUR) {
    const curr = currencies[currentCurrency];
    const converted = priceEUR * curr.rate;
    return `${converted.toFixed(2)} ${curr.symbol}`;
}

/**
 * Formate un prix EUR vers la devise sélectionnée sans espace
 * @param {number} priceEUR - Prix en euros
 * @returns {string} - Prix formaté compact (ex: "29.99€")
 */
function formatPriceShort(priceEUR) {
    const curr = currencies[currentCurrency];
    const converted = priceEUR * curr.rate;
    return `${converted.toFixed(2)}${curr.symbol}`;
}

/**
 * Convertit un prix EUR vers la devise sélectionnée
 * @param {number} priceEUR - Prix en euros
 * @returns {number} - Prix converti
 */
function convertPrice(priceEUR) {
    const curr = currencies[currentCurrency];
    return priceEUR * curr.rate;
}

// SYSTEME DE TRADUCTION (i18n)

/**
 * Dictionnaire de traductions pour les trois langues supportées
 * Clés de traduction utilisées via l'attribut data-i18n dans le HTML
 */
const translations = {
    fr: {
        // Titres et descriptions principales
        hero_title: "Maîtrisez vos abonnements",
        hero_subtitle: "Visualisez, analysez et optimisez vos dépenses mensuelles en un seul endroit.",
        subtitle: "Visualisez et maîtrisez vos dépenses mensuelles",
        
        // Boutons d'authentification
        login: "Connexion",
        register: "Inscription",
        logout: "Déconnexion",
        do_login: "Se connecter",
        do_register: "S'inscrire",
        
        // Actions principales
        add_sub: "Ajouter un abonnement",
        import_csv: "Importer CSV",
        
        // Section analytique
        opportunity_title: "Analyse d'opportunité",
        streaming_title: "Analyse de vos abonnements streaming",
        streaming_best_value: "Meilleur rapport qualité/prix",
        streaming_overlap: "Vous avez Netflix ET Disney+ : envisagez de garder l'un des deux et de tourner.",
        projection_title: "Projection des hausses de prix",
        projection_subtitle: "Streaming : +8%/an | Logiciels : +5%/an | Autres : +1%/an",
        projection_increase: "Hausse estimée en 1 an",
        
        // Totaux
        total_month: "Total / Mois",
        total_year: "Total / An",
        
        // Formulaire
        username: "Nom d'utilisateur",
        password: "Mot de passe",
        presets: "Présélections",
        manual: "Manuel",
        service: "Service",
        choose_plan: "Choisir l'offre",
        price: "Prix",
        billing: "Facturation",
        monthly: "Mensuel",
        yearly: "Annuel",
        next_payment: "Prochain paiement",
        shared_sub: "Abonnement partagé",
        add_sub_btn: "Ajouter l'abonnement",
        import_csv_title: "Importer un fichier CSV",
        drag_csv: "Glissez votre fichier CSV ici",
        or: "ou",
        browse: "Parcourir",
        icon_url: "URL de l'icône (optionnel)",
        
        // États et messages
        no_sub: "Aucun abonnement",
        click_add: 'Cliquez sur "Ajouter" pour commencer',
        shared: "Partagé",
        delete_confirm: "Supprimer cet abonnement ?",
        
        // Dates
        in_days: "dans {n}j",
        today: "aujourd'hui",
        late: "en retard",
        per_month: "/mois",
        per_year: "/an",
        
        // Analyse d'opportunité
        hours_work: "Heures de travail",
        hours_desc: "par an (salaire min.)",
        daily_cost: "Coût par jour",
        daily_avg: "en moyenne",
        percent_wage: "% du salaire min.",
        wage_desc: "de votre revenu net",
        flights: "Vols Paris-New York",
        flights_desc: "billets aller-retour",
        etf_gain: "Gain ETF S&P 500",
        etf_desc: "après 10 ans (10%/an)"
    },
    en: {
        hero_title: "Master your subscriptions",
        hero_subtitle: "Visualize, analyze and optimize your monthly expenses in one place.",
        subtitle: "Visualize and master your monthly expenses",
        login: "Login",
        register: "Sign up",
        logout: "Logout",
        do_login: "Log in",
        do_register: "Sign up",
        add_sub: "Add subscription",
        import_csv: "Import CSV",
        opportunity_title: "Opportunity analysis",
        streaming_title: "Your streaming subscriptions analysis",
        streaming_best_value: "Best value for money",
        streaming_overlap: "You have Netflix AND Disney+: consider keeping one and rotating.",
        projection_title: "Price increase projection",
        projection_subtitle: "Streaming: +8%/yr | Software: +5%/yr | Others: +1%/yr",
        projection_increase: "Estimated increase in 1 year",
        total_month: "Total / Month",
        total_year: "Total / Year",
        username: "Username",
        password: "Password",
        presets: "Presets",
        manual: "Manual",
        service: "Service",
        choose_plan: "Choose plan",
        price: "Price",
        billing: "Billing",
        monthly: "Monthly",
        yearly: "Yearly",
        next_payment: "Next payment",
        shared_sub: "Shared subscription",
        add_sub_btn: "Add subscription",
        import_csv_title: "Import CSV file",
        drag_csv: "Drag your CSV file here",
        or: "or",
        browse: "Browse",
        icon_url: "Icon URL (optional)",
        no_sub: "No subscriptions",
        click_add: 'Click "Add" to get started',
        shared: "Shared",
        delete_confirm: "Delete this subscription?",
        in_days: "in {n}d",
        today: "today",
        late: "late",
        per_month: "/mo",
        per_year: "/yr",
        hours_work: "Working hours",
        hours_desc: "per year (min wage)",
        daily_cost: "Daily cost",
        daily_avg: "on average",
        percent_wage: "% of min wage",
        wage_desc: "of your net income",
        flights: "Paris-New York flights",
        flights_desc: "round trip tickets",
        etf_gain: "ETF S&P 500 gain",
        etf_desc: "after 10 years (10%/yr)"
    },
    es: {
        hero_title: "Domina tus suscripciones",
        hero_subtitle: "Visualiza, analiza y optimiza tus gastos mensuales en un solo lugar.",
        subtitle: "Visualiza y domina tus gastos mensuales",
        login: "Iniciar sesión",
        register: "Registrarse",
        logout: "Cerrar sesión",
        do_login: "Iniciar sesión",
        do_register: "Registrarse",
        add_sub: "Añadir suscripción",
        import_csv: "Importar CSV",
        opportunity_title: "Análisis de oportunidad",
        streaming_title: "Análisis de tus suscripciones streaming",
        streaming_best_value: "Mejor relación calidad-precio",
        streaming_overlap: "Tienes Netflix Y Disney+: considera mantener uno y rotar.",
        projection_title: "Proyección de aumento de precios",
        projection_subtitle: "Streaming: +8%/año | Software: +5%/año | Otros: +1%/año",
        projection_increase: "Aumento estimado en 1 año",
        total_month: "Total / Mes",
        total_year: "Total / Año",
        username: "Nombre de usuario",
        password: "Contraseña",
        presets: "Preselecciones",
        manual: "Manual",
        service: "Servicio",
        choose_plan: "Elegir plan",
        price: "Precio",
        billing: "Facturación",
        monthly: "Mensual",
        yearly: "Anual",
        next_payment: "Próximo pago",
        shared_sub: "Suscripción compartida",
        add_sub_btn: "Añadir suscripción",
        import_csv_title: "Importar archivo CSV",
        drag_csv: "Arrastra tu archivo CSV aquí",
        or: "o",
        browse: "Explorar",
        icon_url: "URL del icono (opcional)",
        no_sub: "Sin suscripciones",
        click_add: 'Haz clic en "Añadir" para comenzar',
        shared: "Compartido",
        delete_confirm: "¿Eliminar esta suscripción?",
        in_days: "en {n}d",
        today: "hoy",
        late: "atrasado",
        per_month: "/mes",
        per_year: "/año",
        hours_work: "Horas de trabajo",
        hours_desc: "por año (salario mínimo)",
        daily_cost: "Costo diario",
        daily_avg: "en promedio",
        percent_wage: "% del salario min.",
        wage_desc: "de tu ingreso neto",
        flights: "Vuelos París-Nueva York",
        flights_desc: "billetes ida y vuelta",
        etf_gain: "Ganancia ETF S&P 500",
        etf_desc: "después de 10 años (10%/año)"
    }
};

/**
 * Retourne la traduction correspondant à la clé et à la langue actuelle
 * @param {string} key - Clé de traduction
 * @param {Object} replacements - Remplacements dynamiques {cle: valeur}
 * @returns {string} - Texte traduit
 */
function t(key, replacements = {}) {
    let text = translations[currentLang]?.[key] || translations.fr[key] || key;
    Object.keys(replacements).forEach(k => {
        text = text.replace(`{${k}}`, replacements[k]);
    });
    return text;
}

/**
 * Met à jour tous les éléments HTML possédant l'attribut data-i18n
 */
function updateAllTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
}


// CONFIGURATION DES SERVICES ET PRIX (2026)


/**
 * Prix des abonnements par service et par offre
 * Tous les prix sont en EUR (base de calcul)
 */
const servicePlans = {
    'spotify': [
        { name: 'Premium', price: 11.99 },
        { name: 'Duo', price: 15.99 },
        { name: 'Family', price: 18.99 },
        { name: 'Student', price: 7.02 }
    ],
    'netflix': [
        { name: 'Standard', price: 15.99 },
        { name: 'Premium', price: 22.99 },
        { name: 'Essential', price: 5.99 }
    ],
    'disney': [
        { name: 'Standard', price: 9.99 },
        { name: 'Premium', price: 14.99 },
        { name: 'With Ads', price: 5.99 }
    ],
    'youtube': [
        { name: 'Premium', price: 13.99 },
        { name: 'Family', price: 22.99 },
        { name: 'Student', price: 7.99 }
    ],
    'chatgpt': [
        { name: 'Plus', price: 20.00 },
        { name: 'Pro', price: 200.00 },
        { name: 'Team', price: 25.00 }
    ],
    'microsoft': [
        { name: 'Personal', price: 7.99 },
        { name: 'Family', price: 10.99 },
        { name: 'Basic', price: 1.99 }
    ],
    'apple': [
        { name: 'Individual', price: 10.99 },
        { name: 'Family', price: 16.99 },
        { name: 'Student', price: 5.99 }
    ],
    'prime': [
        { name: 'Monthly', price: 6.99 },
        { name: 'Annual', price: 69.00 }
    ],
    'adobe': [
        { name: 'All Apps', price: 59.99 },
        { name: 'Single App', price: 27.99 },
        { name: 'Photography', price: 11.99 }
    ],
    'gym': [
        { name: 'Standard', price: 35.00 },
        { name: 'Premium', price: 60.00 },
        { name: 'Basic', price: 20.00 }
    ],
    'notion': [
        { name: 'Plus', price: 10.00 },
        { name: 'Business', price: 18.00 }
    ],
    'dropbox': [
        { name: 'Plus', price: 11.99 },
        { name: 'Professional', price: 19.99 }
    ],
    'google': [
        { name: 'Basic 100GB', price: 1.99 },
        { name: 'Standard 200GB', price: 2.99 },
        { name: 'Premium 2TB', price: 9.99 }
    ],
    'deezer': [
        { name: 'Premium', price: 11.99 },
        { name: 'Family', price: 15.99 },
        { name: 'Student', price: 5.99 }
    ],
    'xbox': [
        { name: 'Ultimate', price: 16.99 },
        { name: 'Core', price: 9.99 },
        { name: 'PC Game Pass', price: 11.99 }
    ],
    'playstation': [
        { name: 'Essential', price: 9.99 },
        { name: 'Extra', price: 14.99 },
        { name: 'Premium', price: 17.99 }
    ],
    'strava': [
        { name: 'Monthly', price: 11.99 },
        { name: 'Annual', price: 84.99 }
    ],
    'headspace': [
        { name: 'Monthly', price: 12.99 },
        { name: 'Annual', price: 69.99 }
    ],
    'canal': [
        { name: 'Canal+ Séries', price: 19.99 },
        { name: 'Canal+ Sport', price: 29.99 },
        { name: 'Canal+ Ciné', price: 29.99 },
        { name: 'Canal+ Total', price: 59.99 }
    ],
    'nintendo': [
        { name: 'Individual', price: 3.99 },
        { name: 'Family', price: 6.99 }
    ]
};

/**
 * Icônes et couleurs pour chaque service (présélections)
 */
const servicePresets = {
    'spotify': {
        name: 'Spotify',
        icon: 'https://happyneon.fr/cdn/shop/products/Spotify-Logo-Neon-Like-Sign-on.jpg?v=1747837856',
        color: '#1DB954'
    },
    'netflix': {
        name: 'Netflix',
        icon: 'https://img.icons8.com/liquid-glass-color/1200/netflix.jpg',
        color: '#E50914'
    },
    'adobe': {
        name: 'Adobe Creative Cloud',
        icon: 'https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Adobe-logo-transparent-background-PNG.png',
        color: '#FF0000'
    },
    'youtube': {
        name: 'YouTube Premium',
        icon: 'https://images.seeklogo.com/logo-png/36/2/youtube-premium-logo-png_seeklogo-364940.png',
        color: '#FF0000'
    },
    'disney': {
        name: 'Disney+',
        icon: 'https://m.media-amazon.com/images/I/719t3jd2NeL.png',
        color: '#113CCF'
    },
    'chatgpt': {
        name: 'ChatGPT Plus',
        icon: `https://upload.wikimedia.org/wikipedia/commons/1/13/ChatGPT-Logo.png`,
        color: '#10A37F'
    },
    'microsoft': {
        name: 'Microsoft 365',
        icon: 'https://x5h8w2v3.delivery.rocketcdn.me/wp-content/uploads/2024/11/Logo-Microsoft-365-Business.png',
        color: '#00A4EF'
    },
    'apple': {
        name: 'Apple Music',
        icon: 'https://www.apple.com/newsroom/images/product/apple-music/apple_music-update_hero_08242021.jpg.news_app_ed.jpg',
        color: '#FA243C'
    },
    'prime': {
        name: 'Prime Video',
        icon: 'https://img.icons8.com/fluent/1200/amazon-prime-video.jpg',
        color: '#00A8E1'
    },
    'gym': {
        name: 'Salle de sport',
        icon: `https://graphiste.com/blog/wp-content/uploads/sites/4/2022/08/b42b4c818c7f2a60793216c51460e8df.jpg`,
        color: '#8b5cf6'
    },
    'notion': {
        name: 'Notion',
        icon: `https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png`,
        color: '#000000'
    },
    'dropbox': {
        name: 'Dropbox',
        icon: 'https://www.logo.wine/a/logo/Dropbox_(service)/Dropbox_(service)-Icon-Logo.wine.svg',
        color: '#0061FF'
    },
    'google': {
        name: 'Google One',
        icon: `https://play-lh.googleusercontent.com/B5AENJqFOd91t5cWZLTQbVUm7iDWzYVM1n0Pe2RI_46dhlWMtVAUBioUvy4YMXWdwA`,
        color: '#4285F4'
    },
    'deezer': {
        name: 'Deezer',
        icon: 'https://play-lh.googleusercontent.com/F9uslCD68SA59MsRuLJ4vT0o1a6WccmFufSRtfCaIg12K45jySvUqOViLWNSURq-NXyE=w1024',
        color: '#fe2da0'
    },
    'xbox': {
        name: 'Xbox Game Pass',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/1280px-Xbox_one_logo.svg.png',
        color: '#10ff10'
    },
    'playstation': {
        name: 'PlayStation+',
        icon: 'https://logo-marque.com/wp-content/uploads/2020/11/PlayStation-Embleme.png',
        color: '#003087'
    },
    'strava': {
        name: 'Strava',
        icon: 'https://images.icon-icons.com/2108/PNG/512/strava_icon_130820.png',
        color: '#FC4C02'
    },
    'headspace': {
        name: 'Headspace',
        icon: 'https://healthcenter.uga.edu/wp-content/uploads/sites/19/2022/09/headspace-1.jpg',
        color: '#F47D30'
    },
    'canal': {
        name: 'Canal+',
        icon: 'https://www.creads.com/wp-content/uploads/2021/05/google_avatar_canalplus.jpg',
        color: '#000000'
    },
    'nintendo': {
        name: 'Nintendo Online',
        icon: 'https://sm.ign.com/ign_fr/cover/n/nintendo-s/nintendo-switch-online_nbsp.jpg',
        color: '#e60012'
    }
};

// ============================================================================
// CALCULS DES TOTAUX
// ============================================================================

/**
 * Calcule le prix mensuel à partir du prix stocké et du cycle de facturation
 * @param {number} price - Prix stocké (mensuel ou annuel selon le cycle)
 * @param {string} cycle - 'monthly' ou 'yearly'
 * @returns {number} - Prix mensuel
 */
function getMonthlyPrice(price, cycle) {
    return cycle === 'yearly' ? price / 12 : price;
}

/**
 * Calcule le prix annuel à partir du prix stocké et du cycle de facturation
 * @param {number} price - Prix stocké (mensuel ou annuel selon le cycle)
 * @param {string} cycle - 'monthly' ou 'yearly'
 * @returns {number} - Prix annuel
 */
function getYearlyPrice(price, cycle) {
    return cycle === 'yearly' ? price : price * 12;
}

/**
 * Calcule les totaux mensuel et annuel de tous les abonnements
 * Prend en compte l'option "partagé" (50% du prix)
 * @returns {Object} - {monthlyTotal, yearlyTotal}
 */
function calculateTotals() {
    let monthlyTotal = 0;
    subscriptions.forEach(sub => {
        let price = getMonthlyPrice(sub.price, sub.cycle);
        if (sub.shared === 1) {
            price = price / 2;
        }
        monthlyTotal += price;
    });
    const yearlyTotal = monthlyTotal * 12;
    return { monthlyTotal, yearlyTotal };
}

/**
 * Met à jour l'affichage des totaux dans la barre de résumé
 */
function updateSummary() {
    const { monthlyTotal, yearlyTotal } = calculateTotals();
    document.getElementById('monthlyTotal').textContent = formatPrice(monthlyTotal);
    document.getElementById('yearlyTotal').textContent = formatPrice(yearlyTotal);
}


// TAUX D'INFLATION PAR CATEGORIE DE SERVICE

/**
 * Taux d'inflation annuel par catégorie de service
 * Basé sur les hausses historiques observées par secteur
 */
const inflationRates = {
    streaming: 0.08,      // 8% - Services de streaming vidéo/musique (Netflix, Spotify, etc.)
    canal: 0.00,          // 0% - Canal+ n'applique pas de hausse automatique
    software: 0.05,       // 5% - Logiciels SaaS (Adobe, Microsoft, Notion, ChatGPT)
    gaming: 0.04,         // 4% - Services gaming (Xbox, PlayStation, Nintendo)
    fitness: 0.03,        // 3% - Fitness et bien-être (Gym, Strava, Headspace)
    other: 0.01           // 1% - Autres services (taux d'inflation standard)
};

/**
 * Détermine le taux d'inflation applicable à un abonnement donné
 * @param {Object} sub - Objet abonnement contenant name et icon
 * @returns {number} - Taux d'inflation annuel (ex: 0.08 pour 8%)
 */
function getInflationRate(sub) {
    const name = (sub.name || '').toLowerCase();
    const icon = (sub.icon || '').toLowerCase();
    
    // Canal+ : pas de hausse automatique
    if (name.includes('canal') || icon.includes('canal')) {
        return inflationRates.canal;
    }
    
    // Services de streaming vidéo
    if (name.includes('netflix') || name.includes('disney') || name.includes('prime') || 
        icon.includes('netflix') || icon.includes('disney') || icon.includes('prime')) {
        return inflationRates.streaming;
    }
    
    // Services de streaming musique
    if (name.includes('spotify') || name.includes('apple music') || name.includes('deezer') || 
        name.includes('youtube') || icon.includes('spotify') || icon.includes('apple') || 
        icon.includes('deezer') || icon.includes('youtube')) {
        return inflationRates.streaming;
    }
    
    // Logiciels
    if (name.includes('adobe') || name.includes('microsoft') || name.includes('notion') || 
        name.includes('chatgpt') || name.includes('canva') || name.includes('grammarly') ||
        icon.includes('adobe') || icon.includes('microsoft') || icon.includes('notion')) {
        return inflationRates.software;
    }
    
    // Gaming
    if (name.includes('xbox') || name.includes('playstation') || name.includes('nintendo') || 
        name.includes('game') || icon.includes('xbox') || icon.includes('playstation') || 
        icon.includes('nintendo')) {
        return inflationRates.gaming;
    }
    
    // Fitness
    if (name.includes('gym') || name.includes('strava') || name.includes('headspace') || 
        icon.includes('strava') || icon.includes('headspace')) {
        return inflationRates.fitness;
    }
    
    return inflationRates.other;
}

// ============================================================================
// ANALYSE D'OPPORTUNITE
// ============================================================================

/**
 * Met à jour la section d'analyse d'opportunité
 * Affiche des métriques concrètes pour aider l'utilisateur à visualiser
 * le coût réel de ses abonnements
 */
function updateOpportunityCost() {
    const { monthlyTotal } = calculateTotals();
    const grid = document.getElementById('opportunityGrid');
    
    if (subscriptions.length === 0) {
        grid.innerHTML = '';
        return;
    }

    const curr = currencies[currentCurrency];
    const yearlyAmount = monthlyTotal * 12;
    const dailyAmount = monthlyTotal / 30.44;
    const minWageMonthly = curr.minWageMonthly;
    const hoursWorked = Math.round((monthlyTotal / curr.minWageHourly) * 160);
    const smicPercentage = ((monthlyTotal / minWageMonthly) * 100).toFixed(0);
    
    // ETF S&P 500 (rendement historique ~10% sur 10 ans)
    const etfValue = convertPrice(yearlyAmount * 10 * 1.10);
    
    // Vols Paris-New York (prix adapté par devise)
    const flightPrice = currentCurrency === 'USD' ? 520 : currentCurrency === 'GBP' ? 410 : 480;
    const flights = Math.floor(convertPrice(yearlyAmount) / flightPrice);

    const opportunities = [
        {
            type: 'time',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            label: t('hours_work'),
            value: hoursWorked,
            suffix: 'h',
            description: t('hours_desc')
        },
        {
            type: 'daily',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
            label: t('daily_cost'),
            value: formatPriceShort(dailyAmount),
            suffix: '',
            description: t('daily_avg')
        },
        {
            type: 'salary',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/><path d="M17 12h.01"/><path d="M7 12h.01"/></svg>',
            label: t('percent_wage'),
            value: smicPercentage + '%',
            suffix: '',
            description: t('wage_desc')
        },
        {
            type: 'travel',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>',
            label: t('flights'),
            value: flights,
            suffix: '',
            description: t('flights_desc')
        },
        {
            type: 'investment',
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
            label: t('etf_gain'),
            value: formatPriceShort(etfValue),
            suffix: '',
            description: t('etf_desc')
        }
    ];

    grid.innerHTML = opportunities.map(opp => `
        <div class="opportunity-card ${opp.type}">
            <div class="opportunity-icon">${opp.icon}</div>
            <div class="opportunity-content">
                <div class="opportunity-label">${opp.label}</div>
                <div class="opportunity-value">${opp.value}${opp.suffix ? ' ' + opp.suffix : ''}</div>
                <div class="opportunity-description">${opp.description}</div>
            </div>
        </div>
    `).join('');
    
    updateStreamingAnalyzer();
    updatePriceProjection();
}

// ANALYSEUR DE STREAMING

// Données de qualité pour chaque service de streaming
const streamingData = {
    'netflix': { name: 'Netflix', rating: 8.5, catalogSize: 15000, color: '#E50914', bestFor: 'Séries et films originaux', pros: ['Contenus originaux', 'Interface intuitive'] },
    'disney': { name: 'Disney+', rating: 8.2, catalogSize: 12000, color: '#113CCF', bestFor: 'Familles et franchises', pros: ['Marvel, Star Wars, Pixar', 'Qualité 4K'] },
    'prime': { name: 'Prime Video', rating: 7.8, catalogSize: 26000, color: '#00A8E1', bestFor: 'Budget et diversité', pros: ['Grand catalogue', 'Livraison incluse'] },
    'youtube': { name: 'YouTube Premium', rating: 7.5, catalogSize: 0, color: '#FF0000', bestFor: 'Utilisateurs YouTube', pros: ['Zéro pub', 'YouTube Music'] },
    'canal': { name: 'Canal+', rating: 7.0, catalogSize: 8000, color: '#000000', bestFor: 'Sport et cinéma', pros: ['Sport en direct', 'Films cinéma'] }
};

// Met à jour l'analyseur de streaming si l'utilisateur a 2+ abonnements streaming
function updateStreamingAnalyzer() {
    const streamingServices = subscriptions.filter(sub => {
        const key = Object.keys(streamingData).find(k => 
            (sub.name || '').toLowerCase().includes(k) || (sub.icon || '').toLowerCase().includes(k)
        );
        return key !== undefined;
    });

    const section = document.getElementById('streamingSection');
    const content = document.getElementById('streamingContent');
    if (!section || !content) return;
    
    if (streamingServices.length < 2) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    const analysis = streamingServices.map(sub => {
        const key = Object.keys(streamingData).find(k => 
            (sub.name || '').toLowerCase().includes(k) || (sub.icon || '').toLowerCase().includes(k)
        );
        const data = streamingData[key];
        return { sub, data, monthlyPrice: getMonthlyPrice(sub.price, sub.cycle) };
    });

    // Trouver le meilleur rapport qualité/prix
    const bestValue = analysis.reduce((best, current) => {
        const currentRatio = current.data.rating / current.monthlyPrice;
        const bestRatio = best.data.rating / best.monthlyPrice;
        return currentRatio > bestRatio ? current : best;
    }, analysis[0]);

    content.innerHTML = `
        <div class="streaming-recommendation">
            <div class="streaming-best" style="border-color: ${bestValue.data.color}">
                <div class="streaming-best-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span>${t('streaming_best_value')}</span>
                </div>
                <div class="streaming-best-name">${bestValue.data.name}</div>
                <div class="streaming-best-reason">${bestValue.data.bestFor}</div>
                <div class="streaming-best-stats">
                    <span>★ ${bestValue.data.rating}/10</span>
                    <span>${formatPrice(bestValue.monthlyPrice)}/mois</span>
                </div>
            </div>
        </div>
        <div class="streaming-comparison">
            ${analysis.map(a => `
                <div class="streaming-item">
                    <div class="streaming-item-header">
                        <span class="streaming-item-name">${a.data.name}</span>
                        <span class="streaming-item-price">${formatPrice(a.monthlyPrice)}</span>
                    </div>
                    <div class="streaming-item-rating">
                        <div class="streaming-rating-bar" style="width: ${a.data.rating * 10}%; background: linear-gradient(90deg, ${a.data.color}, #32D74B);"></div>
                        <span>★ ${a.data.rating}/10</span>
                    </div>
                    <div class="streaming-item-pros">
                        ${a.data.pros.map(pro => `<span class="pro">✓ ${pro}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}


// PROJECTION DE PRIX


function updatePriceProjection() {
    const section = document.getElementById('projectionSection');
    const canvas = document.getElementById('projectionChart');
    if (!section || !canvas || subscriptions.length === 0) {
        if (section) section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const { monthlyTotal } = calculateTotals();
    
    const months = 12;
    const labels = [];
    const currentPrices = [];
    const projectedPrices = [];
    const today = new Date();
    
    for (let i = 0; i < months; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        labels.push(futureDate.toLocaleDateString('fr-FR', { month: 'short' }));
        currentPrices.push(monthlyTotal);
        
        let projectedMonthly = 0;
        subscriptions.forEach(sub => {
            const monthlyPrice = getMonthlyPrice(sub.price, sub.cycle);
            const effectivePrice = (sub.shared === 1) ? monthlyPrice / 2 : monthlyPrice;
            const yearlyRate = getInflationRate(sub);
            const monthlyRate = Math.pow(1 + yearlyRate, 1/12) - 1;
            projectedMonthly += effectivePrice * Math.pow(1 + monthlyRate, i);
        });
        projectedPrices.push(projectedMonthly);
    }
    
    const width = canvas.width = canvas.parentElement.clientWidth - 40;
    const height = canvas.height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxPrice = Math.max(...projectedPrices) * 1.1;
    const minPrice = Math.min(...currentPrices) * 0.9;
    
    ctx.clearRect(0, 0, width, height);
    
    // Grille
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }
    
    // Courbe prix actuel
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(10, 132, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    for (let i = 0; i < months; i++) {
        const x = padding + (chartWidth / (months - 1)) * i;
        const y = padding + chartHeight - ((currentPrices[i] - minPrice) / (maxPrice - minPrice)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Courbe prix projeté
    ctx.beginPath();
    ctx.strokeStyle = '#FF3B30';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    for (let i = 0; i < months; i++) {
        const x = padding + (chartWidth / (months - 1)) * i;
        const y = padding + chartHeight - ((projectedPrices[i] - minPrice) / (maxPrice - minPrice)) * chartHeight;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Zone remplie
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 59, 48, 0.1)';
    ctx.moveTo(padding, padding + chartHeight);
    for (let i = 0; i < months; i++) {
        const x = padding + (chartWidth / (months - 1)) * i;
        const y = padding + chartHeight - ((projectedPrices[i] - minPrice) / (maxPrice - minPrice)) * chartHeight;
        ctx.lineTo(x, y);
    }
    ctx.lineTo(width - padding, padding + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((label, i) => {
        ctx.fillText(label, padding + (chartWidth / (months - 1)) * i, height - 10);
    });
    
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const value = minPrice + ((maxPrice - minPrice) / 4) * (4 - i);
        ctx.fillText(formatPriceShort(value), padding - 8, padding + (chartHeight / 4) * i + 4);
    }
    
    ctx.textAlign = 'left';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(10, 132, 255, 0.8)';
    ctx.fillRect(width - 180, 10, 12, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Prix actuel', width - 162, 20);
    ctx.fillStyle = '#FF3B30';
    ctx.fillRect(width - 180, 30, 12, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('Prix projeté', width - 162, 40);
    
    const totalIncrease = projectedPrices[months - 1] - currentPrices[months - 1];
    const increasePercent = ((totalIncrease / currentPrices[months - 1]) * 100).toFixed(1);
    document.getElementById('projectionIncrease').innerHTML = `${t('projection_increase')}: <strong>+${formatPrice(totalIncrease)} (+${increasePercent}%)</strong>`;
}


// RENDU DES ABONNEMENTS

function renderSubscriptions() {
    const grid = document.getElementById('subscriptionGrid');
    const { monthlyTotal } = calculateTotals();
    
    if (subscriptions.length === 0) {
        grid.innerHTML = `<div class="empty-state"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg><h3>${t('no_sub')}</h3><p>${t('click_add')}</p></div>`;
        updateSummary();
        updateOpportunityCost();
        return;
    }

    const sortedSubs = [...subscriptions].sort((a, b) => getMonthlyPrice(b.price, b.cycle) - getMonthlyPrice(a.price, a.cycle));
    
    grid.innerHTML = sortedSubs.map((sub, index) => {
        let iconHtml;
        let baseColor = '#8b5cf6';
        let isCustomUrl = false;
        
        if (sub.icon && sub.icon.startsWith('http')) {
            iconHtml = `<img src="${sub.icon}" alt="${sub.name}">`;
            baseColor = '#6b7280';
            isCustomUrl = true;
        } else {
            const preset = servicePresets[sub.icon];
            if (preset) {
                baseColor = preset.color;
                iconHtml = `<img src="${preset.icon}" alt="${sub.name}">`;
            } else {
                iconHtml = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
            }
        }

        const isShared = sub.shared === 1;
        const monthlyPrice = getMonthlyPrice(sub.price, sub.cycle);
        const yearlyPrice = getYearlyPrice(sub.price, sub.cycle);
        const displayPrice = isShared ? monthlyPrice / 2 : monthlyPrice;
        const displayYearly = isShared ? yearlyPrice / 2 : yearlyPrice;
        const percentage = monthlyTotal > 0 ? Math.round((displayPrice / monthlyTotal) * 100) : 0;

        let nextPaymentHtml = '';
        if (sub.next_billing_date) {
            const nextDate = new Date(sub.next_billing_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));
            const dateStr = nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            let daysText = diffDays > 0 ? t('in_days', { n: diffDays }) : diffDays === 0 ? t('today') : t('late');
            nextPaymentHtml = `<div class="card-next-payment"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg><span>${dateStr} (${daysText})</span></div>`;
        }

        return `
            <div class="subscription-card" data-id="${sub.id}" style="--card-accent: ${baseColor};">
                <button class="card-delete" onclick="deleteSubscription(${sub.id}); event.stopPropagation();">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div class="card-header">
                    <div class="card-icon ${isCustomUrl ? 'custom-icon' : ''}" style="background: ${isCustomUrl ? 'rgba(255,255,255,0.9)' : `linear-gradient(135deg, ${baseColor}, #333)`};">${iconHtml}</div>
                    <div class="card-badges">
                        ${isShared ? `<div class="card-badge shared-badge">${t('shared')}</div>` : ''}
                        <div class="card-badge">${percentage}%</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-name">${sub.name}</div>
                    <div class="card-price">${formatPriceShort(displayPrice)}<span>${t('per_month')}</span>${isShared ? '<span class="shared-note">(50%)</span>' : ''}</div>
                </div>
                <div class="card-footer">≈ ${formatPrice(displayYearly)}${t('per_year')}${nextPaymentHtml}</div>
            </div>
        `;
    }).join('');

    updateSummary();
    updateOpportunityCost();
}

// API FUNCTIONS


async function checkAuth() {
    const response = await fetch('/api/me');
    const data = await response.json();
    const loggedOutContainer = document.getElementById('loggedOutContainer');
    const mainContainer = document.getElementById('mainContainer');
    const appBg = document.querySelector('.app-bg');
    
    if (data.authenticated) {
        loggedOutContainer.classList.remove('active');
        mainContainer.style.display = 'block';
        appBg.style.display = 'block';
        document.getElementById('welcomeMessage').style.display = 'inline';
        document.getElementById('usernameDisplay').textContent = data.username;
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('registerBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline-flex';
        document.getElementById('actionsBar').style.display = 'flex';
        document.getElementById('summaryBar').style.display = 'flex';
        loadSubscriptions();
    } else {
        loggedOutContainer.classList.add('active');
        mainContainer.style.display = 'none';
        appBg.style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'none';
        document.getElementById('loginBtn').style.display = 'inline-flex';
        document.getElementById('registerBtn').style.display = 'inline-flex';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('actionsBar').style.display = 'none';
        document.getElementById('summaryBar').style.display = 'none';
    }
}

async function loadSubscriptions() {
    const response = await fetch('/api/subscriptions');
    if (response.ok) {
        subscriptions = await response.json();
        renderSubscriptions();
    } else if (response.status === 401) {
        subscriptions = [];
        renderSubscriptions();
    }
}

async function addSubscription(name, price, cycle, iconKey = null, shared = 0, nextBillingDate = null) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        alert('Veuillez entrer un prix valide');
        return;
    }
    const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parsedPrice, cycle, icon: iconKey, shared: shared ? 1 : 0, next_billing_date: nextBillingDate })
    });
    if (response.ok) {
        loadSubscriptions();
        closeModal();
    } else {
        const err = await response.json();
        alert('Erreur : ' + (err.error || 'inconnue'));
    }
}

window.deleteSubscription = async function(id) {
    if (!confirm(t('delete_confirm'))) return;
    const response = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    if (response.ok) loadSubscriptions();
    else alert('Erreur lors de la suppression');
};

function closeModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('importModal').classList.remove('active');
    document.body.style.overflow = '';
}


// PRESETS


function renderPresets() {
    const grid = document.getElementById('presetsGrid');
    grid.innerHTML = Object.entries(servicePresets).map(([key, preset]) => {
        const minPrice = servicePlans[key]?.[0]?.price || 0;
        return `
            <button class="preset-btn" data-preset="${key}" onclick="selectPreset('${key}')">
                <div class="preset-icon" style="background: linear-gradient(135deg, ${preset.color}, ${preset.color}cc);">
                    <img src="${preset.icon}" alt="${preset.name}">
                </div>
                <div class="preset-name">${preset.name}</div>
                <div class="preset-price">${formatPriceShort(minPrice)}+</div>
            </button>
        `;
    }).join('');
}

window.selectPreset = function(presetKey) {
    const preset = servicePresets[presetKey];
    if (!preset) return;
    selectedPreset = presetKey;
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-preset="${presetKey}"]`)?.classList.add('selected');
    document.getElementById('presetServiceName').value = preset.name;
    
    const plans = servicePlans[presetKey];
    const planGroup = document.getElementById('presetPlanGroup');
    const planSelector = document.getElementById('presetPlanSelector');
    
    if (plans && plans.length) {
        planGroup.style.display = 'block';
        planSelector.innerHTML = plans.map(plan => `
            <button type="button" class="plan-btn" data-price="${plan.price}">
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">${formatPrice(plan.price)}/mois</div>
            </button>
        `).join('');
        planSelector.querySelectorAll('.plan-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                planSelector.querySelectorAll('.plan-btn').forEach(b => b.classList.remove('selected'));
                this.classList.add('selected');
                document.getElementById('presetPrice').value = this.dataset.price;
            });
        });
        planSelector.querySelector('.plan-btn')?.click();
    } else {
        planGroup.style.display = 'none';
        document.getElementById('presetPrice').value = plans?.[0]?.price?.toFixed(2) || '9.99';
    }
    document.getElementById('selectedPresetInfo').style.display = 'block';
};


// INITIALISATION


document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderPresets();
    setupEventListeners();
    setupScrollListener();
    updateAllTranslations();
    
    document.getElementById('currencySelect').addEventListener('change', (e) => {
        currentCurrency = e.target.value;
        renderPresets();
        renderSubscriptions();
    });
    
    document.getElementById('langSelect').addEventListener('change', (e) => {
        currentLang = e.target.value;
        document.documentElement.lang = currentLang;
        updateAllTranslations();
        renderPresets();
        renderSubscriptions();
    });
});

function setupScrollListener() {
    const summaryBar = document.getElementById('summaryBar');
    if (!summaryBar) return;
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50 && currentScrollY > lastScrollY) summaryBar.classList.add('scrolled');
        else if (currentScrollY <= 50) summaryBar.classList.remove('scrolled');
        lastScrollY = currentScrollY;
    });
}

function setupEventListeners() {
    document.getElementById('loginBtn').addEventListener('click', () => document.getElementById('loginModal').classList.add('active'));
    document.getElementById('registerBtn').addEventListener('click', () => document.getElementById('registerModal').classList.add('active'));
    document.getElementById('loggedOutLoginBtn').addEventListener('click', () => document.getElementById('loginModal').classList.add('active'));
    document.getElementById('loggedOutRegisterBtn').addEventListener('click', () => document.getElementById('registerModal').classList.add('active'));
    document.getElementById('closeLoginModal').addEventListener('click', () => document.getElementById('loginModal').classList.remove('active'));
    document.getElementById('closeRegisterModal').addEventListener('click', () => document.getElementById('registerModal').classList.remove('active'));

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: document.getElementById('loginUsername').value, password: document.getElementById('loginPassword').value })
        });
        const data = await res.json();
        if (res.ok) { document.getElementById('loginModal').classList.remove('active'); checkAuth(); }
        else { errorDiv.textContent = data.error; errorDiv.style.display = 'block'; }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('registerError');
        errorDiv.style.display = 'none';
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: document.getElementById('registerUsername').value, password: document.getElementById('registerPassword').value })
        });
        const data = await res.json();
        if (res.ok) { document.getElementById('registerModal').classList.remove('active'); checkAuth(); }
        else { errorDiv.textContent = data.error; errorDiv.style.display = 'block'; }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        checkAuth();
    });

    document.getElementById('addBtn').addEventListener('click', () => document.getElementById('addModal').classList.add('active'));
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importModal').classList.add('active'));
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeImportModal').addEventListener('click', closeModal);
    document.querySelectorAll('.modal-overlay').forEach(overlay => overlay.addEventListener('click', closeModal));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
        });
    });

    document.getElementById('presetForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addSubscription(document.getElementById('presetServiceName').value.trim(), document.getElementById('presetPrice').value, document.getElementById('presetBillingCycle').value, selectedPreset, document.getElementById('presetShared').checked, document.getElementById('presetNextDate').value || null);
        selectedPreset = null;
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('selectedPresetInfo').style.display = 'none';
        document.getElementById('presetShared').checked = false;
        document.getElementById('presetNextDate').value = '';
    });

    document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('serviceInput').value.trim();
        let iconKey = selectedPreset;
        if (!iconKey && document.getElementById('iconUrl').value.trim()) iconKey = document.getElementById('iconUrl').value.trim();
        else if (!iconKey) {
            const match = Object.entries(servicePresets).find(([k, p]) => p.name.toLowerCase() === name.toLowerCase());
            if (match) iconKey = match[0];
        }
        addSubscription(name, document.getElementById('price').value, document.getElementById('billingCycle').value, iconKey, document.getElementById('sharedSubscription').checked, document.getElementById('nextDate').value || null);
    });

    const serviceInput = document.getElementById('serviceInput');
    const serviceDropdown = document.getElementById('serviceDropdown');
    const planSelectorGroup = document.getElementById('planSelectorGroup');
    const planSelector = document.getElementById('planSelector');
    
    serviceInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        planSelectorGroup.style.display = 'none';
        selectedPreset = null;
        if (query.length === 0) { serviceDropdown.style.display = 'none'; return; }
        
        const matches = Object.entries(servicePresets).filter(([key, preset]) => preset.name.toLowerCase().includes(query) || key.includes(query));
        if (matches.length > 0) {
            serviceDropdown.innerHTML = matches.map(([key, preset]) => `<div class="datalist-item" data-preset="${key}"><div class="preset-icon-small" style="background:${preset.color};"><img src="${preset.icon}" alt="${preset.name}"></div><span>${preset.name}</span></div>`).join('');
            serviceDropdown.style.display = 'block';
            serviceDropdown.querySelectorAll('.datalist-item').forEach(item => {
                item.addEventListener('click', function() {
                    const key = this.dataset.preset;
                    serviceInput.value = servicePresets[key].name;
                    selectedPreset = key;
                    const plans = servicePlans[key];
                    if (plans && plans.length) {
                        planSelectorGroup.style.display = 'block';
                        planSelector.innerHTML = plans.map(plan => `<button type="button" class="plan-btn" data-price="${plan.price}"><div class="plan-name">${plan.name}</div><div class="plan-price">${formatPrice(plan.price)}/mois</div></button>`).join('');
                        planSelector.querySelectorAll('.plan-btn').forEach(btn => {
                            btn.addEventListener('click', function() {
                                planSelector.querySelectorAll('.plan-btn').forEach(b => b.classList.remove('selected'));
                                this.classList.add('selected');
                                document.getElementById('price').value = this.dataset.price;
                            });
                        });
                        planSelector.querySelector('.plan-btn')?.click();
                    } else {
                        planSelectorGroup.style.display = 'none';
                        document.getElementById('price').value = '9.99';
                    }
                    serviceDropdown.style.display = 'none';
                });
            });
        } else {
            serviceDropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!serviceInput.contains(e.target) && !serviceDropdown.contains(e.target)) serviceDropdown.style.display = 'none';
    });

    document.getElementById('browseFileBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.classList.remove('dragover'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => { if (e.target.files[0]) handleFile(e.target.files[0]); });
}

// CSV Import
function parseCSV(csvText) {
    const results = [];
    csvText.trim().split('\n').forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const name = parts[0];
            const price = parseFloat(parts[1]);
            const cycle = parts[2]?.toLowerCase().includes('year') ? 'yearly' : 'monthly';
            if (name && !isNaN(price)) results.push({ name, price, cycle });
        }
    });
    return { results };
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const { results } = parseCSV(e.target.result);
        if (results.length > 0) {
            results.forEach(item => {
                const iconKey = Object.keys(servicePresets).find(k => servicePresets[k].name.toLowerCase() === item.name.toLowerCase());
                addSubscription(item.name, item.price, item.cycle, iconKey);
            });
            closeModal();
        } else {
            alert('Fichier CSV invalide');
        }
    };
    reader.readAsText(file);
}