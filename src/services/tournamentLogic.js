/**
 * @file tournamentLogic.js
 * @description Logica di generazione e avanzamento per tornei a piazzamento completo.
 * Supporta l'assegnazione e l'annullamento singolo/totale delle vittorie per ogni sport.
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
 * Algoritmo di mescolamento casuale Fisher-Yates
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Inizializza la struttura dei match per una disciplina dati gli 8 nomi delle squadre.
 */
export function createInitialTournamentState(couples = [], randomize = true) {
  let teams = [...couples];
  while (teams.length < 8) {
    teams.push(`Coppia ${teams.length + 1}`);
  }

  if (randomize && teams.length >= 2) {
    teams = shuffleArray(teams);
  }

  return {
    quarters: [
      { id: 'Q1', team1: teams[0], team2: teams[1], winner: null, loser: null },
      { id: 'Q2', team1: teams[2], team2: teams[3], winner: null, loser: null },
      { id: 'Q3', team1: teams[4], team2: teams[5], winner: null, loser: null },
      { id: 'Q4', team1: teams[6], team2: teams[7], winner: null, loser: null },
    ],
    semis: {
      main: [
        { id: 'SM1', team1: '', team2: '', winner: null, loser: null },
        { id: 'SM2', team1: '', team2: '', winner: null, loser: null },
      ],
      consolation: [
        { id: 'SC1', team1: '', team2: '', winner: null, loser: null },
        { id: 'SC2', team1: '', team2: '', winner: null, loser: null },
      ],
    },
    finals: [
      { id: 'F1', title: 'Finale 1º - 2º Posto', team1: '', team2: '', winner: null, loser: null, positions: [1, 2] },
      { id: 'F2', title: 'Finale 3º - 4º Posto', team1: '', team2: '', winner: null, loser: null, positions: [3, 4] },
      { id: 'F3', title: 'Finale 5º - 6º Posto', team1: '', team2: '', winner: null, loser: null, positions: [5, 6] },
      { id: 'F4', title: 'Finale 7º - 8º Posto', team1: '', team2: '', winner: null, loser: null, positions: [7, 8] },
    ],
    standings: {},
  };
}

/**
 * Verifica se è già stato segnato almeno un vincitore nel torneo della disciplina.
 */
export function hasAnyWinner(sportData) {
  if (!sportData) return false;
  const quarters = sportData.quarters || [];
  const semisMain = sportData.semis?.main || [];
  const semisCons = sportData.semis?.consolation || [];
  const finals = sportData.finals || [];

  return (
    quarters.some((m) => m.winner) ||
    semisMain.some((m) => m.winner) ||
    semisCons.some((m) => m.winner) ||
    finals.some((m) => m.winner)
  );
}

/**
 * Resetta tutte le vittorie registrate per un singolo torneo mantenendo le sfide dei Quarti.
 */
export function resetSportVictories(tournamentState) {
  const state = JSON.parse(JSON.stringify(tournamentState));

  state.quarters.forEach((m) => { m.winner = null; m.loser = null; });
  state.semis.main.forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; });
  state.semis.consolation.forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; });
  state.finals.forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; });
  state.standings = {};

  return state;
}

/**
 * Resetta e rimescola le sfide dei Quarti di Finale per una specifica disciplina (Admin Action).
 */
export function reshuffleSportBracket(couples = []) {
  return createInitialTournamentState(couples, true);
}

/**
 * Aggiorna o annulla il vincitore di un match e fa avanzare/arretrare le squadre.
 * Se winnerTeam è null o vuoto, annulla la vittoria del match specificato.
 */
export function setMatchWinner(tournamentState, matchId, winnerTeam) {
  const state = JSON.parse(JSON.stringify(tournamentState));

  // Cerca il match in tutti i turni
  const allMatches = [
    ...state.quarters,
    ...state.semis.main,
    ...state.semis.consolation,
    ...state.finals,
  ];

  const targetMatch = allMatches.find((m) => m.id === matchId);
  if (targetMatch) {
    if (!winnerTeam) {
      // Annullamento della vittoria singola
      targetMatch.winner = null;
      targetMatch.loser = null;
    } else {
      if (winnerTeam === targetMatch.team1 || winnerTeam === targetMatch.team2) {
        targetMatch.winner = winnerTeam;
        targetMatch.loser = winnerTeam === targetMatch.team1 ? targetMatch.team2 : targetMatch.team1;
      }
    }
  }

  // 2. Propaga le vincenti/perdenti dei Quarti alle Semifinali
  const q1 = state.quarters[0];
  const q2 = state.quarters[1];
  const q3 = state.quarters[2];
  const q4 = state.quarters[3];

  state.semis.main[0].team1 = q1.winner || '';
  state.semis.main[0].team2 = q2.winner || '';
  state.semis.consolation[0].team1 = q1.loser || '';
  state.semis.consolation[0].team2 = q2.loser || '';

  state.semis.main[1].team1 = q3.winner || '';
  state.semis.main[1].team2 = q4.winner || '';
  state.semis.consolation[1].team1 = q3.loser || '';
  state.semis.consolation[1].team2 = q4.loser || '';

  // Clean-up semifinali se le squadre sono cambiate/svuotate
  state.semis.main.concat(state.semis.consolation).forEach((m) => {
    if (m.winner && m.winner !== m.team1 && m.winner !== m.team2) {
      m.winner = null;
      m.loser = null;
    }
  });

  // 3. Propaga dalle Semifinali alle Finali
  const sm1 = state.semis.main[0];
  const sm2 = state.semis.main[1];
  const sc1 = state.semis.consolation[0];
  const sc2 = state.semis.consolation[1];

  state.finals[0].team1 = sm1.winner || '';
  state.finals[0].team2 = sm2.winner || '';

  state.finals[1].team1 = sm1.loser || '';
  state.finals[1].team2 = sm2.loser || '';

  state.finals[2].team1 = sc1.winner || '';
  state.finals[2].team2 = sc2.winner || '';

  state.finals[3].team1 = sc1.loser || '';
  state.finals[3].team2 = sc2.loser || '';

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

export function calculateOverallLeaderboard(sportsData = {}, couples = []) {
  const leaderboardMap = {};

  couples.forEach((c) => {
    leaderboardMap[c] = {
      couple: c,
      totalPoints: 0,
      breakdown: {},
    };
  });

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

  return Object.values(leaderboardMap).sort((a, b) => b.totalPoints - a.totalPoints);
}
