// Translation strings for German and English
const translations = {
    de: {
        title: "RickRoll Detektor",
        description: "Gib eine URL ein, um zu prüfen, ob es sich um einen Rickroll handelt.",
        placeholder: "https://example.com",
        checkButton: "Prüfen",
        resultPositive: "Das ist ein Rickroll! 🎵",
        resultNegative: "Das ist kein Rickroll. ✅",
        errorInvalid: "Ungültige URL. Bitte gib eine gültige URL ein.",
        issuesButton: "Neue Rickroll-URL vorschlagen",
        footer: "Erkenne Rickrolls, bevor es zu spät ist!"
    },
    en: {
        title: "RickRoll Detector",
        description: "Enter a URL to check if it's a Rickroll.",
        placeholder: "https://example.com",
        checkButton: "Check",
        resultPositive: "This is a Rickroll! 🎵",
        resultNegative: "This is not a Rickroll. ✅",
        errorInvalid: "Invalid URL. Please enter a valid URL.",
        issuesButton: "Suggest new Rickroll URL",
        footer: "Detect Rickrolls before it's too late!"
    }
};

let currentLang = 'en';
let normalizedRickrolls = new Set();

/**
 * Normalize a URL to a canonical form for comparison.
 * - Removes http/https, www., m.
 * - Converts youtu.be/abc → youtube.com/watch?v=abc
 * - Removes trailing slash
 * - Keeps query parameters
 * Returns null if URL is invalid.
 */
function normalizeUrl(url) {
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) {
        u = 'https://' + u;
    }
    let parsed;
    try {
        parsed = new URL(u);
    } catch (_) {
        return null;
    }
    let host = parsed.hostname;
    let path = parsed.pathname;
    let search = parsed.search || '';

    // Remove trailing slash
    if (path.endsWith('/')) path = path.slice(0, -1);

    // Handle YouTube short links
    if (host === 'youtu.be') {
        const videoId = path.slice(1); // remove leading '/'
        host = 'youtube.com';
        path = '/watch';
        search = '?v=' + videoId;
    } else if (host === 'm.youtube.com' || host === 'www.youtube.com') {
        host = 'youtube.com';
    } else {
        // Remove common subdomains for other domains
        if (host.startsWith('www.')) host = host.slice(4);
        if (host.startsWith('m.')) host = host.slice(2);
    }

    return host + path + search;
}

// Build the lookup set from the list
function initRickrolls() {
    normalizedRickrolls.clear();
    for (let url of RICKROLLS) {
        const norm = normalizeUrl(url);
        if (norm) normalizedRickrolls.add(norm);
    }
    console.log('Loaded ' + normalizedRickrolls.size + ' normalized Rickroll URLs.');
}

// Check if a URL is a Rickroll (true/false), null if invalid
function isRickroll(url) {
    const norm = normalizeUrl(url);
    if (!norm) return null;
    return normalizedRickrolls.has(norm);
}

// ---------- UI ----------
function setLanguage(lang) {
    currentLang = lang;
    const t = translations[lang];
    document.getElementById('title').textContent = t.title;
    document.getElementById('description').textContent = t.description;
    document.getElementById('urlInput').placeholder = t.placeholder;
    document.getElementById('checkBtn').textContent = t.checkButton;
    document.getElementById('footerText').textContent = t.footer;
    document.getElementById('issuesLink').textContent = t.issuesButton;

    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    clearResult();
}

function clearResult() {
    const el = document.getElementById('result');
    el.textContent = '';
    el.className = '';
}

function showResult(message, type) {
    const el = document.getElementById('result');
    el.textContent = message;
    el.className = type; // 'positive', 'negative', 'error'
}

// ---------- Event Listeners ----------
document.addEventListener('DOMContentLoaded', function () {
    initRickrolls();
    setLanguage('en');

    // Language switcher
    document.querySelectorAll('.language-switcher button').forEach(btn => {
        btn.addEventListener('click', function () {
            setLanguage(this.dataset.lang);
        });
    });

    // Check button
    document.getElementById('checkBtn').addEventListener('click', function () {
        const input = document.getElementById('urlInput').value.trim();
        if (!input) {
            showResult(translations[currentLang].errorInvalid, 'error');
            return;
        }
        const result = isRickroll(input);
        const t = translations[currentLang];
        if (result === null) {
            showResult(t.errorInvalid, 'error');
        } else if (result) {
            showResult(t.resultPositive, 'positive');
        } else {
            showResult(t.resultNegative, 'negative');
        }
    });

    // Enter key
    document.getElementById('urlInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('checkBtn').click();
        }
    });

    // GitHub Issues link – replace with your own repo URL
    document.getElementById('issuesLink').href = 'https://github.com/rickrolldetector/rickrolldetector.github.io/issues';
});
