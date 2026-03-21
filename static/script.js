const API_BASE = '';
let subscriptions = []; // Stockage local des abonnements de l'utilisateur
let selectedPreset = null; // Preset sélectionné actuellement

// configuration des services
// Plans pour chaque service (présélection) - Prix 2026
const servicePlans = {
    'spotify': [
        { name: 'Premium', price: 11.99 },
        { name: 'Duo', price: 15.99 },
        { name: 'Family', price: 18.99 },
        { name: 'Étudiant', price: 5.99 }
    ],
    'netflix': [
        { name: 'Standard', price: 15.99 },
        { name: 'Premium', price: 22.99 },
        { name: 'Essentiel', price: 8.99 }
    ],
    'disney': [
        { name: 'Standard', price: 9.99 },
        { name: 'Premium', price: 15.99 }
    ],
    'youtube': [
        { name: 'Premium', price: 13.99 },
        { name: 'Family', price: 22.99 }
    ],
    'chatgpt': [
        { name: 'Plus', price: 19.00 },
        { name: 'Pro', price: 200.00 }
    ],
    'microsoft': [
        { name: 'Family', price: 12.99 },
        { name: 'Personnel', price: 7.99 }
    ],
    'apple': [
        { name: 'Individual', price: 11.99 },
        { name: 'Family', price: 18.99 },
        { name: 'Student', price: 6.99 }
    ],
    'prime': [
        { name: 'Video', price: 9.99 },
        { name: 'Integral', price: 69.90 }
    ],
    'gym': [
        { name: 'Standard', price: 35.00 },
        { name: 'Premium', price: 60.00 },
        { name: 'Basic', price: 25.00 }
    ],
    'adobe': [
        { name: 'All Apps', price: 59.99 },
        { name: 'Single App', price: 27.99 },
        { name: 'Photography', price: 12.99 }
    ],
    'notion': [
        { name: 'Plus', price: 10.00 },
        { name: 'Business', price: 18.00 }
    ],
    'dropbox': [
        { name: 'Plus', price: 11.99 },
        { name: 'Family', price: 19.98 }
    ],
    'google': [
        { name: 'Basic', price: 2.99 },
        { name: 'Premium', price: 9.99 },
        { name: 'Family', price: 15.99 }
    ],
    'deezer': [
        { name: 'Premium', price: 11.99 },
        { name: 'Family', price: 17.99 }
    ],
    'xbox': [
        { name: 'Ultimate', price: 16.99 },
        { name: 'Core', price: 9.99 },
        { name: 'PC Game Pass', price: 11.99 }
    ],
    'playstation': [
        { name: 'Essential', price: 9.99 },
        { name: 'Extra', price: 17.99 },
        { name: 'Premium', price: 21.99 }
    ],
    'strava': [
        { name: 'Summit', price: 11.99 }
    ],
    'headspace': [
        { name: 'Annual', price: 69.99 },
        { name: 'Monthly', price: 6.99 }
    ],
    'canal': [
        { name: 'Essentiel', price: 24.90 },
        { name: 'Intégral', price: 39.90 }
    ],
    'nintendo': [
        { name: 'Individual', price: 3.99 },
        { name: 'Family', price: 6.99 }
    ]
};

// Présélections avec icônes et couleurs 
const servicePresets = {
    'spotify': {
        name: 'Spotify',
        icon: `https://happyneon.fr/cdn/shop/products/Spotify-Logo-Neon-Like-Sign-on.jpg?v=1747837856`,
        color: '#1DB954',
        class: 'spotify'
    },
    'netflix': {
        name: 'Netflix',
        icon: `https://img.icons8.com/liquid-glass-color/1200/netflix.jpg`,
        color: '#E50914',
        class: 'netflix'
    },
    'adobe': {
        name: 'Adobe Creative Cloud',
        icon: `https://image.similarpng.com/file/similarpng/very-thumbnail/2020/06/Adobe-logo-transparent-background-PNG.png`,
        color: '#FF0000',
        class: 'adobe'
    },
    'youtube': {
        name: 'YouTube Premium',
        icon: `https://images.seeklogo.com/logo-png/36/2/youtube-premium-logo-png_seeklogo-364940.png`,
        color: '#FF0000',
        class: 'youtube'
    },
    'disney': {
        name: 'Disney+',
        icon: `https://m.media-amazon.com/images/I/719t3jd2NeL.png`,
        color: '#113CCF',
        class: 'disney'
    },
    'chatgpt': {
        name: 'ChatGPT Plus',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9973-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4066-.6898zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997z"/></svg>`,
        color: '#10A37F',
        class: 'chatgpt'
    },
    'microsoft': {
        name: 'Microsoft 365',
        icon: `https://x5h8w2v3.delivery.rocketcdn.me/wp-content/uploads/2024/11/Logo-Microsoft-365-Business.png`,
        color: '#00A4EF',
        class: 'microsoft'
    },
    'apple': {
        name: 'Apple Music',
        icon: `https://www.apple.com/newsroom/images/product/apple-music/apple_music-update_hero_08242021.jpg.news_app_ed.jpg`,
        color: '#FA243C',
        class: 'apple-music'
    },
    'prime': {
        name: 'Prime Video',
        icon: `https://img.icons8.com/fluent/1200/amazon-prime-video.jpg`,
        color: '#00A8E1',
        class: 'amazon'
    },
    'gym': {
        name: 'Salle de sport',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/></svg>`,
        color: '#8b5cf6',
        class: 'gym'
    },
    'notion': {
        name: 'Notion',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.747 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.186c-.094-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.454-.233 4.763 7.279v-6.44l-1.215-.14c-.093-.514.28-.886.747-.933zM2.1 1.155l13.123-.98c1.634-.14 2.055-.047 3.082.7l4.25 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.921c0-.839.374-1.54 1.634-1.766z"/></svg>`,
        color: '#000000',
        class: 'notion'
    },
    'dropbox': {
        name: 'Dropbox',
        icon: `https://www.logo.wine/a/logo/Dropbox_(service)/Dropbox_(service)-Icon-Logo.wine.svg`,
        color: '#0061FF',
        class: 'dropbox'
    },
    'google': {
        name: 'Google One',
        icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
        color: '#4285F4',
        class: 'google'
    },
    'deezer': {
        name: 'Deezer',
        icon: `https://play-lh.googleusercontent.com/F9uslCD68SA59MsRuLJ4vT0o1a6WccmFufSRtfCaIg12K45jySvUqOViLWNSURq-NXyE=w1024`,
        color: '#fe2da0',
        class: 'deezer'
    },
    'xbox': {
        name: 'Xbox Game Pass',
        icon: `https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Xbox_one_logo.svg/1280px-Xbox_one_logo.svg.png`,
        color: '#10ff10',
        class: 'xbox'
    },
    'playstation': {
        name: 'PlayStation+',
        icon: `https://logo-marque.com/wp-content/uploads/2020/11/PlayStation-Embleme.png`,
        color: '#003087',
        class: 'playstation'
    },
    'strava': {
        name: 'Strava',
        icon: `https://images.icon-icons.com/2108/PNG/512/strava_icon_130820.png`,
        color: '#FC4C02',
        class: 'strava'
    },
    'headspace': {
        name: 'Headspace',
        icon: `https://healthcenter.uga.edu/wp-content/uploads/sites/19/2022/09/headspace-1.jpg`,
        color: '#F47D30',
        class: 'headspace'
    },
    'canal': {
        name: 'Canal+',
        icon: `https://www.creads.com/wp-content/uploads/2021/05/google_avatar_canalplus.jpg`,
        color: '#000000',
        class: 'canal'
    },
    'nintendo': {
        name: 'Nintendo Online',
        icon: `https://sm.ign.com/ign_fr/cover/n/nintendo-s/nintendo-switch-online_nbsp.jpg`,
        color: '#e60012',
        class: 'nintendo'
    }
};

// --- Fonctions Utilitaires ---

function getMonthlyPrice(price, cycle) {
    // Calcule le prix mensuel en divisant le prix annuel par 12 si nécessaire
    return cycle === 'yearly' ? price / 12 : price;
}

function getYearlyPrice(price, cycle) {
    // Calcule le prix annuel en multipliant le prix mensuel par 12 si nécessaire
    return cycle === 'yearly' ? price : price * 12;
}

function calculateTotals() {
    // Calcule les totaux mensuels et annuels en tenant compte du partage
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

function updateSummary() {
    // Met à jour l'affichage des totaux dans la barre de résumé
    const { monthlyTotal, yearlyTotal } = calculateTotals();
    document.getElementById('monthlyTotal').textContent = monthlyTotal.toFixed(2) + ' €';
    document.getElementById('yearlyTotal').textContent = yearlyTotal.toFixed(2) + ' €';
}

function updateOpportunityCost() {
    const { monthlyTotal } = calculateTotals();
    const grid = document.getElementById('opportunityGrid');
    
    if (subscriptions.length === 0) {
        grid.innerHTML = '';
        return;
    }

    const yearlyAmount = monthlyTotal * 12;
    const hoursWorked = Math.round(monthlyTotal / 15 * 160);
    const flights = Math.floor(yearlyAmount / 480);
    const sp500Value = yearlyAmount * 10 * 1.10;
    const livretA = yearlyAmount * 1.017;
    const bitcoin = (yearlyAmount / 42000).toFixed(4);
    const gold = (yearlyAmount / 75).toFixed(1);

    const opportunities = [
        {
            type: 'time',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
            label: 'Heures de travail',
            value: hoursWorked,
            suffix: 'h',
            description: 'par an (SMIC)'
        },
        {
            type: 'travel',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>`,
            label: 'Vols Paris-New York',
            value: flights,
            suffix: '',
            description: 'billets aller-retour'
        },
        {
            type: 'sp500',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`,
            label: 'S&P 500',
            value: sp500Value.toFixed(0),
            suffix: '€',
            description: 'dans 10 ans (10%)'
        },
        {
            type: 'savings',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
            label: 'Livret A',
            value: livretA.toFixed(0),
            suffix: '€',
            description: 'dans 1 an (1.7%)'
        },
        {
            type: 'crypto',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M9.5 8h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5"/><path d="M12 6v2M12 16v2"/></svg>`,
            label: 'Bitcoin',
            value: bitcoin,
            suffix: 'BTC',
            description: 'avec 42k€/BTC'
        }
    ];

    grid.innerHTML = opportunities.map(opp => `
        <div class="opportunity-card ${opp.type}">
            <div class="opportunity-icon">
                ${opp.icon}
            </div>
            <div class="opportunity-content">
                <div class="opportunity-label">${opp.label}</div>
                <div class="opportunity-value">${opp.value}${opp.suffix ? ' ' + opp.suffix : ''}</div>
                <div class="opportunity-description">${opp.description}</div>
            </div>
        </div>
    `).join('');
}

// --- Fonctions d'Affichage (Rendering) ---

function renderSubscriptions() {
    // Affiche la liste des abonnements dans la grille principale
    const grid = document.getElementById('subscriptionGrid');
    const { monthlyTotal } = calculateTotals();
    
    if (subscriptions.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
                <h3>Aucun abonnement</h3>
                <p>Cliquez sur "Ajouter" pour commencer</p>
            </div>
        `;
        updateSummary();
        updateOpportunityCost();
        return;
    }

    const sortedSubs = [...subscriptions].sort((a, b) => getMonthlyPrice(b.price, b.cycle) - getMonthlyPrice(a.price, a.cycle));
    
    grid.innerHTML = sortedSubs.map((sub, index) => {
        // Déterminer si l'icône est une URL ou une clé de preset
        let iconHtml;
        let baseColor = '#8b5cf6'; // Couleur par défaut (violet)
        let isCustomUrl = false;
        
        // Vérifie si sub.icon est une URL (commence par http)
        if (sub.icon && sub.icon.startsWith('http')) {
            // Icône personnalisée (URL)
            iconHtml = `<img src="${sub.icon}" alt="${sub.name}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
            baseColor = '#6b7280'; // Gris pour personnalisé
            isCustomUrl = true;
        } else {
            // C'est une clé de preset
            const preset = servicePresets[sub.icon];
            if (preset) {
                baseColor = preset.color;
                if (preset.icon.startsWith('http')) {
                    // Preset avec image URL (Netflix, Spotify, etc.)
                    iconHtml = `<img src="${preset.icon}" alt="${sub.name}" style="width:100%; height:100%; object-fit:contain; border-radius:8px;">`;
                } else {
                    // Preset avec SVG intégré (ChatGPT, etc.)
                    iconHtml = preset.icon;
                }
            } else {
                // Fallback: icône par défaut
                iconHtml = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>`;
            }
        }

        // Gérer le partage
        const isShared = sub.shared === 1;
        let monthlyPrice = getMonthlyPrice(sub.price, sub.cycle);
        let displayPrice = monthlyPrice;
        let yearlyPrice = getYearlyPrice(sub.price, sub.cycle);
        
        if (isShared) {
            displayPrice = monthlyPrice / 2;
            yearlyPrice = yearlyPrice / 2;
        }
        
        const percentage = monthlyTotal > 0 ? ((monthlyPrice / monthlyTotal) * 100).toFixed(0) : 0;
        const isLarge = index < 2 && monthlyTotal > 100;

        // Format date
        let nextPaymentHtml = '';
        if (sub.next_billing_date) {
            const nextDate = new Date(sub.next_billing_date);
            const today = new Date();
            const diffTime = nextDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let dateStr = nextDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            let daysText = diffDays > 0 ? `dans ${diffDays}j` : 'aujourd\'hui';
            if (diffDays < 0) daysText = 'en retard';
            
            nextPaymentHtml = `
                <div class="card-next-payment">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${dateStr} (${daysText})</span>
                </div>
            `;
        }

        return `
            <div class="subscription-card ${isLarge ? 'large' : ''}" data-id="${sub.id}" style="--card-accent: ${baseColor}; background: linear-gradient(145deg, ${baseColor}40, #1a1a24);">
                <button class="card-delete" onclick="deleteSubscription(${sub.id}); event.stopPropagation();">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="card-header">
                    <div class="card-icon" style="background: ${isCustomUrl ? 'rgba(255,255,255,0.9)' : `linear-gradient(135deg, ${baseColor}, #333)`};">
                        ${iconHtml}
                    </div>
                    <div class="card-badges">
                        ${isShared ? '<div class="card-badge shared-badge">Partagé</div>' : ''}
                        <div class="card-badge">${percentage}%</div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="card-name">${sub.name}</div>
                    <div class="card-price">${displayPrice.toFixed(2)}<span>€/mois</span>${isShared ? '<span class="shared-note">(50%)</span>' : ''}</div>
                </div>
                <div class="card-footer">
                    ${sub.cycle === 'yearly' ? `≈ ${yearlyPrice.toFixed(2)}€/an` : `${yearlyPrice.toFixed(2)}€/an`}
                    ${nextPaymentHtml}
                </div>
            </div>
        `;
    }).join('');

    updateSummary();
    updateOpportunityCost();
}

// Fonctions API

async function checkAuth() {
    // Vérifie le statut d'authentification de l'utilisateur
    const response = await fetch('/api/me');
    const data = await response.json();
    const loggedOutContainer = document.getElementById('loggedOutContainer');
    const mainContainer = document.getElementById('mainContainer');
    const appBg = document.querySelector('.app-bg');
    
    if (data.authenticated) {
        // Mode connecté - afficher l'app
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
        // Mode déconnecté - afficher la landing
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
    // Récupère les abonnements depuis le serveur
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
    // Ajoute un nouvel abonnement via l'API
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        alert('Veuillez entrer un prix valide');
        return;
    }
    const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            name, 
            price: parsedPrice, 
            cycle, 
            icon: iconKey,
            shared: shared ? 1 : 0,
            next_billing_date: nextBillingDate
        })
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
    // Supprime un abonnement via l'API
    if (!confirm('Supprimer cet abonnement ?')) return;
    const response = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
    if (response.ok) {
        loadSubscriptions();
    } else {
        alert('Erreur lors de la suppression');
    }
};

function closeModal() {
    document.getElementById('addModal').classList.remove('active');
    document.getElementById('importModal').classList.remove('active');
    document.body.style.overflow = '';
}

function renderPresets() {
    const grid = document.getElementById('presetsGrid');
    grid.innerHTML = Object.entries(servicePresets).map(([key, preset]) => {
        let iconHtml;
        if (preset.icon.startsWith('http')) {
            iconHtml = `<img src="${preset.icon}" alt="${preset.name}" style="width:100%; height:100%; object-fit:contain;">`;
        } else {
            iconHtml = preset.icon;
        }
        return `
            <button class="preset-btn" data-preset="${key}" onclick="selectPreset('${key}')">
                <div class="preset-icon" style="background: linear-gradient(135deg, ${preset.color}, ${preset.color}dd);">
                    ${iconHtml}
                </div>
                <div class="preset-name">${preset.name}</div>
            </button>
        `;
    }).join('');
}

window.selectPreset = function(presetKey) {
    const preset = servicePresets[presetKey];
    if (!preset) return;
    selectedPreset = presetKey;
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-preset="${presetKey}"]`).classList.add('selected');
    document.getElementById('presetServiceName').value = preset.name;
    const plans = servicePlans[presetKey];
    const planGroup = document.getElementById('presetPlanGroup');
    const planSelector = document.getElementById('presetPlanSelector');
    if (plans && plans.length) {
        planGroup.style.display = 'block';
        planSelector.innerHTML = plans.map(plan => `
            <button type="button" class="plan-btn" data-plan="${plan.name}" data-price="${plan.price}">
                <div class="plan-name">${plan.name}</div>
                <div class="plan-price">${plan.price.toFixed(2)}€/mois</div>
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
        const defaultPrices = { 'gym': '30.00', 'chatgpt': '20.00' };
        document.getElementById('presetPrice').value = defaultPrices[presetKey] || '10.99';
    }
    document.getElementById('selectedPresetInfo').style.display = 'block';
};

// Initialisation

document.addEventListener('DOMContentLoaded', () => {
    // Point d'entrée du script : vérifie l'authentification et charge les données
    checkAuth();
    renderPresets();
    setupEventListeners();
    setupScrollListener();
});

function setupScrollListener() {
    const summaryBar = document.getElementById('summaryBar');
    if (!summaryBar) return;
    
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 50 && currentScrollY > lastScrollY) {
            summaryBar.classList.add('scrolled');
        } else if (currentScrollY <= 50) {
            summaryBar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    });
}

function setupEventListeners() {
    // Configure toutes les actions d'événements (boutons, formulaires, etc.)
    // Modals auth - en-tête
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('active');
    });
    document.getElementById('registerBtn').addEventListener('click', () => {
        document.getElementById('registerModal').classList.add('active');
    });
    
    // Modals auth - Landing page
    document.getElementById('loggedOutLoginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').classList.add('active');
    });
    document.getElementById('loggedOutRegisterBtn').addEventListener('click', () => {
        document.getElementById('registerModal').classList.add('active');
    });
    
    document.getElementById('closeLoginModal').addEventListener('click', () => {
        document.getElementById('loginModal').classList.remove('active');
    });
    document.getElementById('closeRegisterModal').addEventListener('click', () => {
        document.getElementById('registerModal').classList.remove('active');
    });

    // Forms auth
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        errorDiv.style.display = 'none';
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('loginModal').classList.remove('active');
            checkAuth();
        } else {
            errorDiv.textContent = data.error;
            errorDiv.style.display = 'block';
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('registerError');
        errorDiv.style.display = 'none';
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
            document.getElementById('registerModal').classList.remove('active');
            checkAuth();
        } else {
            errorDiv.textContent = data.error;
            errorDiv.style.display = 'block';
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        checkAuth();
    });

    // Modals d'abonnement (la page qui s'ouvre en gros)
    document.getElementById('addBtn').addEventListener('click', () => {
        document.getElementById('addModal').classList.add('active');
    });
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importModal').classList.add('active');
    });
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeImportModal').addEventListener('click', closeModal);
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', closeModal);
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + 'Tab').classList.add('active');
        });
    });

    // Formulaire preset
    document.getElementById('presetForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('presetServiceName').value.trim();
        const price = document.getElementById('presetPrice').value;
        const cycle = document.getElementById('presetBillingCycle').value;
        const shared = document.getElementById('presetShared').checked;
        const nextDate = document.getElementById('presetNextDate').value;
        
        addSubscription(name, price, cycle, selectedPreset, shared, nextDate || null);
        
        // Reset form
        selectedPreset = null;
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('selectedPresetInfo').style.display = 'none';
        document.getElementById('presetShared').checked = false;
        document.getElementById('presetNextDate').value = '';
    });

    document.getElementById('subscriptionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('serviceInput').value.trim();
        const price = document.getElementById('price').value;
        const cycle = document.getElementById('billingCycle').value;
        const iconUrl = document.getElementById('iconUrl').value.trim();
        const shared = document.getElementById('sharedSubscription').checked;
        const nextDate = document.getElementById('nextDate').value;
        
        let iconKey = selectedPreset;
        
        // Si pas de preset mais une URL personnalisée, stocke l'URL comme iconKey
        if (!iconKey && iconUrl) {
            iconKey = iconUrl; // On stocke l'URL directement
        } else if (!iconKey) {
            // essayer de trouver un preset correspondant
            const match = Object.entries(servicePresets).find(([k, p]) => 
                p.name.toLowerCase() === name.toLowerCase()
            );
            if (match) iconKey = match[0];
        }
        
        addSubscription(name, price, cycle, iconKey, shared, nextDate || null);
    });

    // Smart input
    const serviceInput = document.getElementById('serviceInput');
    const serviceDropdown = document.getElementById('serviceDropdown');
    const planSelectorGroup = document.getElementById('planSelectorGroup');
    const planSelector = document.getElementById('planSelector');
    serviceInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        planSelectorGroup.style.display = 'none';
        selectedPreset = null;
        if (query.length === 0) {
            serviceDropdown.style.display = 'none';
            return;
        }
        const matches = Object.entries(servicePresets).filter(([key, preset]) => 
            preset.name.toLowerCase().includes(query) || key.includes(query)
        );
        if (matches.length > 0) {
            serviceDropdown.innerHTML = matches.map(([key, preset]) => `
                <div class="datalist-item" data-preset="${key}" style="display:flex; align-items:center; gap:10px; padding:10px; cursor:pointer;">
                    <div class="preset-icon" style="background:${preset.color}; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center;">${preset.icon}</div>
                    <span>${preset.name}</span>
                </div>
            `).join('');
            serviceDropdown.style.display = 'block';
            serviceDropdown.querySelectorAll('.datalist-item').forEach(item => {
                item.addEventListener('click', function() {
                    const key = this.dataset.preset;
                    const preset = servicePresets[key];
                    serviceInput.value = preset.name;
                    selectedPreset = key;
                    const plans = servicePlans[key];
                    if (plans && plans.length) {
                        planSelectorGroup.style.display = 'block';
                        planSelector.innerHTML = plans.map(plan => `
                            <button type="button" class="plan-btn" data-price="${plan.price}">
                                <div class="plan-name">${plan.name}</div>
                                <div class="plan-price">${plan.price.toFixed(2)}€/mois</div>
                            </button>
                        `).join('');
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
                        const defaultPrices = { 'gym': '30.00', 'chatgpt': '20.00' };
                        document.getElementById('price').value = defaultPrices[key] || '10.99';
                    }
                    serviceDropdown.style.display = 'none';
                });
            });
        } else {
            serviceDropdown.style.display = 'none';
        }
    });
    document.addEventListener('click', (e) => {
        if (!serviceInput.contains(e.target) && !serviceDropdown.contains(e.target)) {
            serviceDropdown.style.display = 'none';
        }
    });

    // Import CSV
    document.getElementById('browseFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });
}

// Gestion des imports CSV

function parseCSV(csvText) {
    // Analyse le contenu d'un fichier CSV pour extraire les abonnements
    const lines = csvText.trim().split('\n');
    const results = [];
    lines.forEach(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
            const name = parts[0];
            const price = parseFloat(parts[1]);
            const cycle = parts[2]?.toLowerCase().includes('year') ? 'yearly' : 'monthly';
            if (name && !isNaN(price)) results.push({ name, price, cycle });
        }
    });
    return { results, errors: [] };
}

function handleFile(file) {
    // Gère le chargement et le traitement d'un fichier CSV
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