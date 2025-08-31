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

// Charger les données depuis le localStorage au démarrage
function loadFromLocalStorage() {
    const savedProfitLossData = localStorage.getItem('profitLossData');
    if (savedProfitLossData) {
        profitLossData = JSON.parse(savedProfitLossData);
        renderProfitLossTable();
        updateProfitCalculations();
    }
    const savedInitialCapital = localStorage.getItem('initialCapital');
    if (savedInitialCapital) {
        document.getElementById('initialCapital').value = savedInitialCapital;
    }
    const savedUsers = localStorage.getItem('authorizedUsers');
    if (savedUsers) {
        authorizedUsers = JSON.parse(savedUsers);
    }
    const savedArchivedResults = localStorage.getItem('archivedResults');
    if (savedArchivedResults) {
        archivedResults = JSON.parse(savedArchivedResults);
    }
    const savedArchivedRepartitions = localStorage.getItem('archivedRepartitions');
    if (savedArchivedRepartitions) {
        archivedRepartitions = JSON.parse(savedArchivedRepartitions);
    }
    const savedGeneralArchives = localStorage.getItem('generalArchives');
    if (savedGeneralArchives) {
        generalArchives = JSON.parse(savedGeneralArchives);
    }
    // Ajouter l'admin par défaut s'il n'existe pas déjà
    if (!authorizedUsers.some(user => user.phone === ADMIN_USER.phone)) {
        authorizedUsers.push(ADMIN_USER);
        saveUsersToLocalStorage();
    }
    // Mettre à jour les dropdowns
    updateDropdowns();
}

// Sauvegarder les données dans le localStorage
function saveToLocalStorage() {
    localStorage.setItem('profitLossData', JSON.stringify(profitLossData));
    localStorage.setItem('initialCapital', document.getElementById('initialCapital').value);
    localStorage.setItem('archivedResults', JSON.stringify(archivedResults));
    localStorage.setItem('archivedRepartitions', JSON.stringify(archivedRepartitions));
    localStorage.setItem('generalArchives', JSON.stringify(generalArchives));
}

// Sauvegarder les utilisateurs
function saveUsersToLocalStorage() {
    localStorage.setItem('authorizedUsers', JSON.stringify(authorizedUsers));
}

// Connexion de l'utilisateur
function login() {
    const nameInput = document.getElementById('nameInput').value.trim();
    const phoneInput = document.getElementById('phoneInput').value.trim().replace(/\s/g, '');
    if (!nameInput || !phoneInput) {
        return showPopup('Erreur', 'Veuillez entrer votre nom et votre numéro de téléphone');
    }
    // Vérifier si l'utilisateur est autorisé
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

// Afficher une page spécifique
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    // Mettre à jour les statistiques quand on accède à la page des résultats
    if (pageId === 'resultsPage') {
        updateResultsStats();
        updateResultsArchiveDropdown();
    }
    // Mettre à jour les calculs quand on accède à la page de bilan
    if (pageId === 'balancePage') {
        updateProfitCalculations();
    }
    // Mettre à jour les archives quand on accède à la page d'archives
    if (pageId === 'archivesPage') {
        updateGeneralArchivesDropdown();
        updateDeleteButtonState();
    }
}

// Afficher un popup
function showPopup(title, message) {
    document.getElementById('popupTitle').textContent = title;
    document.getElementById('popupMessage').textContent = message;
    document.getElementById('popup').style.display = 'block';
}

// Fermer le popup
function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

// Fonctions pour l'administration
function openAdminPanel() {
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminContent').style.display = 'none';
    document.getElementById('adminCodeInput').value = '';
}

function closeAdminPanel() {
    document.getElementById('adminPanel').style.display = 'none';
}

function verifyAdminCode() {
    const code = document.getElementById('adminCodeInput').value;
    if (code === ADMIN_CODE) {
        document.getElementById('adminContent').style.display = 'block';
        renderUsersList();
    } else {
        showPopup('Erreur', 'Code administrateur incorrect');
    }
}

function addUser() {
    const name = document.getElementById('newUserName').value.trim();
    const phone = document.getElementById('newUserPhone').value.trim().replace(/\s/g, '');
    if (!name || !phone) {
        return showPopup('Erreur', 'Veuillez remplir tous les champs');
    }
    // Vérifier si l'utilisateur existe déjà
    if (authorizedUsers.some(user => user.phone === phone)) {
        return showPopup('Erreur', 'Ce numéro de téléphone est déjà enregistré');
    }
    authorizedUsers.push({ name, phone });
    saveUsersToLocalStorage();
    renderUsersList();
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserPhone').value = '';
    showPopup('Succès', 'Utilisateur ajouté avec succès');
}

function renderUsersList() {
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    authorizedUsers.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div>${user.name} - ${user.phone}</div>
            <button class="delete-btn" onclick="removeUser(${index})">Supprimer</button>
        `;
        usersList.appendChild(userItem);
    });
}

function removeUser(index) {
    // Empêcher la suppression de l'admin
    if (authorizedUsers[index].phone === ADMIN_USER.phone) {
        return showPopup('Erreur', 'Impossible de supprimer l\'administrateur principal');
    }
    authorizedUsers.splice(index, 1);
    saveUsersToLocalStorage();
    renderUsersList();
    showPopup('Succès', 'Utilisateur supprimé avec succès');
}

// Écouteurs d'événements pour la connexion
document.getElementById('phoneInput').addEventListener('keypress', e => e.key === 'Enter' && login());
document.getElementById('nameInput').addEventListener('keypress', e => e.key === 'Enter' && login());

// Mise à jour de la question pour l'IA
document.getElementById('sportDropdown').addEventListener('change', function() {
    const sport = this.value;
    const championshipDropdown = document.getElementById('championshipDropdown');
    championshipDropdown.innerHTML = '<option value="">Sélectionnez un championnat</option>';
    if (sport === 'football') {
        const championships = [
            { name: "🇬🇷 Grèce – Super League", color: "red" },
            { name: "🇷🇴 Roumanie – Liga 1", color: "green" },
            { name: "ROUMANIE: Liga 2", color: "green" },
            { name: "🇸🇮 Slovénie – Prva Liga" },
            { name: "🇸🇰 Slovaquie – Super Liga" },
            { name: "🇷🇺 Russie – Premier League", color: "green" },
            { name: "🇫🇷 France – Ligue 2", color: "green" },
            { name: "🇮🇹 Italie – Serie B", color: "red" },
            { name: "🇧🇷 Brésil – Série A", color: "red" },
            { name: "BRÉSIL - Serie B Superbet", color: "red" },
            { name: "🇦🇷 Argentine – Liga Profesional", color: "green" },
            { name: "🇨🇴 Colombie – Liga BetPlay" },
            { name: "ANGLETERRE - Championship", color: "green" },
            { name: "ANGLETERRE - League One", color: "red" },
            { name: "ANGLETERRE - League Two", color: "red" },
            { name: "Espagne - LaLiga2", color: "green" },
            { name: "COTE D'IVOIRE - Ligue 1", color: "red" },
            { name: "EGYPTE - Premier League", color: "red" },
            { name: "NIGÉRIA - NPFL", color: "red" },
            { name: "AFRIQUE DU SUD: Betway Premiership", color: "red" },
            { name: "🇫🇷 France – Ligue 1", color: "black" },
            { name: "🏴 Angleterre – Premier League", color: "black" },
            { name: "🇪🇸 Espagne – La Liga", color: "black" },
            { name: "🇮🇹 Italie – Serie A", color: "black" },
            { name: "🇩🇪 Allemagne – Bundesliga", color: "black" }
        ];
        championships.forEach(champ => {
            const option = document.createElement('option');
            option.value = champ.name;
            option.textContent = champ.color ? `🔔 ${champ.name}` : champ.name;
            if (champ.color) option.classList.add(champ.color);
            championshipDropdown.appendChild(option);
        });
    }
});

document.getElementById('championshipDropdown').addEventListener('change', updateAIQuestion);
document.getElementById('matchDate').addEventListener('change', updateAIQuestion);

function updateAIQuestion() {
    const championship = document.getElementById('championshipDropdown').value;
    const date = document.getElementById('matchDate').value;
    document.getElementById('selectedChampionship').textContent = championship;
    document.getElementById('selectedDate').textContent = date;
}

function copyAIQuestion() {
    const textToCopy = document.querySelector('.match-info p').textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        showPopup('Succès', 'Texte copié pour IA');
    }).catch(err => console.error('Erreur de copie: ', err));
}

// Synthétiser les résultats des IA
function synthesizeResults() {
    const responses = [
        document.getElementById('perplexityResponse').innerText,
        document.getElementById('chatgptResponse').innerText,
        document.getElementById('geminiResponse').innerText,
        document.getElementById('copilotResponse').innerText,
    ].filter(text => text.trim() !== '');
    if (responses.length === 0) {
        showPopup('Erreur', 'Veuillez fournir au moins une réponse d\'IA.');
        return;
    }
    const masterData = {};
    const matchRegex = /([A-Za-z0-9\s\.'-]+)\s+(?:vs|contre)\s+([A-Za-z0-9\s\.'-]+)/gi;
    const scoreRegex = /(\d{1,2})-(\d{1,2})/g;
    const underOverRegex = /(Under|Over)\s*(\d+(?:\.\d+)?)/gi;
    responses.forEach(text => {
        let matches;
        while ((matches = matchRegex.exec(text)) !== null) {
            const team1 = matches[1].trim();
            const team2 = matches[2].trim();
            const matchKey = `${team1} vs ${team2}`;
            if (!masterData[matchKey]) {
                masterData[matchKey] = { scores: {}, underOvers: {}, team1Wins: 0, team2Wins: 0 };
            }
            const nextMatchIndex = text.substring(matches.index + matches[0].length).search(matchRegex);
            const searchArea = nextMatchIndex === -1
                ? text.substring(matches.index)
                : text.substring(matches.index, matches.index + matches[0].length + nextMatchIndex);
            const foundScores = searchArea.match(scoreRegex) || [];
            foundScores.forEach(score => {
                masterData[matchKey].scores[score] = (masterData[matchKey].scores[score] || 0) + 1;
                const [score1, score2] = score.split('-').map(Number);
                if (score1 > score2) masterData[matchKey].team1Wins++;
                if (score2 > score1) masterData[matchKey].team2Wins++;
            });
            let underOverMatch;
            const localUnderOverRegex = new RegExp(underOverRegex.source, 'gi');
            while ((underOverMatch = localUnderOverRegex.exec(searchArea)) !== null) {
                const uoKey = `${underOverMatch[1]} ${underOverMatch[2]}`;
                masterData[matchKey].underOvers[uoKey] = (masterData[matchKey].underOvers[uoKey] || 0) + 1;
            }
        }
    });
    const synthesisDiv = document.getElementById('synthesisResults');
    synthesisDiv.innerHTML = '<h4>Synthèse des Pronostics:</h4>';
    if (Object.keys(masterData).length === 0) {
        synthesisDiv.innerHTML += '<p>Aucun match trouvé dans les réponses des IA.</p>';
        return;
    }
    for (const match in masterData) {
        const matchData = masterData[match];
        const [team1, team2] = match.split(' vs ');
        let favoriteTeam = null;
        let favoriteStatus = '';
        if (matchData.team1Wins > matchData.team2Wins) {
            favoriteTeam = team1;
            favoriteStatus = ' (Favori Domicile)';
        } else if (matchData.team2Wins > matchData.team1Wins) {
            favoriteTeam = team2;
            favoriteStatus = ' (Favori Extérieur)';
        }
        let matchSection = `<div class="match-section" data-favorite-team="${favoriteTeam || ''}" data-favorite-status="${favoriteStatus.includes('Domicile') ? 'home' : (favoriteStatus.includes('Extérieur') ? 'away' : '')}"><h5>${match} ${favoriteTeam ? `<span style="color: #0984e3;">${favoriteStatus}</span>` : ''}</h5>`;
        matchSection += `<p><b>Scores:</b></p>`;
        const sortedScores = Object.entries(matchData.scores).sort((a, b) => b[1] - a[1]);
        if (sortedScores.length > 0) {
            sortedScores.forEach(([score, count]) => {
                matchSection += `<p class="${count > 1 ? 'highlight' : ''}">${score} (${count} fois)</p>`;
            });
        } else {
            matchSection += `<p>Aucun score trouvé.</p>`;
        }
        matchSection += `<p style="margin-top:10px;"><b>Total Buts Under/Over:</b></p>`;
        const sortedUnderOvers = Object.entries(matchData.underOvers).sort((a, b) => b[1] - a[1]);
        if (sortedUnderOvers.length > 0) {
            const bestUnderOver = sortedUnderOvers[0][0];
            matchSection += `<div class="under-over-synthesis"><p class="highlight"><strong>🎯 Under/Over :</strong> ${bestUnderOver} (${sortedUnderOvers[0][1]} fois)</p></div>`;
            for (let i = 1; i < sortedUnderOvers.length; i++) {
                matchSection += `<p>${sortedUnderOvers[i][0]} (${sortedUnderOvers[i][1]} fois)</p>`;
            }
        } else {
            matchSection += `<p>Aucun pronostic Under/Over trouvé.</p>`;
        }
        matchSection += `</div>`;
        synthesisDiv.innerHTML += matchSection;
    }
}

// Archiver les résultats
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

// Mettre à jour les dropdowns
function updateDropdowns() {
    updateArchiveDropdown();
    updateArchivedPredictionDropdown();
    updateResultsArchiveDropdown();
    updateGeneralArchivesDropdown();
}

function updateArchiveDropdown() {
    const dropdown = document.getElementById('archiveDropdown');
    dropdown.innerHTML = '<option value="">Sélectionnez un résultat archivé</option>';
    archivedResults.forEach((archive, index) => {
        dropdown.innerHTML += `<option value="${index}">Archive ${index + 1} - ${archive.date} - ${archive.championship}</option>`;
    });
}

function updateArchivedPredictionDropdown() {
    const dropdown = document.getElementById('archivedPredictionDropdown');
    dropdown.innerHTML = '<option value="">Sélectionnez une prédiction archivée</option>';
    archivedResults.forEach((archive, index) => {
        dropdown.innerHTML += `<option value="${index}">Archive ${index + 1} - ${archive.date} - ${archive.championship}</option>`;
    });
}

function updateResultsArchiveDropdown() {
    const dropdown = document.getElementById('resultsArchiveDropdown');
    dropdown.innerHTML = '<option value="">Sélectionnez une date</option>';
    archivedRepartitions.forEach((archive, index) => {
        dropdown.innerHTML += `<option value="${index}">${archive.date} - ${archive.prediction.championship}</option>`;
    });
}

function updateGeneralArchivesDropdown() {
    const dropdown = document.getElementById('generalArchivesDropdown');
    dropdown.innerHTML = '<option value="">Sélectionnez une fiche de synthèse</option>';
    // Ajouter les archives de prédictions
    archivedResults.forEach((archive, index) => {
        dropdown.innerHTML += `<option value="prediction-${index}">Prédiction - ${archive.date} - ${archive.championship}</option>`;
    });
    // Ajouter les archives de répartitions
    archivedRepartitions.forEach((archive, index) => {
        dropdown.innerHTML += `<option value="repartition-${index}">Répartition - ${archive.date} - ${archive.prediction.championship}</option>`;
    });
    updateDeleteButtonState();
}

function updateDeleteButtonState() {
    const dropdown = document.getElementById('generalArchivesDropdown');
    const deleteBtn = document.getElementById('deleteGeneralArchiveBtn');
    deleteBtn.disabled = dropdown.value === '';
}

function displayArchivedResults() {
    const index = document.getElementById('archiveDropdown').value;
    const container = document.getElementById('archivedResults');
    if (index === '') {
        container.innerHTML = '';
        return;
    }
    const item = archivedResults[index];
    container.innerHTML = `
        <h4>Date: ${item.date}</h4>
        <h4>Championnat: ${item.championship}</h4>
        <div>${item.results}</div>
        <button class="delete-btn" onclick="deleteArchive(${index})">Supprimer cet archive</button>
    `;
}

function deleteArchive(index) {
    archivedResults.splice(index, 1);
    saveToLocalStorage();
    document.getElementById('archivedResults').innerHTML = '';
    updateDropdowns();
    showPopup('Succès', 'Archive supprimée');
}

function displaySelectedArchivedPrediction() {
    const selectedIndex = document.getElementById('archivedPredictionDropdown').value;
    const repartitionContainer = document.getElementById('repartition-container');
    const synthesisContainer = document.getElementById('selectedPredictionSynthesis');
    repartitionContainer.innerHTML = '';
    synthesisContainer.innerHTML = '';
    if (selectedIndex === '') return;
    const archiveItem = archivedResults[selectedIndex];
    synthesisContainer.innerHTML = `<h4>Synthèse de la prédiction:</h4>${archiveItem.results}`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(archiveItem.results, 'text/html');
    const matchSections = doc.querySelectorAll('.match-section');
    matchSections.forEach((section, index) => {
        const favoriteTeam = section.dataset.favoriteTeam;
        const favoriteStatus = section.dataset.favoriteStatus;
        if (favoriteTeam && favoriteStatus) {
            const isHome = favoriteStatus === 'home';
            const highlightedUnderOvers = Array.from(section.querySelectorAll('.under-over-synthesis p.highlight'))
                .filter(p => p.innerText.toLowerCase().includes('under') || p.innerText.toLowerCase().includes('over'));
            createTeamRepartitionTable(favoriteTeam, isHome, `match-${index}-fav`, highlightedUnderOvers);
        }
    });
    calculateBets();
}

function createTeamRepartitionTable(teamName, isHome, idPrefix, underOvers) {
    const container = document.getElementById('repartition-container');
    const scoresData = {
        home: [["1-1", "2-1", "1-0", "2-0"], ["1-2", "3-1", "3-2", "2-2"]],
        away: [["1-1", "2-1", "0-1", "0-2"], ["1-2", "1-3", "2-3", "2-2"]]
    };
    const oddsData = {
        home: [[5.5, 11, 15, 5.5], [8, 12, 15, 9]],
        away: [[5.5, 11, 15, 5.5], [8, 12, 15, 9]]
    };
    const selectedScores = isHome ? scoresData.home : scoresData.away;
    const selectedOdds = isHome ? oddsData.home : oddsData.away;
    const underOverText = underOvers.length > 0 ? underOvers[0].innerText.split('🎯')[1].split('(')[0].trim() : "N/A";
    const tableHTML = `
        <div class="team-repartition-container" id="repartition-${idPrefix}">
            <h4>${teamName} - <span style="color: ${isHome ? 'blue' : 'orange'};">${isHome ? "FAVORI DOMICILE" : "FAVORI EXTERIEUR"}</span></h4>
            <table class="repartition-table score-exact-table" id="score-table-${idPrefix}">
                <tbody>
                    ${generateScoreBlock(selectedScores[0], selectedOdds[0], idPrefix, 0)}
                    ${generateScoreBlock(selectedScores[1], selectedOdds[1], idPrefix, 1)}
                </tbody>
            </table>
            <table class="repartition-table under-over-table" id="under-over-table-${idPrefix}">
                <thead>
                    <tr>
                        <th>Type de pari</th>
                        <th>Cote</th>
                        <th>Mise</th>
                        <th>Chiffre d'Affaire</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                   <tr>
                        <td><input type="text" class="under-over-cell" value="${underOverText}" readonly></td>
                        <td><input type="number" class="odds-input" placeholder="Cote Under/Over" oninput="calculateBets()"></td>
                        <td><input type="text" class="bet-input" readonly></td>
                        <td><input type="text" class="turnover-output" readonly></td>
                        <td><input type="text" class="profit-input" readonly></td>
                   </tr>
                   <tr>
                        <td colspan="5">
                            <div class="bet-status-btn-container">
                                <button class="bet-status-btn win" onclick="setBetStatus(this, 'win')">Pari Gagnant</button>
                                <button class="bet-status-btn lose" onclick="setBetStatus(this, 'lose')">Pari Perdant</button>
                            </div>
                        </td>
                   </tr>
                </tbody>
            </table>
            <div class="table-total-bet">
                Total Mise Tableau: <span class="table-total-bet-value">0.00</span>
            </div>
        </div>`;
    container.innerHTML += tableHTML;
}

function generateScoreBlock(scores, odds, idPrefix, rowIndex) {
    let blockHTML = `
        <tr>
            ${odds.map((o, i) => `<td><input type="number" class="odds-input" value="${o}" oninput="calculateBets()"></td>`).join('')}
        </tr>
        <tr>
            ${scores.map(s => `<td class="score-cell">${s}</td>`).join('')}
        </tr>
        <tr>
            ${[...Array(4)].map(() => `<td><input type="text" class="bet-input" readonly></td>`).join('')}
        </tr>
         <tr>
            ${[...Array(4)].map(() => `<td><input type="text" class="turnover-output" readonly></td>`).join('')}
        </tr>
         <tr>
            ${[...Array(4)].map(() => `<td><input type="text" class="profit-input" readonly></td>`).join('')}
        </tr>
        <tr>
            ${[...Array(4)].map((_, colIndex) => `
                <td>
                    <div class="bet-status-btn-container">
                        <button class="bet-status-btn win" onclick="setBetStatus(this, 'win')">Pari Gagnant</button>
                        <button class="bet-status-btn lose" onclick="setBetStatus(this, 'lose')">Pari Perdant</button>
                    </div>
                </td>
            `).join('')}
        </tr>`;
    return blockHTML;
}

// Calculer les mises
function calculateBets() {
    const budget = parseFloat(document.getElementById('budgetInput').value) || 0;
    const tauxNet = parseFloat(document.getElementById('tauxNetInput').value) || 0;
    const betAmount = (budget * tauxNet / 100);
    document.getElementById('totalToDistribute').value = betAmount.toFixed(2);
    const allOddsInputs = document.querySelectorAll('.odds-input');
    let validOddsCount = 0;
    allOddsInputs.forEach(input => {
        if (parseFloat(input.value) > 0) validOddsCount++;
    });
    document.getElementById('totalPronostic').value = validOddsCount;
    const miseUnitaire = validOddsCount > 0 ? (betAmount / validOddsCount) : 0;
    document.getElementById('miseUnitaire').value = miseUnitaire.toFixed(2);
    let totalStakedOverall = 0;
    document.querySelectorAll('.team-repartition-container').forEach(container => {
        const oddsInputs = container.querySelectorAll('.odds-input');
        let tableTotalBet = 0;
        oddsInputs.forEach(input => {
            if (parseFloat(input.value) > 0) {
                const cell = input.closest('td');
                const row = cell.closest('tr');
                let betInput, turnoverOutput, profitInput;
                if (row.closest('.under-over-table')) {
                    betInput = row.cells[2].querySelector('.bet-input');
                    turnoverOutput = row.cells[3].querySelector('.turnover-output');
                    profitInput = row.cells[4].querySelector('.profit-input');
                    betInput.value = miseUnitaire.toFixed(2);
                    tableTotalBet += miseUnitaire;
                    const turnover = miseUnitaire * parseFloat(input.value);
                    const profit = turnover - miseUnitaire;
                    turnoverOutput.value = turnover.toFixed(2);
                    profitInput.value = profit.toFixed(2);
                } else {
                    const cellIndex = cell.cellIndex;
                    betInput = row.nextElementSibling.nextElementSibling.cells[cellIndex].querySelector('.bet-input');
                    turnoverOutput = row.nextElementSibling.nextElementSibling.nextElementSibling.cells[cellIndex].querySelector('.turnover-output');
                    profitInput = row.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.cells[cellIndex].querySelector('.profit-input');
                    betInput.value = miseUnitaire.toFixed(2);
                    tableTotalBet += miseUnitaire;
                    const turnover = miseUnitaire * parseFloat(input.value);
                    const profit = turnover - betAmount;
                    turnoverOutput.value = turnover.toFixed(2);
                    profitInput.value = profit.toFixed(2);
                }
            }
        });
        container.querySelector('.table-total-bet-value').textContent = tableTotalBet.toFixed(2);
        totalStakedOverall += tableTotalBet;
    });
    document.getElementById('totalMisesReparties').value = totalStakedOverall.toFixed(2);
    calculateTotalProfit();
}

// Définir le statut d'un pari (gagnant/perdant)
function setBetStatus(button, status) {
    const container = button.closest('.bet-status-btn-container');
    const winBtn = container.querySelector('.win');
    const loseBtn = container.querySelector('.lose');
    if (button.classList.contains('active')) {
        button.classList.remove('active');
    } else {
        winBtn.classList.remove('active');
        loseBtn.classList.remove('active');
        button.classList.add('active');
    }
    calculateTotalProfit();
}

// Calculer le profit total
function calculateTotalProfit() {
    const activeWinButtons = document.querySelectorAll('.bet-status-btn.win.active');
    const activeLoseButtons = document.querySelectorAll('.bet-status-btn.lose.active');
    let winningBetsCount = activeWinButtons.length;
    let losingBetsCount = activeLoseButtons.length;
    document.getElementById('totalPronosticGagnant').value = winningBetsCount;
    document.getElementById('totalPronosticPerdant').value = losingBetsCount;
    const miseUnitaire = parseFloat(document.getElementById('miseUnitaire').value) || 0;
    const totalStaked = parseFloat(document.getElementById('totalMisesReparties').value) || 0;
    let totalGains = 0;
    activeWinButtons.forEach(button => {
        const table = button.closest('.repartition-table');
        const cell = button.closest('td');
        let turnoverInput;
        if (table.classList.contains('under-over-table')) {
            turnoverInput = table.querySelector('.turnover-output');
        } else {
            const cellIndex = cell.cellIndex;
            turnoverInput = cell.closest('tr').previousElementSibling.previousElementSibling.cells[cellIndex].querySelector('.turnover-output');
        }
        totalGains += parseFloat(turnoverInput.value) || 0;
    });
    document.getElementById('totalProfit').value = totalGains.toFixed(2);
    const totalMisePerdue = losingBetsCount * miseUnitaire;
    document.getElementById('totalMisePerdue').value = totalMisePerdue.toFixed(2);
    // NOUVEAU CALCUL SELON VOTRE DEMANDE
    // 1er calcul : (Total Mises Réparties - Total Mises Perdues)
    const premierCalcul = totalStaked - totalMisePerdue;
    // 2ème calcul : (résultat 1er calcul + Gains Total (Paris Gagnants))
    const chiffreAffaire = premierCalcul + totalGains;
    document.getElementById('chiffreAffaire').value = chiffreAffaire.toFixed(2);
    // 3ème calcul : (Chiffre d'affaire - Total Mises Réparties)
    const profitNetFinal = chiffreAffaire - totalStaked;
    document.getElementById('profitNetFinal').value = profitNetFinal.toFixed(2);
    const profitRateInput = document.getElementById('profitRate');
    const budget = parseFloat(document.getElementById('budgetInput').value) || 1;
    const profitRate = (profitNetFinal / budget) * 100;
    profitRateInput.value = profitRate.toFixed(2) + '%';
    profitRateInput.style.color = profitRate < 0 ? 'red' : 'green';
}

// Archiver la répartition
function archiveRepartition() {
    const date = document.getElementById('archiveDate').value;
    if (!date) return showPopup('Erreur', 'Veuillez sélectionner une date');
    const selectedIndex = document.getElementById('archivedPredictionDropdown').value;
    if (selectedIndex === '') return showPopup('Erreur', 'Veuillez sélectionner une prédiction.');
    const repartitionData = {
        date: date,
        prediction: archivedResults[selectedIndex],
        budget: document.getElementById('budgetInput').value,
        taux: document.getElementById('tauxNetInput').value,
        repartitionHTML: document.getElementById('repartition-container').innerHTML
    };
    archivedRepartitions.push(repartitionData);
    saveToLocalStorage();
    showPopup('Succès', 'Répartition archivée');
}

// Mettre à jour les statistiques des résultats
function updateResultsStats() {
    let totalWinning = 0;
    let totalLosing = 0;
    archivedRepartitions.forEach(repartition => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(repartition.repartitionHTML, 'text/html');
        const winButtons = doc.querySelectorAll('.bet-status-btn.win.active');
        totalWinning += winButtons.length;
        const loseButtons = doc.querySelectorAll('.bet-status-btn.lose.active');
        totalLosing += loseButtons.length;
    });
    document.getElementById('totalWinningPredictions').textContent = totalWinning;
    document.getElementById('totalLosingPredictions').textContent = totalLosing;
    const totalBets = totalWinning + totalLosing;
    const successRate = totalBets > 0 ? ((totalWinning / totalBets) * 100).toFixed(2) : 0;
    document.getElementById('successRate').textContent = `${successRate}%`;
}

// Afficher les détails des archives de résultats
function displayResultsArchived() {
    const index = document.getElementById('resultsArchiveDropdown').value;
    const container = document.getElementById('resultsArchivedDetails');
    if (index === '') {
        container.innerHTML = '';
        return;
    }
    const repartition = archivedRepartitions[index];
    container.innerHTML = `
        <div class="archived-repartition">
            <h3>Répartition du ${repartition.date} - ${repartition.prediction.championship}</h3>
            <div class="budget-section">
                <div class="input-group">
                    <label>Budget:</label>
                    <input type="text" value="${repartition.budget}" readonly>
                </div>
                <div class="input-group">
                    <label>Taux de répartition (%):</label>
                    <input type="text" value="${repartition.taux}" readonly>
                </div>
            </div>
            <div>${repartition.repartitionHTML}</div>
        </div>
    `;
}

// Supprimer une archive de résultats
function deleteResultsArchive() {
    const index = document.getElementById('resultsArchiveDropdown').value;
    if (index === '') {
        return showPopup('Erreur', 'Veuillez sélectionner une archive à supprimer');
    }
    archivedRepartitions.splice(index, 1);
    saveToLocalStorage();
    document.getElementById('resultsArchivedDetails').innerHTML = '';
    updateResultsArchiveDropdown();
    updateResultsStats();
    showPopup('Succès', 'Archive de résultats supprimée');
}

// Ajouter une ligne au tableau de profit/perte
function addProfitLossRow() {
    const newRow = {
        id: Date.now(),
        startDate: '',
        endDate: '',
        startBudget: '',
        endBudget: '',
        profit: 0,
        profitRate: 0
    };
    profitLossData.push(newRow);
    renderProfitLossTable();
    saveToLocalStorage();
}

// Afficher le tableau de profit/perte
function renderProfitLossTable() {
    const tableBody = document.getElementById('profitLossTableBody');
    tableBody.innerHTML = '';
    profitLossData.forEach((row, index) => {
        const tr = document.createElement('tr');
        // Numéro de ligne
        const tdNumber = document.createElement('td');
        tdNumber.className = 'row-number';
        tdNumber.textContent = index + 1;
        tr.appendChild(tdNumber);
        // Date de début
        const tdStartDate = document.createElement('td');
        const startDateInput = document.createElement('input');
        startDateInput.type = 'date';
        startDateInput.value = row.startDate;
        startDateInput.onchange = (e) => updateRowData(row.id, 'startDate', e.target.value);
        tdStartDate.appendChild(startDateInput);
        tr.appendChild(tdStartDate);
        // Date de fin
        const tdEndDate = document.createElement('td');
        const endDateInput = document.createElement('input');
        endDateInput.type = 'date';
        endDateInput.value = row.endDate;
        endDateInput.onchange = (e) => updateRowData(row.id, 'endDate', e.target.value);
        tdEndDate.appendChild(endDateInput);
        tr.appendChild(tdEndDate);
        // Budget de départ
        const tdStartBudget = document.createElement('td');
        const startBudgetInput = document.createElement('input');
        startBudgetInput.type = 'number';
        startBudgetInput.value = row.startBudget;
        startBudgetInput.min = '0';
        startBudgetInput.step = '0.01';
        startBudgetInput.onchange = (e) => updateRowData(row.id, 'startBudget', e.target.value);
        tdStartBudget.appendChild(startBudgetInput);
        tr.appendChild(tdStartBudget);
        // Budget de fin
        const tdEndBudget = document.createElement('td');
        const endBudgetInput = document.createElement('input');
        endBudgetInput.type = 'number';
        endBudgetInput.value = row.endBudget;
        endBudgetInput.min = '0';
        endBudgetInput.step = '0.01';
        endBudgetInput.onchange = (e) => updateRowData(row.id, 'endBudget', e.target.value);
        tdEndBudget.appendChild(endBudgetInput);
        tr.appendChild(tdEndBudget);
        // Profit (calculé automatiquement)
        const tdProfit = document.createElement('td');
        const profitInput = document.createElement('input');
        profitInput.type = 'text';
        profitInput.value = row.profit.toFixed(2);
        profitInput.className = 'readonly-cell';
        profitInput.readOnly = true;
        tdProfit.appendChild(profitInput);
        tr.appendChild(tdProfit);
        // Taux de profit (calculé automatiquement)
        const tdProfitRate = document.createElement('td');
        const profitRateInput = document.createElement('input');
        profitRateInput.type = 'text';
        profitRateInput.value = row.profitRate.toFixed(2) + '%';
        profitRateInput.className = 'readonly-cell';
        profitRateInput.readOnly = true;
        tdProfitRate.appendChild(profitRateInput);
        tr.appendChild(tdProfitRate);
        tableBody.appendChild(tr);
    });
    updateProfitCalculations();
}

// Mettre à jour les données d'une ligne
function updateRowData(rowId, field, value) {
    const row = profitLossData.find(r => r.id === rowId);
    if (row) {
        row[field] = value;
        // Recalculer le profit et le taux de profit si les budgets changent
        if (field === 'startBudget' || field === 'endBudget') {
            const startBudget = parseFloat(row.startBudget) || 0;
            const endBudget = parseFloat(row.endBudget) || 0;
            row.profit = endBudget - startBudget;
            if (startBudget > 0) {
                row.profitRate = (row.profit / startBudget) * 100;
            } else {
                row.profitRate = 0;
            }
        }
        renderProfitLossTable();
        saveToLocalStorage();
    }
}

// Mettre à jour les calculs de profit
function updateProfitCalculations() {
    const totalProfit = profitLossData.reduce((sum, row) => sum + (parseFloat(row.profit) || 0), 0);
    document.getElementById('totalProfitValue').textContent = totalProfit.toFixed(2) + ' USDT';
    const initialCapital = parseFloat(document.getElementById('initialCapital').value) || 300;
    const profitRate = initialCapital > 0 ? (totalProfit / initialCapital) * 100 : 0;
    document.getElementById('profitRateValue').textContent = profitRate.toFixed(2) + '%';
    saveToLocalStorage();
}

// Supprimer les données de profit/perte
function clearProfitLossData() {
    profitLossData = [];
    document.getElementById('initialCapital').value = '300';
    renderProfitLossTable();
    updateProfitCalculations();
    saveToLocalStorage();
    showPopup('Succès', 'Données saisies supprimées');
}

// Afficher les archives générales
function displayGeneralArchivedResults() {
    const value = document.getElementById('generalArchivesDropdown').value;
    const container = document.getElementById('generalArchivedResults');
    updateDeleteButtonState();
    if (value === '') {
        container.innerHTML = '';
        return;
    }
    const [type, index] = value.split('-');
    if (type === 'prediction') {
        const archive = archivedResults[index];
        container.innerHTML = `
            <div class="general-archive-item">
                <div class="general-archive-header">
                    <div class="general-archive-title">Prédiction - ${archive.championship}</div>
                    <div class="general-archive-date">${archive.date}</div>
                </div>
                <div class="general-archive-content">
                    ${archive.results}
                </div>
            </div>
        `;
    } else if (type === 'repartition') {
        const archive = archivedRepartitions[index];
        container.innerHTML = `
            <div class="general-archive-item">
                <div class="general-archive-header">
                    <div class="general-archive-title">Répartition - ${archive.prediction.championship}</div>
                    <div class="general-archive-date">${archive.date}</div>
                </div>
                <div class="general-archive-content">
                    <div class="budget-section">
                        <div class="input-group">
                            <label>Budget:</label>
                            <input type="text" value="${archive.budget}" readonly>
                        </div>
                        <div class="input-group">
                            <label>Taux de répartition (%):</label>
                            <input type="text" value="${archive.taux}" readonly>
                        </div>
                    </div>
                    ${archive.repartitionHTML}
                </div>
            </div>
        `;
    }
}

// Supprimer une archive générale
function deleteGeneralArchive() {
    const value = document.getElementById('generalArchivesDropdown').value;
    if (value === '') {
        return showPopup('Erreur', 'Veuillez sélectionner une archive à supprimer');
    }
    const [type, index] = value.split('-');
    if (type === 'prediction') {
        archivedResults.splice(index, 1);
        showPopup('Succès', 'Archive de prédiction supprimée');
    } else if (type === 'repartition') {
        archivedRepartitions.splice(index, 1);
        showPopup('Succès', 'Archive de répartition supprimée');
    }
    saveToLocalStorage();
    updateGeneralArchivesDropdown();
    document.getElementById('generalArchivedResults').innerHTML = '';
}

// Initialiser l'application
window.onload = function() {
    // Ajouter une ligne vide si aucune donnée n'existe
    if (profitLossData.length === 0) {
        addProfitLossRow();
    }
    // Charger les utilisateurs
    loadFromLocalStorage();
};