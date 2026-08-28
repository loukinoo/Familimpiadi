/**
 * @file MatchCard.jsx
 * @description Card per singola partita del torneo con supporto all'inserimento e visualizzazione punteggi.
 */

import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

/**
 * Estrae solo il soprannome principale per non occupare spazio dentro le card del torneo.
 * Esempio: "I Bombardieri (Luca e Kevin)" -> "I Bombardieri"
 */
export function getShortTeamName(fullName) {
  if (!fullName) return 'In attesa...';
  const parts = fullName.split(' (');
  return parts[0].trim();
}

export default function MatchCard({ match, onSelectWinner, onUpdateScore, isAdmin }) {
  const { team1, team2, winner, loser, score1, score2 } = match;

  const handleTeamClick = (teamName) => {
    if (!teamName || teamName.trim() === '') return;
    if (!isAdmin) return;

    if (winner === teamName) {
      onSelectWinner(match.id, null);
    } else {
      onSelectWinner(match.id, teamName);
    }
  };

  const handleScore1Change = (e) => {
    e.stopPropagation();
    const val = e.target.value;
    if (onUpdateScore) {
      onUpdateScore(match.id, val, score2);
    }
  };

  const handleScore2Change = (e) => {
    e.stopPropagation();
    const val = e.target.value;
    if (onUpdateScore) {
      onUpdateScore(match.id, score1, val);
    }
  };

  const hasTeams = team1 && team2 && team1.trim() !== '' && team2.trim() !== '';

  return (
    <div className={`match-card-box ${winner ? 'match-completed' : ''}`}>
      {match.title && (
        <div className="match-card-header">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{match.title}</span>
        </div>
      )}

      <div className="match-teams-wrapper flex flex-col gap-1">
        {/* Squadra 1 */}
        <div
          onClick={() => handleTeamClick(team1)}
          className={`team-slot ${winner === team1 ? 'team-winner' : loser === team1 ? 'team-loser' : ''
            } ${isAdmin && team1 ? 'team-clickable' : ''}`}
          title={isAdmin && team1 ? (winner === team1 ? 'Clicca per annullare vittoria' : 'Clicca per decretare vincitore') : ''}
        >
          <div className="team-info flex-1">
            <span className="team-avatar">👥</span>
            <span className="team-name">{getShortTeamName(team1)}</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isAdmin && hasTeams ? (
              <input
                type="number"
                min="0"
                max="999"
                value={score1 !== null && score1 !== undefined ? score1 : ''}
                onChange={handleScore1Change}
                placeholder="-"
                className="score-input"
                title="Punteggio Squadra 1"
              />
            ) : (
              score1 !== null && score1 !== undefined && (
                <span className="score-badge">{score1}</span>
              )
            )}

            {winner === team1 && (
              <span className="winner-badge" title="Vincitore registrato">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              </span>
            )}
          </div>
        </div>

        <div className="match-vs-divider">
          <span>contro</span>
        </div>

        {/* Squadra 2 */}
        <div
          onClick={() => handleTeamClick(team2)}
          className={`team-slot ${winner === team2 ? 'team-winner' : loser === team2 ? 'team-loser' : ''
            } ${isAdmin && team2 ? 'team-clickable' : ''}`}
          title={isAdmin && team2 ? (winner === team2 ? 'Clicca per annullare vittoria' : 'Clicca per decretare vincitore') : ''}
        >
          <div className="team-info flex-1">
            <span className="team-avatar">👥</span>
            <span className="team-name">{getShortTeamName(team2)}</span>
          </div>

          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {isAdmin && hasTeams ? (
              <input
                type="number"
                min="0"
                max="999"
                value={score2 !== null && score2 !== undefined ? score2 : ''}
                onChange={handleScore2Change}
                placeholder="-"
                className="score-input"
                title="Punteggio Squadra 2"
              />
            ) : (
              score2 !== null && score2 !== undefined && (
                <span className="score-badge">{score2}</span>
              )
            )}

            {winner === team2 && (
              <span className="winner-badge" title="Vincitore registrato">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
