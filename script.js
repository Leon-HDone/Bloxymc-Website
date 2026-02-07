/* --- SIMULIERTE DATENBANK (Mock Data) --- */

// 1. Die Bots
const botsData = [
    { id: 1, name: "Vouch Bot", status: "online", errors: 1, ram: "2053MB" },
    { id: 2, name: "Store Secruity", status: "online", errors: 0, ram: "4000MB" },
    { id: 3, name: "K7 Reselling", status: "online", errors: 1, ram: "5317MB" },
    { id: 4, name: "Fun Bot", status: "online", errors: 0, ram: "120MB" },
    { id: 5, name: "Security Sentinel", status: "online", errors: 0, ram: "500MB" }
];

// 2. Die Benutzer & Zuweisungen
// WICHTIG: Hier legst du fest, welcher User welche Bots (assignedBotIds) sehen darf!
const usersData = [
    { 
        username: "admin", 
        password: "123", 
        role: "admin", 
        assignedBotIds: [1, 2, 3, 4, 5] // Admin sieht alles
    },
    { 
        username: "036", 
        password: "036pasword14", 
        role: "user", 
        assignedBotIds: [1, 2] // User1 sieht nur Mod & Music Bot
    },
    { 
        username: "k7", 
        password: "1414k7password", 
        role: "user", 
        assignedBotIds: [3] // Kunde X sieht nur den Ticket Bot
    }
];

let currentUser = null;

/* --- LOGIN LOGIK --- */

const loginForm = document.getElementById('login-form');
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const errorMsg = document.getElementById('login-error');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;

    // Benutzer suchen
    const foundUser = usersData.find(u => u.username === userIn && u.password === passIn);

    if (foundUser) {
        currentUser = foundUser;
        initDashboard();
    } else {
        errorMsg.textContent = "Zugriff verweigert. Falsche Daten.";
    }
});

function initDashboard() {
    // UI Umschalten
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Sidebar Infos setzen
    document.getElementById('display-username').textContent = currentUser.username;
    document.getElementById('display-role').textContent = currentUser.role.toUpperCase();

    // Admin Panel im Menü zeigen/verstecken
    if(currentUser.role === 'admin') {
        document.getElementById('nav-admin').classList.remove('hidden');
    }

    // Daten laden
    loadBots();
    loadStats();
    
    // Standardseite Dashboard zeigen
    showPage('dashboard');
}

/* --- BOT LOGIK (Zuweisung) --- */

function loadBots() {
    const botContainer = document.getElementById('bot-list');
    botContainer.innerHTML = '';

    // Filter: Zeige nur Bots, deren ID im Array des Users ist
    const myBots = botsData.filter(bot => currentUser.assignedBotIds.includes(bot.id));

    if (myBots.length === 0) {
        botContainer.innerHTML = '<p>Keine Bots zugewiesen.</p>';
        return;
    }

    myBots.forEach(bot => {
        // Status Farbe bestimmen
        const statusClass = bot.status === 'online' ? 'online' : 'offline';
        const errorBadge = bot.errors > 0 ? `<span style="color:var(--error)">⚠️ ${bot.errors} Fehler</span>` : '<span>✅ Stabil</span>';

        const card = document.createElement('div');
        card.className = 'card bot-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>${bot.name}</h3>
                <span class="status-indicator ${statusClass}">${bot.status.toUpperCase()}</span>
            </div>
            <p style="margin-top:10px; font-size:0.9rem; color:#aaa;">RAM: ${bot.ram}</p>
            <div style="margin-top:15px; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                ${errorBadge}
            </div>
            ${currentUser.role === 'admin' ? '<button class="neon-btn" style="margin-top:10px; font-size:0.8rem;">Restart</button>' : ''}
        `;
        botContainer.appendChild(card);
    });
}

function loadStats() {
    // Berechne Fehler nur für die Bots, die der User sieht
    const myBots = botsData.filter(bot => currentUser.assignedBotIds.includes(bot.id));
    const totalErrors = myBots.reduce((sum, bot) => sum + bot.errors, 0);
    
    document.getElementById('total-errors').textContent = totalErrors;
}

/* --- NAVIGATION --- */

function showPage(pageId) {
    // Alle Seiten verstecken
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));

    // Gewählte Seite zeigen
    document.getElementById('page-' + pageId).classList.remove('hidden');
    
    // Menüpunkt aktiv setzen (einfacher Check)
    const navItems = document.querySelectorAll('.nav-links li');
    if(pageId === 'dashboard') navItems[0].classList.add('active');
    if(pageId === 'bots') navItems[1].classList.add('active');
    if(pageId === 'costs') navItems[2].classList.add('active');
    if(pageId === 'admin') navItems[3].classList.add('active');
}

function logout() {
    location.reload(); // Einfachste Methode für Logout
}