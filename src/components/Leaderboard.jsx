/**
 * @file Leaderboard.jsx
 * @description Classifica Generale annuale del torneo con podio dinamico e dettaglio dei punti per ogni sport.
 */

import React from 'react';
import { calculateOverallLeaderboard } from '../services/tournamentLogic';
import { Trophy, Crown, Flame, Award } from 'lucide-react';

export default function Leaderboard({ state }) {
  const leaderboard = calculateOverallLeaderboard(state.sportsData, state.couples);
  const sports = state.sports || [];

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="leaderboard-container animate-fade-in">
      <div className="leaderboard-header">
        <div className="header-badge">
          <Flame className="w-5 h-5 text-amber-400" />
          <span>Edizione {state.year || 2025}</span>
        </div>
        <h2>Classifica Generale Familimpiadi</h2>
        <p>
          Somma dei punti conquistati in tutti gli sport. Chi vincerà l'ambita coppa di famiglia?
        </p>
      </div>

      {/* Podio animato per i primi 3 posti */}
      {top3.length > 0 && (
        <div className="podium-wrapper">
          {/* 2º Posto - Argento */}
          {top3[1] && (
            <div className="podium-step podium-2 animate-scale-up">
              <div className="podium-avatar silver-glow">🥈</div>
              <div className="podium-team">{top3[1].couple}</div>
              <div className="podium-points">{top3[1].totalPoints} Punti</div>
              <div className="podium-block silver-block">2º Posto</div>
            </div>
          )}

          {/* 1º Posto - Oro */}
          {top3[0] && (
            <div className="podium-step podium-1 animate-scale-up">
              <Crown className="w-8 h-8 text-yellow-400 animate-bounce mb-1" />
              <div className="podium-avatar gold-glow">🥇</div>
              <div className="podium-team">{top3[0].couple}</div>
              <div className="podium-points">{top3[0].totalPoints} Punti</div>
              <div className="podium-block gold-block">CAMPIONI 🏆</div>
            </div>
          )}

          {/* 3º Posto - Bronzo */}
          {top3[2] && (
            <div className="podium-step podium-3 animate-scale-up">
              <div className="podium-avatar bronze-glow">🥉</div>
              <div className="podium-team">{top3[2].couple}</div>
              <div className="podium-points">{top3[2].totalPoints} Punti</div>
              <div className="podium-block bronze-block">3º Posto</div>
            </div>
          )}
        </div>
      )}

      {/* Tabella Dettagliata Punteggi per Sport */}
      <div className="card-glass mt-8">
        <div className="card-title-bar">
          <h3>Dettaglio Punti per Disciplina</h3>
        </div>
        <div className="standings-table-wrapper">
          <table className="standings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Coppia</th>
                {sports.map((s) => (
                  <th key={s} className="text-center">{s}</th>
                ))}
                <th className="text-right">Totale Punti</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, index) => (
                <tr key={item.couple} className={index < 3 ? 'top-row' : ''}>
                  <td className="font-bold">
                    {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                  </td>
                  <td className="font-semibold text-white">{item.couple}</td>
                  {sports.map((s) => (
                    <td key={s} className="text-center text-slate-300 text-sm">
                      {item.breakdown[s] ? (
                        <span className="badge-points">+{item.breakdown[s]}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  ))}
                  <td className="text-right font-extrabold text-amber-400 text-lg">
                    {item.totalPoints} pt
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
