/**
 * @file tournamentLogic.js
 * @description Logica di generazione e avanzamento per tornei Familimpiadi.
 * Supporta:
 * - Punteggi e Differenza Reti/Punti per ogni partita.
 * - Ridenominazione sicura delle squadre senza rimescolare i match esistenti.
 * - Edizione 2026 a 6 Squadre (3 Sfide Iniziali + 2 Triangolari Scudetto/Consolazione con spareggi e diff punti).
 * - Edizione Storica 2025 a 8 Squadre (Quarti, Semifinali, Finali piazzamento 1º-8º).
 */

export const OFFICIAL_2026_COUPLES = [
  "Luca & Cleide",
  "Kevin & Margherita",
  "Savannah & Sabrina & Riccardo",
  "Simona & Alessio & Corrado",
  "Susy & Eloise & Alice",
  "Malaika & Naima"
];

// Punteggi per torneo a 6 squadre (2026)
export const POINTS_MAP_6_TEAMS = {
  1: 6,
  2: 5,
  3: 4,
  4: 3,
  5: 2,
  6: 1,
};

// Punteggi per torneo a 8 squadre (storico 2025)
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
 * Inizializza la struttura dei match per una disciplina.
 */
export function createInitialTournamentState(couples = [], randomize = false) {
  const is6Teams = couples.length <= 6;

  if (is6Teams) {
    let teams = [...couples];

    // Se non vengono passate squadre o sono generiche, usa le 6 squadre ufficiali
    if (teams.length === 0 || teams.every((t) => !t || t.startsWith('Squadra ') || t.startsWith('Coppia '))) {
      teams = [...OFFICIAL_2026_COUPLES];
    }

    while (teams.length < 6) {
      teams.push(OFFICIAL_2026_COUPLES[teams.length] || `Squadra ${teams.length + 1}`);
    }

    if (randomize && teams.length >= 2) {
      teams = shuffleArray(teams);
    }

    return {
      format: '6-teams',
      // Fase 1: 3 Sfide Iniziali
      initialMatches: [
        { id: 'M1', title: 'Sfida Iniziale 1', team1: teams[0], team2: teams[1], score1: null, score2: null, winner: null, loser: null },
        { id: 'M2', title: 'Sfida Iniziale 2', team1: teams[2], team2: teams[3], score1: null, score2: null, winner: null, loser: null },
        { id: 'M3', title: 'Sfida Iniziale 3', team1: teams[4], team2: teams[5], score1: null, score2: null, winner: null, loser: null },
      ],
      // Fase 2: Triangolare Scudetto (1º - 3º Posto)
      triangolareScudetto: {
        id: 'TS',
        title: 'Triangolare Scudetto (1º – 3º Posto)',
        teams: ['', '', ''],
        matches: [
          { id: 'TS1', title: 'Scudetto 1', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
          { id: 'TS2', title: 'Scudetto 2', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
          { id: 'TS3', title: 'Scudetto 3', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
        ],
        standings: {},
        manualRanking: null,
      },
      // Fase 2: Triangolare Consolazione (4º - 6º Posto)
      triangolareConsolazione: {
        id: 'TC',
        title: 'Triangolare Consolazione (4º – 6º Posto)',
        teams: ['', '', ''],
        matches: [
          { id: 'TC1', title: 'Consolazione 1', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
          { id: 'TC2', title: 'Consolazione 2', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
          { id: 'TC3', title: 'Consolazione 3', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
        ],
        standings: {},
        manualRanking: null,
      },
      standings: {},
    };
  }

  // Formato a 8 squadre (per archivio 2025 o tornei a 8)
  let teams = [...couples];
  while (teams.length < 8) {
    teams.push(`Coppia ${teams.length + 1}`);
  }

  if (randomize && teams.length >= 2) {
    teams = shuffleArray(teams);
  }

  return {
    format: '8-teams',
    quarters: [
      { id: 'Q1', team1: teams[0], team2: teams[1], score1: null, score2: null, winner: null, loser: null },
      { id: 'Q2', team1: teams[2], team2: teams[3], score1: null, score2: null, winner: null, loser: null },
      { id: 'Q3', team1: teams[4], team2: teams[5], score1: null, score2: null, winner: null, loser: null },
      { id: 'Q4', team1: teams[6], team2: teams[7], score1: null, score2: null, winner: null, loser: null },
    ],
    semis: {
      main: [
        { id: 'SM1', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
        { id: 'SM2', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
      ],
      consolation: [
        { id: 'SC1', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
        { id: 'SC2', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null },
      ],
    },
    finals: [
      { id: 'F1', title: 'Finale 1º - 2º Posto', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null, positions: [1, 2] },
      { id: 'F2', title: 'Finale 3º - 4º Posto', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null, positions: [3, 4] },
      { id: 'F3', title: 'Finale 5º - 6º Posto', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null, positions: [5, 6] },
      { id: 'F4', title: 'Finale 7º - 8º Posto', team1: '', team2: '', score1: null, score2: null, winner: null, loser: null, positions: [7, 8] },
    ],
    standings: {},
  };
}

/**
 * Aggiorna i nomi delle squadre in tutti i match dei tornei esistenti
 * senza toccare né rimescolare gli accoppiamenti delle partite!
 */
export function renameTeamsInSportsData(sportsData = {}, oldCouples = [], newCouples = []) {
  if (!sportsData) return {};

  const renameMap = {};
  oldCouples.forEach((oldName, idx) => {
    const newName = newCouples[idx];
    if (oldName && newName && oldName !== newName) {
      renameMap[oldName] = newName;
    }
  });

  // Mappa anche i placeholder generici
  for (let i = 0; i < 6; i++) {
    if (newCouples[i]) {
      renameMap[`Squadra ${i + 1}`] = newCouples[i];
      renameMap[`Coppia ${i + 1}`] = newCouples[i];
    }
  }

  const updatedSportsData = JSON.parse(JSON.stringify(sportsData));

  const replaceName = (name) => {
    if (!name) return name;
    return renameMap[name] || name;
  };

  Object.entries(updatedSportsData).forEach(([sportName, sportState]) => {
    if (!sportState) return;

    // 6-teams format
    if (sportState.initialMatches) {
      sportState.initialMatches.forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
    }

    if (sportState.triangolareScudetto) {
      sportState.triangolareScudetto.teams = (sportState.triangolareScudetto.teams || []).map(replaceName);
      (sportState.triangolareScudetto.matches || []).forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
      if (Array.isArray(sportState.triangolareScudetto.manualRanking)) {
        sportState.triangolareScudetto.manualRanking = sportState.triangolareScudetto.manualRanking.map(replaceName);
      }
      if (sportState.triangolareScudetto.standings) {
        const newStandings = {};
        Object.entries(sportState.triangolareScudetto.standings).forEach(([team, info]) => {
          newStandings[replaceName(team)] = info;
        });
        sportState.triangolareScudetto.standings = newStandings;
      }
    }

    if (sportState.triangolareConsolazione) {
      sportState.triangolareConsolazione.teams = (sportState.triangolareConsolazione.teams || []).map(replaceName);
      (sportState.triangolareConsolazione.matches || []).forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
      if (Array.isArray(sportState.triangolareConsolazione.manualRanking)) {
        sportState.triangolareConsolazione.manualRanking = sportState.triangolareConsolazione.manualRanking.map(replaceName);
      }
      if (sportState.triangolareConsolazione.standings) {
        const newStandings = {};
        Object.entries(sportState.triangolareConsolazione.standings).forEach(([team, info]) => {
          newStandings[replaceName(team)] = info;
        });
        sportState.triangolareConsolazione.standings = newStandings;
      }
    }

    // 8-teams format (2025)
    if (sportState.quarters) {
      sportState.quarters.forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
      (sportState.semis?.main || []).forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
      (sportState.semis?.consolation || []).forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
      (sportState.finals || []).forEach((m) => {
        m.team1 = replaceName(m.team1);
        m.team2 = replaceName(m.team2);
        m.winner = replaceName(m.winner);
        m.loser = replaceName(m.loser);
      });
    }

    if (sportState.standings) {
      const newStandings = {};
      Object.entries(sportState.standings).forEach(([team, info]) => {
        newStandings[replaceName(team)] = info;
      });
      sportState.standings = newStandings;
    }
  });

  return updatedSportsData;
}

/**
 * Verifica se è già stato registrato almeno un risultato o punteggio nel torneo.
 */
export function hasAnyWinner(sportData) {
  if (!sportData) return false;

  if (sportData.format === '6-teams' || sportData.initialMatches) {
    const initMatches = sportData.initialMatches || [];
    const tsMatches = sportData.triangolareScudetto?.matches || [];
    const tcMatches = sportData.triangolareConsolazione?.matches || [];
    return (
      initMatches.some((m) => m.winner || m.score1 !== null || m.score2 !== null) ||
      tsMatches.some((m) => m.winner || m.score1 !== null || m.score2 !== null) ||
      tcMatches.some((m) => m.winner || m.score1 !== null || m.score2 !== null)
    );
  }

  const quarters = sportData.quarters || [];
  const semisMain = sportData.semis?.main || [];
  const semisCons = sportData.semis?.consolation || [];
  const finals = sportData.finals || [];

  return (
    quarters.some((m) => m.winner || m.score1 !== null || m.score2 !== null) ||
    semisMain.some((m) => m.winner || m.score1 !== null || m.score2 !== null) ||
    semisCons.some((m) => m.winner || m.score1 !== null || m.score2 !== null) ||
    finals.some((m) => m.winner || m.score1 !== null || m.score2 !== null)
  );
}

/**
 * Resetta tutti i risultati e punteggi di una disciplina mantenendo le squadre iniziali.
 */
export function resetSportVictories(tournamentState) {
  const state = JSON.parse(JSON.stringify(tournamentState));

  if (state.format === '6-teams' || state.initialMatches) {
    (state.initialMatches || []).forEach((m) => {
      m.winner = null;
      m.loser = null;
      m.score1 = null;
      m.score2 = null;
    });
    if (state.triangolareScudetto) {
      state.triangolareScudetto.teams = ['', '', ''];
      (state.triangolareScudetto.matches || []).forEach((m) => {
        m.team1 = '';
        m.team2 = '';
        m.winner = null;
        m.loser = null;
        m.score1 = null;
        m.score2 = null;
      });
      state.triangolareScudetto.standings = {};
      state.triangolareScudetto.manualRanking = null;
    }
    if (state.triangolareConsolazione) {
      state.triangolareConsolazione.teams = ['', '', ''];
      (state.triangolareConsolazione.matches || []).forEach((m) => {
        m.team1 = '';
        m.team2 = '';
        m.winner = null;
        m.loser = null;
        m.score1 = null;
        m.score2 = null;
      });
      state.triangolareConsolazione.standings = {};
      state.triangolareConsolazione.manualRanking = null;
    }
    state.standings = {};
    return state;
  }

  (state.quarters || []).forEach((m) => { m.winner = null; m.loser = null; m.score1 = null; m.score2 = null; });
  (state.semis?.main || []).forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; m.score1 = null; m.score2 = null; });
  (state.semis?.consolation || []).forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; m.score1 = null; m.score2 = null; });
  (state.finals || []).forEach((m) => { m.team1 = ''; m.team2 = ''; m.winner = null; m.loser = null; m.score1 = null; m.score2 = null; });
  state.standings = {};

  return state;
}

/**
 * Resetta e rimescola le sfide iniziali per una disciplina (Admin Action).
 */
export function reshuffleSportBracket(couples = []) {
  return createInitialTournamentState(couples, true);
}

/**
 * Calcola la classifica interna di un triangolare (girone a 3 squadre).
 * Calcola vittorie, punti fatti (GF), punti subiti (GS) e differenza punti (Diff).
 * Ordina per: 1) Vittorie, 2) Differenza Punti, 3) Punti Fatti.
 */
export function calculateTriangolareStandings(triangolare, baseRank = 1) {
  const standings = {};
  const teams = (triangolare.teams || []).filter((t) => t && t.trim() !== '');
  const matches = triangolare.matches || [];

  if (teams.length < 3) {
    return standings;
  }

  // Statistiche per ciascuna squadra
  const stats = {};
  teams.forEach((t) => {
    stats[t] = { wins: 0, gf: 0, gs: 0, diff: 0 };
  });

  let completedMatches = 0;
  matches.forEach((m) => {
    if (m.winner && stats[m.winner] !== undefined) {
      stats[m.winner].wins++;
      completedMatches++;
    }

    // Punti segnati
    if (m.team1 && m.team2 && stats[m.team1] && stats[m.team2]) {
      const s1 = typeof m.score1 === 'number' ? m.score1 : parseInt(m.score1, 10);
      const s2 = typeof m.score2 === 'number' ? m.score2 : parseInt(m.score2, 10);

      if (!isNaN(s1) && !isNaN(s2)) {
        stats[m.team1].gf += s1;
        stats[m.team1].gs += s2;
        stats[m.team1].diff = stats[m.team1].gf - stats[m.team1].gs;

        stats[m.team2].gf += s2;
        stats[m.team2].gs += s1;
        stats[m.team2].diff = stats[m.team2].gf - stats[m.team2].gs;
      }
    }
  });

  // Se è stato impostato un ordine di spareggio manuale da parte dell'Admin
  if (Array.isArray(triangolare.manualRanking) && triangolare.manualRanking.length === 3) {
    triangolare.manualRanking.forEach((team, idx) => {
      const rank = baseRank + idx;
      const points = POINTS_MAP_6_TEAMS[rank] || 0;
      standings[team] = {
        rank,
        points,
        wins: stats[team]?.wins || 0,
        gf: stats[team]?.gf || 0,
        gs: stats[team]?.gs || 0,
        diff: stats[team]?.diff || 0,
        completed: completedMatches === 3,
        isManual: true,
      };
    });
    return standings;
  }

  // Ordina per: 1) Vittorie, 2) Differenza Reti/Punti, 3) Punti Fatti (GF)
  const sortedTeams = [...teams].sort((a, b) => {
    if (stats[b].wins !== stats[a].wins) {
      return stats[b].wins - stats[a].wins;
    }
    if (stats[b].diff !== stats[a].diff) {
      return stats[b].diff - stats[a].diff;
    }
    return stats[b].gf - stats[a].gf;
  });

  // Controlla se c'è parità perfetta anche dopo la differenza punti
  const isTie =
    completedMatches === 3 &&
    stats[sortedTeams[0]].wins === stats[sortedTeams[2]].wins &&
    stats[sortedTeams[0]].diff === stats[sortedTeams[2]].diff &&
    stats[sortedTeams[0]].gf === stats[sortedTeams[2]].gf;

  sortedTeams.forEach((team, idx) => {
    const rank = baseRank + idx;
    const points = POINTS_MAP_6_TEAMS[rank] || 0;
    standings[team] = {
      rank,
      points,
      wins: stats[team]?.wins || 0,
      gf: stats[team]?.gf || 0,
      gs: stats[team]?.gs || 0,
      diff: stats[team]?.diff || 0,
      completed: completedMatches === 3,
      isTie,
    };
  });

  return standings;
}

/**
 * Imposta l'ordine manuale di arrivo / spareggio per un triangolare (Admin Action)
 */
export function setTriangolareTiebreakOrder(tournamentState, triangolareKey, orderedTeams) {
  const state = JSON.parse(JSON.stringify(tournamentState));
  if (state[triangolareKey]) {
    state[triangolareKey].manualRanking = orderedTeams;
    const baseRank = triangolareKey === 'triangolareScudetto' ? 1 : 4;
    state[triangolareKey].standings = calculateTriangolareStandings(state[triangolareKey], baseRank);

    state.standings = {
      ...(state.triangolareScudetto?.standings || {}),
      ...(state.triangolareConsolazione?.standings || {}),
    };
  }
  return state;
}

/**
 * Imposta i punteggi numerici di un match e determina il vincitore se applicabile.
 */
export function setMatchScores(tournamentState, matchId, score1, score2) {
  const state = JSON.parse(JSON.stringify(tournamentState));

  const num1 = score1 === '' || score1 === null || score1 === undefined ? null : parseInt(score1, 10);
  const num2 = score2 === '' || score2 === null || score2 === undefined ? null : parseInt(score2, 10);

  const findAndSet = (m) => {
    if (m.id === matchId) {
      m.score1 = num1;
      m.score2 = num2;

      if (num1 !== null && num2 !== null && !isNaN(num1) && !isNaN(num2)) {
        if (num1 > num2 && m.team1) {
          m.winner = m.team1;
          m.loser = m.team2;
        } else if (num2 > num1 && m.team2) {
          m.winner = m.team2;
          m.loser = m.team1;
        }
      }
      return true;
    }
    return false;
  };

  if (state.format === '6-teams' || state.initialMatches) {
    state.initialMatches?.forEach(findAndSet);
    state.triangolareScudetto?.matches?.forEach(findAndSet);
    state.triangolareConsolazione?.matches?.forEach(findAndSet);

    return propagate6TeamsState(state);
  }

  // 8 teams
  state.quarters?.forEach(findAndSet);
  state.semis?.main?.forEach(findAndSet);
  state.semis?.consolation?.forEach(findAndSet);
  state.finals?.forEach(findAndSet);

  return propagate8TeamsState(state);
}

/**
 * Helper di propagazione risultati per torneo a 6 squadre
 */
function propagate6TeamsState(state) {
  const m1 = state.initialMatches[0];
  const m2 = state.initialMatches[1];
  const m3 = state.initialMatches[2];

  const w1 = m1?.winner || '';
  const w2 = m2?.winner || '';
  const w3 = m3?.winner || '';

  const l1 = m1?.loser || '';
  const l2 = m2?.loser || '';
  const l3 = m3?.loser || '';

  // Triangolare Scudetto
  state.triangolareScudetto.teams = [w1, w2, w3];
  const tsMatches = state.triangolareScudetto.matches;
  tsMatches[0].team1 = w1;
  tsMatches[0].team2 = w2;
  tsMatches[1].team1 = w2;
  tsMatches[1].team2 = w3;
  tsMatches[2].team1 = w1;
  tsMatches[2].team2 = w3;

  tsMatches.forEach((m) => {
    if (m.winner && m.winner !== m.team1 && m.winner !== m.team2) {
      m.winner = null;
      m.loser = null;
      m.score1 = null;
      m.score2 = null;
    }
  });

  // Triangolare Consolazione
  state.triangolareConsolazione.teams = [l1, l2, l3];
  const tcMatches = state.triangolareConsolazione.matches;
  tcMatches[0].team1 = l1;
  tcMatches[0].team2 = l2;
  tcMatches[1].team1 = l2;
  tcMatches[1].team2 = l3;
  tcMatches[2].team1 = l1;
  tcMatches[2].team2 = l3;

  tcMatches.forEach((m) => {
    if (m.winner && m.winner !== m.team1 && m.winner !== m.team2) {
      m.winner = null;
      m.loser = null;
      m.score1 = null;
      m.score2 = null;
    }
  });

  state.triangolareScudetto.standings = calculateTriangolareStandings(state.triangolareScudetto, 1);
  state.triangolareConsolazione.standings = calculateTriangolareStandings(state.triangolareConsolazione, 4);

  state.standings = {
    ...state.triangolareScudetto.standings,
    ...state.triangolareConsolazione.standings,
  };

  return state;
}

/**
 * Helper di propagazione risultati per torneo a 8 squadre
 */
function propagate8TeamsState(state) {
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

  state.semis.main.concat(state.semis.consolation).forEach((m) => {
    if (m.winner && m.winner !== m.team1 && m.winner !== m.team2) {
      m.winner = null;
      m.loser = null;
      m.score1 = null;
      m.score2 = null;
    }
  });

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
      f.score1 = null;
      f.score2 = null;
    }
  });

  state.standings = calculateStandings(state);

  return state;
}

/**
 * Aggiorna o annulla il vincitore di un match e propaga squadre e risultati.
 */
export function setMatchWinner(tournamentState, matchId, winnerTeam) {
  const state = JSON.parse(JSON.stringify(tournamentState));

  // --- GESTIONE TORNEO A 6 SQUADRE ---
  if (state.format === '6-teams' || state.initialMatches) {
    const allMatches = [
      ...(state.initialMatches || []),
      ...(state.triangolareScudetto?.matches || []),
      ...(state.triangolareConsolazione?.matches || []),
    ];

    const targetMatch = allMatches.find((m) => m.id === matchId);
    if (targetMatch) {
      if (!winnerTeam) {
        targetMatch.winner = null;
        targetMatch.loser = null;
      } else if (winnerTeam === targetMatch.team1 || winnerTeam === targetMatch.team2) {
        targetMatch.winner = winnerTeam;
        targetMatch.loser = winnerTeam === targetMatch.team1 ? targetMatch.team2 : targetMatch.team1;
      }
    }

    return propagate6TeamsState(state);
  }

  // --- GESTIONE TORNEO CLASSICO A 8 SQUADRE (2025) ---
  const allMatches = [
    ...state.quarters,
    ...state.semis.main,
    ...state.semis.consolation,
    ...state.finals,
  ];

  const targetMatch = allMatches.find((m) => m.id === matchId);
  if (targetMatch) {
    if (!winnerTeam) {
      targetMatch.winner = null;
      targetMatch.loser = null;
    } else if (winnerTeam === targetMatch.team1 || winnerTeam === targetMatch.team2) {
      targetMatch.winner = winnerTeam;
      targetMatch.loser = winnerTeam === targetMatch.team1 ? targetMatch.team2 : targetMatch.team1;
    }
  }

  return propagate8TeamsState(state);
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

/**
 * Calcola la classifica generale annuale sommando i punti di tutti gli sport.
 */
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
