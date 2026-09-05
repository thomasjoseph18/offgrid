// ============================================================
//  JAL RAKSHAK — Complete Application with Centralized Database
// ============================================================

// ────────────────────────────────────────────────────────────
//  1. DATABASE LAYER (LocalStorage-backed)
// ────────────────────────────────────────────────────────────
const JalDB = {
    _storageKey: 'jalRakshak_db',

    // Default schema
    _defaults: {
        lang: 'en',
        calculator: {
            shower: 5,
            toilet: 4,
            laundry: 3,
            dishes: 15,
            drinking: 5,
            car: 2,
            garden: 20
        },
        rainwater: {
            city: '2400',
            rainfall: 2400,
            area: 100,
            coeff: 0.8
        },
        challenges: {
            completed: [],       // array of challenge IDs
            acceptedDate: {}     // { c1: '2026-09-05', ... }
        },
        stats: {
            dailyUsageLiters: 0,
            monthlyUsageLiters: 0,
            yearlyUsageLiters: 0,
            monthlySavedLiters: 0,
            totalChallengesSaved: 0,
            greenScore: 0,
            rainwaterAnnualHarvest: 0,
            rainwaterMoneySaved: 0,
            totalSessions: 0,
            firstVisit: null,
            lastVisit: null
        }
    },

    // Load entire DB from LocalStorage (or initialize with defaults)
    load() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                // Merge with defaults so new fields are always present
                return this._deepMerge(this._deepCopy(this._defaults), parsed);
            }
        } catch (e) {
            console.warn('JalDB: Could not parse stored data, resetting.', e);
        }
        return this._deepCopy(this._defaults);
    },

    // Save entire DB to LocalStorage
    save(data) {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(data));
        } catch (e) {
            console.warn('JalDB: Could not save data.', e);
        }
    },

    // Get a nested value by dot-path, e.g. 'stats.dailyUsageLiters'
    get(path) {
        const data = this.load();
        return path.split('.').reduce((obj, key) => obj?.[key], data);
    },

    // Set a nested value by dot-path and persist
    set(path, value) {
        const data = this.load();
        const keys = path.split('.');
        let obj = data;
        for (let i = 0; i < keys.length - 1; i++) {
            if (obj[keys[i]] === undefined) obj[keys[i]] = {};
            obj = obj[keys[i]];
        }
        obj[keys[keys.length - 1]] = value;
        this.save(data);
        return data;
    },

    // Update multiple paths at once
    update(updates) {
        const data = this.load();
        for (const [path, value] of Object.entries(updates)) {
            const keys = path.split('.');
            let obj = data;
            for (let i = 0; i < keys.length - 1; i++) {
                if (obj[keys[i]] === undefined) obj[keys[i]] = {};
                obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = value;
        }
        this.save(data);
        return data;
    },

    // Reset everything
    reset() {
        localStorage.removeItem(this._storageKey);
    },

    // Helpers
    _deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); },
    _deepMerge(target, source) {
        for (const key of Object.keys(source)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this._deepMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }
};


// ────────────────────────────────────────────────────────────
//  2. TRANSLATIONS
// ────────────────────────────────────────────────────────────
const translations = {
    en: {
        logoEn: "Jal Rakshak", logoHi: "जल रक्षक",
        navDashboard: "Dashboard", navCalculator: "Calculator", navRainwater: "Rainwater",
        navMap: "Water Map", navChallenges: "Challenges",
        heroHeadline: "Every Drop Counts",
        heroSubtitle: "600M Indians face extreme water stress. Be the change today.",
        heroCta: "Start Saving Water",
        dashTitle: "My Impact Dashboard",
        dashDaily: "Your Daily Usage (L)",
        dashMonthly: "Monthly Saved (L)",
        dashChallenges: "Challenges Done",
        dashScore: "Green Score",
        calcTitle: "Water Footprint Calculator",
        calcShower: "Shower (mins/day)", calcToilet: "Toilet (flushes/day)",
        calcLaundry: "Laundry (loads/week)", calcDishes: "Dishes (mins/day)",
        calcDrinking: "Drinking/Cooking (L/day)", calcCar: "Car Wash (times/month)",
        calcGarden: "Garden (mins/week)",
        calcTotalDaily: "Total Daily Usage",
        calcEqPrefix: "That's equivalent to", calcEqBuckets: "buckets a day or",
        calcEqPools: "swimming pools per year!",
        calcAvgLine: "Indian Average: 135 L/day",
        tipGood: "💧 Excellent! You use less than the Indian average (135L). You're a true Jal Rakshak!",
        tipWarn: "⚠️ Your usage is near the Indian average. Try shorter showers and fixing leaks to improve.",
        tipBad: "🚨 Your usage is above average! Check for leaks, use buckets instead of hoses, and take shorter showers.",
        rainTitle: "Rainwater Harvest & ROI Calculator",
        rainCity: "Select City (Avg Rainfall)", rainCustom: "Custom",
        rainRainfall: "Annual Rainfall (mm)", rainArea: "Roof Area (sq. meters)",
        rainCoeff: "Runoff Coefficient", rainShare: "📋 Copy Results",
        rainAnnual: "Annual Harvest", rainSaved: "Money Saved/Yr",
        rainCo2: "CO₂ Offset", rainDays: "Days of Supply",
        rainRoiChart: "5-Year ROI Timeline (Cumulative Savings vs Cost)",
        mapTitle: "India Water Stress Map",
        filterAll: "All States", filterCritical: "Critical", filterHigh: "High",
        filterMedium: "Medium", filterLow: "Low",
        chalTitle: "Water Saving Challenges", chalProgress: "Your Progress:",
        chalAccept: "Accept Challenge", chalDone: "Completed ✓",
        footerAbout: "Empowering Indians to conserve our most precious resource through awareness, tracking, and action.",
        footerQuick: "Quick Links", footerRights: "All rights reserved.",
        statusExcellent: "Excellent", statusAverage: "Average", statusHigh: "High",
        copied: "Results copied to clipboard!"
    },
    hi: {
        logoEn: "Jal Rakshak", logoHi: "जल रक्षक",
        navDashboard: "डैशबोर्ड", navCalculator: "कैलकुलेटर", navRainwater: "वर्षा जल",
        navMap: "जल मानचित्र", navChallenges: "चुनौतियां",
        heroHeadline: "हर बूंद कीमती है",
        heroSubtitle: "60 करोड़ भारतीय जल संकट का सामना कर रहे हैं। आज ही बदलाव बनें।",
        heroCta: "पानी बचाना शुरू करें",
        dashTitle: "मेरा प्रभाव डैशबोर्ड",
        dashDaily: "आपका दैनिक उपयोग (L)",
        dashMonthly: "मासिक बचत (L)",
        dashChallenges: "पूरी चुनौतियां",
        dashScore: "ग्रीन स्कोर",
        calcTitle: "वाटर फुटप्रिंट कैलकुलेटर",
        calcShower: "शावर (मिनट/दिन)", calcToilet: "शौचालय (फ्लश/दिन)",
        calcLaundry: "कपड़े धोना (बार/सप्ताह)", calcDishes: "बर्तन (मिनट/दिन)",
        calcDrinking: "पीना/खाना पकाना (L/दिन)", calcCar: "कार धुलाई (बार/महीना)",
        calcGarden: "बगीचा (मिनट/सप्ताह)",
        calcTotalDaily: "कुल दैनिक उपयोग",
        calcEqPrefix: "यह बराबर है", calcEqBuckets: "बाल्टी प्रतिदिन या",
        calcEqPools: "स्विमिंग पूल प्रति वर्ष!",
        calcAvgLine: "भारतीय औसत: 135 L/दिन",
        tipGood: "💧 बहुत बढ़िया! आप भारतीय औसत (135L) से कम उपयोग करते हैं। आप सच्चे जल रक्षक हैं!",
        tipWarn: "⚠️ आपका उपयोग भारतीय औसत के करीब है। छोटे शावर लें और रिसाव ठीक करें।",
        tipBad: "🚨 आपका उपयोग औसत से ऊपर है! रिसाव जांचें, नली के बजाय बाल्टी इस्तेमाल करें।",
        rainTitle: "वर्षा जल संचयन और ROI कैलकुलेटर",
        rainCity: "शहर चुनें (औसत वर्षा)", rainCustom: "कस्टम",
        rainRainfall: "वार्षिक वर्षा (मिमी)", rainArea: "छत का क्षेत्रफल (वर्ग मीटर)",
        rainCoeff: "अपवाह गुणांक", rainShare: "📋 परिणाम कॉपी करें",
        rainAnnual: "वार्षिक संचयन", rainSaved: "बचत/वर्ष",
        rainCo2: "CO₂ ऑफसेट", rainDays: "आपूर्ति के दिन",
        rainRoiChart: "5-वर्षीय ROI टाइमलाइन (बचत बनाम लागत)",
        mapTitle: "भारत जल संकट मानचित्र",
        filterAll: "सभी राज्य", filterCritical: "अति गंभीर", filterHigh: "उच्च",
        filterMedium: "मध्यम", filterLow: "कम",
        chalTitle: "जल संरक्षण चुनौतियां", chalProgress: "आपकी प्रगति:",
        chalAccept: "चुनौती स्वीकार करें", chalDone: "पूरा हुआ ✓",
        footerAbout: "जागरूकता और कार्रवाई से हमारे सबसे कीमती संसाधन की रक्षा।",
        footerQuick: "त्वरित लिंक", footerRights: "सर्वाधिकार सुरक्षित।",
        statusExcellent: "उत्कृष्ट", statusAverage: "औसत", statusHigh: "उच्च",
        copied: "परिणाम क्लिपबोर्ड पर कॉपी हुए!"
    }
};

let currentLang = JalDB.get('lang') || 'en';

function t(key) {
    return translations[currentLang]?.[key] || translations.en[key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
    const langBtn = document.getElementById('lang-toggle');
    langBtn.querySelector('.lang-en').classList.toggle('active', currentLang === 'en');
    langBtn.querySelector('.lang-hi').classList.toggle('active', currentLang === 'hi');
}


// ────────────────────────────────────────────────────────────
//  3. UTILITY FUNCTIONS
// ────────────────────────────────────────────────────────────
function formatIndian(n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    n = Math.round(n);
    const s = n.toString();
    if (s.length <= 3) return s;
    let result = s.slice(-3);
    let remaining = s.slice(0, -3);
    while (remaining.length > 2) {
        result = remaining.slice(-2) + ',' + result;
        remaining = remaining.slice(0, -2);
    }
    if (remaining.length > 0) result = remaining + ',' + result;
    return result;
}

function animateValue(el, start, end, duration) {
    if (start === end) { el.innerText = formatIndian(end); return; }
    let startTime = null;
    const step = (ts) => {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = Math.floor(eased * (end - start) + start);
        el.innerText = formatIndian(current);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}


// ────────────────────────────────────────────────────────────
//  4. CALCULATOR ENGINE
// ────────────────────────────────────────────────────────────
const WATER_RATES = {
    shower:   10,       // 10L per minute
    toilet:   6,        // 6L per flush
    laundry:  60 / 7,   // 60L per load, convert weekly → daily
    dishes:   10,       // 10L per minute
    drinking: 1,        // direct liters
    car:      150 / 30, // 150L per wash, convert monthly → daily
    garden:   12 / 7    // 12L per minute, convert weekly → daily
};

const SLIDER_IDS = ['shower', 'toilet', 'laundry', 'dishes', 'drinking', 'car', 'garden'];
const INDIA_AVG_DAILY = 135; // liters per person per day

let footprintChart = null;

function calculateWaterUsage() {
    const db = JalDB.load();
    const breakdown = {};
    let totalDaily = 0;

    SLIDER_IDS.forEach(id => {
        const val = parseFloat(document.getElementById(`range-${id}`).value);
        db.calculator[id] = val;
        document.getElementById(`val-${id}`).innerText = val;
        const dailyL = val * WATER_RATES[id];
        breakdown[id] = Math.round(dailyL * 10) / 10;
        totalDaily += dailyL;
    });

    totalDaily = Math.round(totalDaily);
    const monthlyUsage = totalDaily * 30;
    const yearlyUsage = totalDaily * 365;

    // How much the user saves compared to the Indian average
    const savedVsAvg = Math.max(0, INDIA_AVG_DAILY - totalDaily);
    const monthlySaved = savedVsAvg * 30;

    // Water saved from completed challenges (daily estimate)
    const challengeSavedDaily = computeChallengeSavedDaily(db.challenges.completed);
    const totalMonthlySaved = Math.round(monthlySaved + (challengeSavedDaily * 30));

    // Green Score: 0-100
    // Based on: usage vs average (50%), challenges (30%), rainwater setup (20%)
    const usageScore = Math.min(50, Math.round((1 - (totalDaily / (INDIA_AVG_DAILY * 2))) * 50));
    const chalScore = Math.round((db.challenges.completed.length / 8) * 30);
    const rainScore = db.stats.rainwaterAnnualHarvest > 0 ? 20 : 0;
    const greenScore = Math.max(0, Math.min(100, usageScore + chalScore + rainScore));

    // Persist to DB
    db.stats.dailyUsageLiters = totalDaily;
    db.stats.monthlyUsageLiters = monthlyUsage;
    db.stats.yearlyUsageLiters = yearlyUsage;
    db.stats.monthlySavedLiters = totalMonthlySaved;
    db.stats.totalChallengesSaved = Math.round(challengeSavedDaily * 30);
    db.stats.greenScore = greenScore;
    JalDB.save(db);

    // Update UI
    document.getElementById('total-liters').innerText = formatIndian(totalDaily);

    const statusEl = document.getElementById('usage-status');
    const tipEl = document.getElementById('personalized-tip');
    if (totalDaily < 100) {
        statusEl.className = 'status-badge status-good';
        statusEl.innerText = t('statusExcellent');
        tipEl.innerHTML = t('tipGood');
    } else if (totalDaily < 200) {
        statusEl.className = 'status-badge status-warn';
        statusEl.innerText = t('statusAverage');
        tipEl.innerHTML = t('tipWarn');
    } else {
        statusEl.className = 'status-badge status-bad';
        statusEl.innerText = t('statusHigh');
        tipEl.innerHTML = t('tipBad');
    }

    document.getElementById('eq-buckets').innerText = Math.round(totalDaily / 15);
    document.getElementById('eq-pools').innerText = (yearlyUsage / 50000).toFixed(1);

    renderFootprintChart(breakdown);
    refreshDashboard(db);
}

function computeChallengeSavedDaily(completed) {
    const CHAL_SAVE_MAP = {
        c1: 20, c2: 40, c3: 15, c4: 100,
        c5: 50, c6: 100, c7: 30, c8: 200
    };
    let total = 0;
    completed.forEach(id => { total += (CHAL_SAVE_MAP[id] || 0); });
    return total; // liters per day
}

function renderFootprintChart(breakdown) {
    const ctx = document.getElementById('footprintChart').getContext('2d');
    const labels = currentLang === 'en'
        ? ['Shower', 'Toilet', 'Laundry', 'Dishes', 'Drinking', 'Car Wash', 'Garden']
        : ['शावर', 'शौचालय', 'कपड़े', 'बर्तन', 'पीना', 'कार धुलाई', 'बगीचा'];
    const data = SLIDER_IDS.map(id => breakdown[id] || 0);

    if (footprintChart) footprintChart.destroy();

    footprintChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: [
                    '#00d4ff', '#00b4d8', '#48cae4', '#90e0ef',
                    '#caf0f8', '#0077b6', '#023e8a'
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#fff', padding: 12, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}L/day`
                    }
                }
            }
        }
    });
}


// ────────────────────────────────────────────────────────────
//  5. RAINWATER CALCULATOR
// ────────────────────────────────────────────────────────────
let roiChart = null;

function calculateRainwater() {
    const rainfall = parseFloat(document.getElementById('rain-amount').value) || 0;
    const area = parseFloat(document.getElementById('rain-area').value) || 0;
    const coeff = parseFloat(document.getElementById('range-coeff').value) || 0.8;

    document.getElementById('val-coeff').innerText = coeff.toFixed(2);

    const annualHarvest = area * rainfall * coeff;
    const moneySaved = annualHarvest * 0.05;
    const co2Offset = (annualHarvest / 1000) * 0.376;
    const daysSupply = annualHarvest / (135 * 4); // family of 4

    // Persist
    JalDB.update({
        'rainwater.rainfall': rainfall,
        'rainwater.area': area,
        'rainwater.coeff': coeff,
        'stats.rainwaterAnnualHarvest': Math.round(annualHarvest),
        'stats.rainwaterMoneySaved': Math.round(moneySaved)
    });

    document.getElementById('res-harvest').innerText = formatIndian(annualHarvest);
    document.getElementById('res-money').innerText = formatIndian(moneySaved);
    document.getElementById('res-co2').innerText = formatIndian(co2Offset);
    document.getElementById('res-days').innerText = formatIndian(daysSupply);

    renderRoiChart(moneySaved);

    // Recalculate green score since rainwater status changed
    calculateWaterUsage();
}

function renderRoiChart(annualSavings) {
    const ctx = document.getElementById('roiChart').getContext('2d');
    const cost = 15000;
    const years = [1, 2, 3, 4, 5];
    const savingsData = years.map(y => Math.round(annualSavings * y));
    const costData = years.map(() => cost);

    const yearLabels = currentLang === 'en'
        ? ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
        : ['वर्ष 1', 'वर्ष 2', 'वर्ष 3', 'वर्ष 4', 'वर्ष 5'];

    if (roiChart) roiChart.destroy();

    roiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: yearLabels,
            datasets: [
                {
                    label: currentLang === 'en' ? 'Cumulative Savings (₹)' : 'संचयी बचत (₹)',
                    data: savingsData,
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8
                },
                {
                    label: currentLang === 'en' ? 'Installation Cost (₹)' : 'स्थापना लागत (₹)',
                    data: costData,
                    borderColor: '#d90429',
                    borderDash: [8, 4],
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    ticks: { color: '#fff', callback: v => '₹' + formatIndian(v) },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                },
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.05)' }
                }
            },
            plugins: {
                legend: { labels: { color: '#fff' } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ₹${formatIndian(ctx.parsed.y)}`
                    }
                }
            }
        }
    });
}


// ────────────────────────────────────────────────────────────
//  6. DASHBOARD (reads from DB)
// ────────────────────────────────────────────────────────────
let dashboardAnimated = false;

function refreshDashboard(dbOverride) {
    const db = dbOverride || JalDB.load();
    const stats = db.stats;
    const challengeCount = db.challenges.completed.length;

    const targets = {
        'dash-daily': stats.dailyUsageLiters,
        'dash-monthly': stats.monthlySavedLiters,
        'dash-challenges': challengeCount,
        'dash-score': stats.greenScore
    };

    Object.entries(targets).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (dashboardAnimated) {
            // Instant update after first animation
            el.innerText = formatIndian(value);
        }
        el.setAttribute('data-target', value);
    });
}

function animateDashboardCounters() {
    if (dashboardAnimated) return;
    dashboardAnimated = true;
    document.querySelectorAll('.counter').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target')) || 0;
        animateValue(counter, 0, target, 2000);
    });
}


// ────────────────────────────────────────────────────────────
//  7. INDIA WATER STRESS MAP
// ────────────────────────────────────────────────────────────
const statesData = [
    { id: 'rj', name: 'Rajasthan', nameHi: 'राजस्थान', stress: 'critical', gw: '-65%', pc: '780 m³', details: 'Severe groundwater depletion. Agriculture consumes 90% of water.' },
    { id: 'tn', name: 'Tamil Nadu', nameHi: 'तमिलनाडु', stress: 'critical', gw: '-58%', pc: '820 m³', details: 'High reliance on erratic monsoons. Chennai faced Day Zero in 2019.' },
    { id: 'hr', name: 'Haryana', nameHi: 'हरियाणा', stress: 'critical', gw: '-62%', pc: '710 m³', details: 'Excessive paddy cultivation drains groundwater at alarming rates.' },
    { id: 'pb', name: 'Punjab', nameHi: 'पंजाब', stress: 'critical', gw: '-60%', pc: '900 m³', details: 'Green Revolution legacy: free electricity for tube wells depletes aquifers.' },
    { id: 'dl', name: 'Delhi', nameHi: 'दिल्ली', stress: 'critical', gw: '-55%', pc: '300 m³', details: 'Extreme urban demand. Over 50% water lost in distribution leaks.' },
    { id: 'mh', name: 'Maharashtra', nameHi: 'महाराष्ट्र', stress: 'high', gw: '-40%', pc: '1,020 m³', details: 'Marathwada region faces recurring severe droughts.' },
    { id: 'up', name: 'Uttar Pradesh', nameHi: 'उत्तर प्रदेश', stress: 'high', gw: '-45%', pc: '1,100 m³', details: 'Ganga basin stress due to over-extraction for irrigation.' },
    { id: 'ka', name: 'Karnataka', nameHi: 'कर्नाटक', stress: 'high', gw: '-35%', pc: '1,200 m³', details: 'Bengaluru facing severe urban water management crisis.' },
    { id: 'gj', name: 'Gujarat', nameHi: 'गुजरात', stress: 'high', gw: '-42%', pc: '1,150 m³', details: 'Saurashtra and Kutch are naturally arid, worsened by industrialization.' },
    { id: 'ap', name: 'Andhra Pradesh', nameHi: 'आंध्र प्रदेश', stress: 'high', gw: '-38%', pc: '1,050 m³', details: 'Rayalaseema drought belt is among India\'s most water-stressed.' },
    { id: 'ts', name: 'Telangana', nameHi: 'तेलंगाना', stress: 'high', gw: '-36%', pc: '1,100 m³', details: 'Hyderabad\'s booming IT sector is rapidly increasing water demand.' },
    { id: 'mp', name: 'Madhya Pradesh', nameHi: 'मध्य प्रदेश', stress: 'medium', gw: '-20%', pc: '1,500 m³', details: 'Improving with Narmada basin management but local pockets are stressed.' },
    { id: 'br', name: 'Bihar', nameHi: 'बिहार', stress: 'medium', gw: '-15%', pc: '1,600 m³', details: 'Paradoxically faces both floods and drought in the same year.' },
    { id: 'wb', name: 'West Bengal', nameHi: 'पश्चिम बंगाल', stress: 'medium', gw: '-18%', pc: '1,700 m³', details: 'Arsenic contamination in groundwater is a major health crisis.' },
    { id: 'od', name: 'Odisha', nameHi: 'ओडिशा', stress: 'medium', gw: '-12%', pc: '1,800 m³', details: 'Cyclone-prone coast faces both floods and droughts seasonally.' },
    { id: 'cg', name: 'Chhattisgarh', nameHi: 'छत्तीसगढ़', stress: 'medium', gw: '-10%', pc: '1,900 m³', details: 'Mining activity threatens local water bodies and tribal communities.' },
    { id: 'jh', name: 'Jharkhand', nameHi: 'झारखंड', stress: 'medium', gw: '-14%', pc: '1,650 m³', details: 'Industrial mining pollutes rivers; rural areas lack clean water access.' },
    { id: 'kl', name: 'Kerala', nameHi: 'केरल', stress: 'low', gw: '-5%', pc: '2,200 m³', details: 'Abundant rainfall, but rapid runoff to sea limits actual availability.' },
    { id: 'as', name: 'Assam', nameHi: 'असम', stress: 'low', gw: '-2%', pc: '2,500 m³', details: 'Brahmaputra basin provides ample water, main issue is seasonal flooding.' },
    { id: 'ml', name: 'Meghalaya', nameHi: 'मेघालय', stress: 'low', gw: '-1%', pc: '3,200 m³', details: 'Home to Cherrapunji — one of the wettest places on Earth.' },
    { id: 'sk', name: 'Sikkim', nameHi: 'सिक्किम', stress: 'low', gw: '-3%', pc: '3,500 m³', details: 'Glacial-fed rivers keep water abundant. Climate change is a future risk.' },
    { id: 'ga', name: 'Goa', nameHi: 'गोवा', stress: 'low', gw: '-6%', pc: '2,400 m³', details: 'Good rainfall, but tourism and urbanization are increasing demand.' }
];

function renderMap(filter = 'all') {
    const grid = document.getElementById('states-grid');
    grid.innerHTML = '';

    const filtered = statesData.filter(s => filter === 'all' || s.stress === filter);

    filtered.forEach((state, i) => {
        const card = document.createElement('div');
        card.className = `state-card glass stress-${state.stress} fade-in`;
        card.style.transitionDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="state-name">${state.name} <span class="hi">${state.nameHi}</span></div>
            <div class="stress-level">${state.stress.toUpperCase()}</div>
            <div class="stat-row"><span>Groundwater:</span> <span class="stat-val">${state.gw}</span></div>
            <div class="state-details">
                <div class="stat-row"><span>Per Capita:</span> <span class="stat-val">${state.pc}</span></div>
                <p style="font-size: 0.85rem; margin-top: 10px; color: var(--text-muted);">${state.details}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.state-card').forEach(c => {
                if (c !== card) c.classList.remove('expanded');
            });
            card.classList.toggle('expanded');
        });
        grid.appendChild(card);

        // Trigger fade-in
        requestAnimationFrame(() => card.classList.add('visible'));
    });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        renderMap(e.target.dataset.filter);
    });
});


// ────────────────────────────────────────────────────────────
//  8. CHALLENGES SYSTEM (with DB persistence)
// ────────────────────────────────────────────────────────────
const challengesData = [
    { id: 'c1', icon: '🚿', title: '5-Minute Shower', titleHi: '5-मिनट शावर', desc: 'Cut your shower to 5 minutes max. Saves ~20L every time.', descHi: 'शावर को 5 मिनट तक सीमित करें। हर बार ~20L बचत।', diff: 'easy', saved: 20, cls: 'diff-easy' },
    { id: 'c2', icon: '🪣', title: 'Bucket Bath Day', titleHi: 'बाल्टी स्नान दिवस', desc: 'Use a bucket instead of a shower for one full day.', descHi: 'एक पूरे दिन शावर की जगह बाल्टी से नहाएं।', diff: 'med', saved: 40, cls: 'diff-med' },
    { id: 'c3', icon: '🚰', title: 'Turn Off the Tap', titleHi: 'ब्रश करते समय नल बंद', desc: 'Turn off the tap while brushing teeth — morning & night.', descHi: 'सुबह और रात दांत ब्रश करते समय नल बंद रखें।', diff: 'easy', saved: 15, cls: 'diff-easy' },
    { id: 'c4', icon: '🔧', title: 'Fix That Leak', titleHi: 'रिसाव ठीक करें', desc: 'Find and fix one leaking tap or pipe in your home.', descHi: 'अपने घर में एक रिसने वाले नल को ढूंढें और ठीक करें।', diff: 'hard', saved: 100, cls: 'diff-hard' },
    { id: 'c5', icon: '👕', title: 'Full Loads Only', titleHi: 'केवल फुल लोड', desc: 'Run washing machine only when completely full.', descHi: 'पूरी तरह भरने पर ही वाशिंग मशीन चलाएं।', diff: 'med', saved: 50, cls: 'diff-med' },
    { id: 'c6', icon: '🚗', title: 'Bucket Car Wash', titleHi: 'बाल्टी से कार धुलाई', desc: 'Wash your car using a bucket, not a hose pipe.', descHi: 'नली के बजाय बाल्टी से कार धोएं।', diff: 'med', saved: 100, cls: 'diff-med' },
    { id: 'c7', icon: '🌱', title: 'No-Hose Garden', titleHi: 'बिना नली बगीचा', desc: 'Water your plants with a watering can for one week.', descHi: 'एक हफ्ते तक पौधों को वाटरिंग कैन से पानी दें।', diff: 'easy', saved: 30, cls: 'diff-easy' },
    { id: 'c8', icon: '🌧️', title: 'Rain Catcher', titleHi: 'वर्षा जल संग्रह', desc: 'Collect rainwater in buckets/drums for reuse.', descHi: 'बारिश का पानी बाल्टी/ड्रम में इकट्ठा करें।', diff: 'hard', saved: 200, cls: 'diff-hard' }
];

function renderChallenges() {
    const db = JalDB.load();
    const completed = db.challenges.completed;
    const grid = document.getElementById('challenges-grid');
    grid.innerHTML = '';

    challengesData.forEach((c, i) => {
        const isDone = completed.includes(c.id);
        const card = document.createElement('div');
        card.className = 'challenge-card glass fade-in';
        card.style.transitionDelay = `${i * 0.08}s`;
        card.innerHTML = `
            <div class="chal-head">
                <div class="chal-icon">${c.icon}</div>
                <div class="chal-title">${currentLang === 'en' ? c.title : c.titleHi}</div>
            </div>
            <div class="chal-desc">${currentLang === 'en' ? c.desc : c.descHi}</div>
            <div class="chal-meta">
                <span class="${c.cls}">${c.diff.toUpperCase()}</span>
                <span class="save-amt">Saves ~${c.saved}L/day</span>
            </div>
            <button class="cta-button btn-accept ${isDone ? 'accepted' : ''}" data-id="${c.id}">
                ${isDone ? t('chalDone') : t('chalAccept')}
            </button>
        `;
        grid.appendChild(card);
        requestAnimationFrame(() => card.classList.add('visible'));
    });

    updateChallengesUI(completed);
    bindChallengeButtons();
}

function bindChallengeButtons() {
    document.querySelectorAll('.btn-accept:not(.accepted)').forEach(btn => {
        btn.addEventListener('click', function () {
            const id = this.getAttribute('data-id');
            const db = JalDB.load();
            if (!db.challenges.completed.includes(id)) {
                db.challenges.completed.push(id);
                db.challenges.acceptedDate[id] = new Date().toISOString().split('T')[0];
                JalDB.save(db);

                this.classList.add('accepted');
                this.innerText = t('chalDone');

                createConfetti(this);
                updateChallengesUI(db.challenges.completed);

                // Recalculate everything
                calculateWaterUsage();
            }
        });
    });
}

function updateChallengesUI(completed) {
    const count = completed.length;
    document.getElementById('chal-count').innerText =
        `${count}/8 ${currentLang === 'en' ? 'Completed' : 'पूरा'}`;
    document.getElementById('chal-progress-bar').style.width = `${(count / 8) * 100}%`;

    // Badges
    [1, 3, 5, 8].forEach(threshold => {
        const badge = document.getElementById(`badge-${threshold}`);
        if (badge) badge.classList.toggle('locked', count < threshold);
    });
}

function createConfetti(btn) {
    const rect = btn.getBoundingClientRect();
    const colors = ['#00d4ff', '#00b4d8', '#48cae4', '#76c893', '#fff', '#fcbf49'];
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = `${rect.left + Math.random() * rect.width}px`;
        conf.style.top = `${rect.top}px`;
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        conf.style.width = `${Math.random() * 8 + 4}px`;
        conf.style.height = conf.style.width;
        conf.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        conf.style.animationDuration = `${Math.random() * 1.5 + 0.5}s`;
        document.body.appendChild(conf);
        setTimeout(() => conf.remove(), 2500);
    }
}


// ────────────────────────────────────────────────────────────
//  9. NAVIGATION & SCROLL EFFECTS
// ────────────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
});

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('nav-toggle').checked = false;
    });
});


// ────────────────────────────────────────────────────────────
//  10. WATER PARTICLES
// ────────────────────────────────────────────────────────────
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 12 + 4;
    p.style.left = `${Math.random() * 100}vw`;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.animationDuration = `${Math.random() * 12 + 8}s`;
    p.style.animationDelay = `${Math.random() * 15}s`;
    particlesContainer.appendChild(p);
}


// ────────────────────────────────────────────────────────────
//  11. SCROLL ANIMATIONS (Intersection Observer)
// ────────────────────────────────────────────────────────────
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Trigger dashboard counter animation once
            if (entry.target.id === 'dashboard') {
                animateDashboardCounters();
            }
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in, .slide-up, section').forEach(el => {
    scrollObserver.observe(el);
});


// ────────────────────────────────────────────────────────────
//  12. EVENT BINDINGS
// ────────────────────────────────────────────────────────────

// Language toggle
document.getElementById('lang-toggle').addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    JalDB.set('lang', currentLang);
    applyTranslations();
    // Re-render language-dependent content
    calculateWaterUsage();
    calculateRainwater();
    renderChallenges();
});

// Calculator sliders
SLIDER_IDS.forEach(id => {
    document.getElementById(`range-${id}`).addEventListener('input', debounce(calculateWaterUsage, 50));
});

// Rainwater inputs
document.getElementById('rain-city').addEventListener('change', function () {
    if (this.value !== 'custom') {
        document.getElementById('rain-amount').value = this.value;
        JalDB.set('rainwater.city', this.value);
        calculateRainwater();
    }
});
['rain-amount', 'rain-area', 'range-coeff'].forEach(id => {
    document.getElementById(id).addEventListener('input', debounce(calculateRainwater, 100));
});

// Share button
document.getElementById('btn-share-rain').addEventListener('click', () => {
    const db = JalDB.load();
    const text = currentLang === 'en'
        ? `🌧️ With just ${db.rainwater.area}m² of roof, I can harvest ${formatIndian(db.stats.rainwaterAnnualHarvest)}L of rainwater/year and save ₹${formatIndian(db.stats.rainwaterMoneySaved)}! Calculate yours at Jal Rakshak 💧`
        : `🌧️ सिर्फ ${db.rainwater.area}m² छत से, मैं ${formatIndian(db.stats.rainwaterAnnualHarvest)}L वर्षा जल/वर्ष संग्रह कर ₹${formatIndian(db.stats.rainwaterMoneySaved)} बचा सकता हूं! जल रक्षक 💧`;
    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('btn-share-rain');
        const original = btn.innerText;
        btn.innerText = '✅ ' + t('copied');
        setTimeout(() => { btn.innerText = original; }, 2000);
    });
});


// ────────────────────────────────────────────────────────────
//  13. INITIALIZATION
// ────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    // Track visits
    const db = JalDB.load();
    db.stats.totalSessions = (db.stats.totalSessions || 0) + 1;
    if (!db.stats.firstVisit) db.stats.firstVisit = new Date().toISOString();
    db.stats.lastVisit = new Date().toISOString();
    JalDB.save(db);

    // Restore saved slider values from DB
    SLIDER_IDS.forEach(id => {
        const saved = db.calculator[id];
        if (saved !== undefined) {
            document.getElementById(`range-${id}`).value = saved;
        }
    });

    // Restore rainwater values
    if (db.rainwater.city) document.getElementById('rain-city').value = db.rainwater.city;
    if (db.rainwater.rainfall) document.getElementById('rain-amount').value = db.rainwater.rainfall;
    if (db.rainwater.area) document.getElementById('rain-area').value = db.rainwater.area;
    if (db.rainwater.coeff) document.getElementById('range-coeff').value = db.rainwater.coeff;

    // Apply language
    applyTranslations();

    // Run calculations (this also updates dashboard)
    calculateWaterUsage();
    calculateRainwater();

    // Render dynamic sections
    renderMap();
    renderChallenges();

    console.log('%c💧 Jal Rakshak initialized', 'color: #00d4ff; font-size: 14px; font-weight: bold;');
    console.log('%cDatabase:', 'color: #48cae4;', JalDB.load());
});
