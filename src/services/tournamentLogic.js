/**
 * @file tournamentLogic.js
 * @description Logica di generazione e avanzamento per tornei a piazzamento completo (non a eliminazione diretta).
 * Permette a tutte le 8 squadre di giocare lo stesso numero di partite (Quarti, Semifinali, Finali)
 * determinando le posizioni esatte dal 1º all'8º posto e i relativi punteggi.
 */

// Punteggi assegnati per ciascuna posizione finale
export const DEFAULT_POINTS_MAP = {
  1: 8,
  2: 7,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

/**
 * Inizializza la struttura dei match per una disciplina dati gli 8 nomi delle squadre.
 * @param {Array<string>} couples - Lista di 8 coppie
 * @returns {Object} Struttura contenente i match organizzati per fase
 */
export function createInitialTournamentState(couples = []) {
  // Se non ci sono 8 coppie, riempiamo con segnaposto
  const teams = [...couples];
  while (teams.length < 8) {
    teams.push(`Coppia ${teams.length + 1}`);
  }

  return {
    // Turno 1: Quarti di finale (Main)
    quarters: [
      { id: 'Q1', team1: teams[0], team2: teams[1], winner: null, loser: null },
      { id: 'Q2', team1: teams[2], team2: teams[3], winner: null, loser: null },
      { id: 'Q3', team1: teams[4], team2: teams[5], winner: null, loser: null },
      { id: 'Q4', team1: teams[6], team2: teams[7], winner: null, loser: null },
    ],
    // Turno 2: Semifinali
    semis: {
      // Per i posti 1º-4º
      main: [
        { id: 'SM1', team1: '', team2: '', winner: null, loser: null },
        { id: 'SM2', team1: '', team2: '', winner: null, loser: null },
      ],
      // Per i posti 5º-8º (Consolation)
      consolation: [
        { id: 'SC1', team1: '', team2: '', winner: null, loser: null },
        { id: 'SC2', team1: '', team2: '', winner: null, loser: null },
      ],
    },
    // Turno 3: Finali di posizione
    finals: [
      { id: 'F1', title: 'Finale 1º - 2º Posto', team1: '', team2: '', winner: null, loser: null, positions: [1, 2] },
      { id: 'F2', title: 'Finale 3º - 4º Posto', team1: '', team2: '', winner: null, loser: null, positions: [3, 4] },
      { id: 'F3', title: 'Finale 5º - 6º Posto', team1: '', team2: '', winner: null, loser: null, positions: [5, 6] },
      { id: 'F4', title: 'Finale 7º - 8º Posto', team1: '', team2: '', winner: null, loser: null, positions: [7, 8] },
    ],
    // Classifica calcolata
    standings: {},
  };
}

/**
 * Aggiorna il vincitore di un match e fa avanzare automaticamente le squadre nei turni successivi.
 * @param {Object} tournamentState - Stato corrente del torneo
 * @param {string} matchId - ID del match modificato (es: 'Q1', 'SM1', 'F1')
 * @param {string} winnerTeam - Nome della squadra vincente
 * @returns {Object} Nuovo stato aggiornato del torneo
 */
export function setMatchWinner(tournamentState, matchId, winnerTeam) {
  // Deep clone dello stato per immutabilità
  const state = JSON.parse(JSON.stringify(tournamentState));

  // 1. Cerca il match nei quarti
  const quarter = state.quarters.find((m) => m.id === matchId);
  if (quarter) {
    if (winnerTeam !== quarter.team1 && winnerTeam !== quarter.team2) return state;
    quarter.winner = winnerTeam;
    quarter.loser = winnerTeam === quarter.team1 ? quarter.team2 : quarter.team1;
  }

  // Cerca nelle semifinali main
  const smMatch = state.semis.main.find((m) => m.id === matchId);
  if (smMatch && (winnerTeam === smMatch.team1 || winnerTeam === smMatch.team2)) {
    smMatch.winner = winnerTeam;
    smMatch.loser = winnerTeam === smMatch.team1 ? smMatch.team2 : smMatch.team1;
  }

  // Cerca nelle semifinali consolation
  const scMatch = state.semis.consolation.find((m) => m.id === matchId);
  if (scMatch && (winnerTeam === scMatch.team1 || winnerTeam === scMatch.team2)) {
    scMatch.winner = winnerTeam;
    scMatch.loser = winnerTeam === scMatch.team1 ? scMatch.team2 : scMatch.team1;
  }

  // Cerca nelle finali
  const finalMatch = state.finals.find((m) => m.id === matchId);
  if (finalMatch && (winnerTeam === finalMatch.team1 || winnerTeam === finalMatch.team2)) {
    finalMatch.winner = winnerTeam;
    finalMatch.loser = winnerTeam === finalMatch.team1 ? finalMatch.team2 : finalMatch.team1;
  }

  // 2. Propaga le vincenti/perdenti dei Quarti alle Semifinali
  // SM1 = Vin. Q1 vs Vin. Q2; SC1 = Per. Q1 vs Per. Q2
  const q1 = state.quarters[0];
  const q2 = state.quarters[1];
  const q3 = state.quarters[2];
  const q4 = state.quarters[3];

  state.semis.main[0].team1 = q1.winner || '';
  state.semis.main[0].team2 = q2.winner || '';
  state.semis.consolation[0].team1 = q1.loser || '';
  state.semis.consolation[0].team2 = q2.loser || '';

  // SM2 = Vin. Q3 vs Vin. Q4; SC2 = Per. Q3 vs Per. Q4
  state.semis.main[1].team1 = q3.winner || '';
  state.semis.main[1].team2 = q4.winner || '';
  state.semis.consolation[1].team1 = q3.loser || '';
  state.semis.consolation[1].team2 = q4.loser || '';

  // 3. Propaga dalle Semifinali alle Finali
  const sm1 = state.semis.main[0];
  const sm2 = state.semis.main[1];
  const sc1 = state.semis.consolation[0];
  const sc2 = state.semis.consolation[1];

  // Finale 1º-2º: Vin SM1 vs Vin SM2
  state.finals[0].team1 = sm1.winner || '';
  state.finals[0].team2 = sm2.winner || '';

  // Finale 3º-4º: Per SM1 vs Per SM2
  state.finals[1].team1 = sm1.loser || '';
  state.finals[1].team2 = sm2.loser || '';

  // Finale 5º-6º: Vin SC1 vs Vin SC2
  state.finals[2].team1 = sc1.winner || '';
  state.finals[2].team2 = sc2.winner || '';

  // Finale 7º-8º: Per SC1 vs Per SC2
  state.finals[3].team1 = sc1.loser || '';
  state.finals[3].team2 = sc2.loser || '';

  // Reset dei vincitori delle finali se le squadre sono cambiate
  state.finals.forEach((f) => {
    if (f.winner && f.winner !== f.team1 && f.winner !== f.team2) {
      f.winner = null;
      f.loser = null;
    }
  });

  // 4. Ricalcola le posizioni finali
  state.standings = calculateStandings(state);

  return state;
}

/**
 * Calcola i piazzamenti e i punti per una singola disciplina.
 * @param {Object} state - Stato del torneo
 * @returns {Object} Oggetto con le posizioni e i punti per ciascuna coppia
 */
export function calculateStandings(state) {
  const standings = {};

  const f1 = state.finals[0];
  const f2 = state.finals[1];
  const f3 = state.finals[2];
  const f4 = state.finals[3];

  if (f1 && f1.winner) {
    standings[f1.winner] = { rank: 1, points: DEFAULT_POINTS_MAP[1] };
    if (f1.loser) standings[f1.loser] = { rank: 2, points: DEFAULT_POINTS_MAP[2] };
  }
  if (f2 && f2.winner) {
    standings[f2.winner] = { rank: 3, points: DEFAULT_POINTS_MAP[3] };
    if (f2.loser) standings[f2.loser] = { rank: 4, points: DEFAULT_POINTS_MAP[4] };
  }
  if (f3 && f3.winner) {
    standings[f3.winner] = { rank: 5, points: DEFAULT_POINTS_MAP[5] };
    if (f3.loser) standings[f3.loser] = { rank: 6, points: DEFAULT_POINTS_MAP[6] };
  }
  if (f4 && f4.winner) {
    standings[f4.winner] = { rank: 7, points: DEFAULT_POINTS_MAP[7] };
    if (f4.loser) standings[f4.loser] = { rank: 8, points: DEFAULT_POINTS_MAP[8] };
  }

  return standings;
}

/**
 * Calcola la classifica generale sommando i punti di tutti gli sport.
 * @param {Object} sportsData - Oggetto contenente lo stato del torneo per ogni disciplina
 * @param {Array<string>} couples - Lista delle coppie
 * @returns {Array<Object>} Lista ordinata della classifica generale
 */
export function calculateOverallLeaderboard(sportsData = {}, couples = []) {
  const leaderboardMap = {};

  // Inizializza tutte le coppie a 0 punti
  couples.forEach((c) => {
    leaderboardMap[c] = {
      couple: c,
      totalPoints: 0,
      breakdown: {},
    };
  });

  // Somma i punti di ogni disciplina
  Object.entries(sportsData).forEach(([sportName, tournamentState]) => {
    if (!tournamentState || !tournamentState.standings) return;
    Object.entries(tournamentState.standings).forEach(([team, info]) => {
      if (!leaderboardMap[team]) {
        leaderboardMap[team] = { couple: team, totalPoints: 0, breakdown: {} };
      }
      leaderboardMap[team].totalPoints += info.points || 0;
      leaderboardMap[team].breakdown[sportName] = info.points || 0;
    });
  });

  // Converte in array e ordina decrescente per punti
  return Object.values(leaderboardMap).sort((a, b) => b.totalPoints - a.totalPoints);
}
