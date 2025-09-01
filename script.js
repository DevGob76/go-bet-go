// Constantes et variables globales
const ADMIN_CODE = "Gob19*20";
const ADMIN_USER = { name: "john gobolo", phone: "2250586214172" };
let authorizedUsers = [];
let currentUser = null;
let archivedResults = [];
let archivedRepartitions = [];
let resultsArchives = [];
let generalArchives = [];
let profitLossData = [];

// --- Gestion des utilisateurs ---
function loadUsersFromLocalStorage() {
    const savedUsers = localStorage.getItem('authorizedUsers');
    authorizedUsers = savedUsers ? JSON.parse(savedUsers) : [ADMIN_USER];
    saveUsersToLocalStorage();
}

function saveUsersToLocalStorage() {
    localStorage.setItem('authorizedUsers', JSON.stringify(authorizedUsers));
}

// --- Fonctions de connexion ---
function login() {
    const nameInput = document.getElementById('nameInput').value.trim();
    const phoneInput = document.getElementById('phoneInput').value.trim().replace(/\s/g, '');
    if (!nameInput || !phoneInput) {
        return showPopup('Erreur', 'Veuillez entrer votre nom et votre numéro de téléphone');
    }
    const user = authorizedUsers.find(u => u.phone === phoneInput && u.name.toLowerCase() === nameInput.toLowerCase());
    if (user) {
        currentUser = user;
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('mainPage').classList.add('active');
        showPopup('Bienvenue', `Accès autorisé à Go Bet Go, ${user.name} !`);
        loadFromLocalStorage();
    } else {
        showPopup('Accès Refusé', 'Nom ou numéro de téléphone non autorisé');
    }
}

// --- Gestion des archives ---
function archiveResults() {
    const synthesisResults = document.getElementById('synthesisResults').innerHTML;
    const date = document.getElementById('matchDate').value;
    const championship = document.getElementById('championshipDropdown').value;
    if (!synthesisResults.includes('match-section') || !date || !championship) {
        return showPopup('Erreur', 'Veuillez générer une synthèse, et sélectionner une date et un championnat.');
    }
    const archiveItem = { date, championship, results: synthesisResults };
    archivedResults.push(archiveItem);
    saveToLocalStorage();
    document.getElementById('synthesisResults').innerHTML = '';
    updateDropdowns();
    showPopup('Succès', 'Résultats archivés');
}

// --- Calculs et logique de répartition ---
function calculateBets() {
    const budget = parseFloat(document.getElementById('budgetInput').value) || 0;
    const tauxNet = parseFloat(document.getElementById('tauxNetInput').value) || 0;
    const betAmount = (budget * tauxNet / 100);
    document.getElementById('totalToDistribute').value = betAmount.toFixed(2);
    // ... (logique de calcul détaillée, voir code original)
}

// --- Fonctions utilitaires ---
function showPopup(title, message) {
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// --- Initialisation ---
window.onload = function() {
    loadUsersFromLocalStorage();
    if (!authorizedUsers.some(user => user.phone === ADMIN_USER.phone)) {
        authorizedUsers.push(ADMIN_USER);
        saveUsersToLocalStorage();
    }
    if (profitLossData.length === 0 && currentUser) {
        addProfitLossRow();
    }
};