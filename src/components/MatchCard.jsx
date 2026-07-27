/**
 * @file MatchCard.jsx
 * @description Card per singola partita del torneo (mostra solo il soprannome principale per risparmiare spazio).
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

export default function MatchCard({ match, onSelectWinner, isAdmin }) {
  const { team1, team2, winner, loser } = match;

  const handleTeamClick = (teamName) => {
    if (!teamName || teamName.trim() === '') return;
    if (!isAdmin) return;

    // Se la squadra cliccata è già la vincitrice, annulla la vittoria (toggle/reset singolo)
    if (winner === teamName) {
      onSelectWinner(match.id, null);
    } else {
      onSelectWinner(match.id, teamName);
    }
  };

  return (
    <div className={`match-card-box ${winner ? 'match-completed' : ''}`}>
      {match.title && (
        <div className="match-card-header">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{match.title}</span>
        </div>
      )}

      <div className="match-teams-wrapper">
        {/* Squadra 1 */}
        <div
          onClick={() => handleTeamClick(team1)}
          className={`team-slot ${winner === team1 ? 'team-winner' : loser === team1 ? 'team-loser' : ''
            } ${isAdmin && team1 ? 'team-clickable' : ''}`}
          title={isAdmin && team1 ? (winner === team1 ? 'Clicca per annullare vittoria' : 'Clicca per decretare vincitore') : ''}
        >
          <div className="team-info">
            <span className="team-avatar">👥</span>
            <span className="team-name">{getShortTeamName(team1)}</span>
          </div>

          {winner === team1 && (
            <span className="winner-badge" title="Vincitore registrato (Clicca per annullare)">
              <Crown className="w-4 h-4 text-amber-300" />
            </span>
          )}
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
          <div className="team-info">
            <span className="team-avatar">👥</span>
            <span className="team-name">{getShortTeamName(team2)}</span>
          </div>

          {winner === team2 && (
            <span className="winner-badge" title="Vincitore registrato (Clicca per annullare)">
              <Crown className="w-4 h-4 text-amber-300" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
