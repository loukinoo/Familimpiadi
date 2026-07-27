/**
 * @file MatchCard.jsx
 * @description Componente per la resa visiva di una singola partita del tabellone.
 */

import React from 'react';
import { Trophy, CheckCircle, Crown } from 'lucide-react';

export default function MatchCard({ match, onSelectWinner, isAdmin }) {
  const { team1, team2, winner, loser } = match;

  const handleTeamClick = (teamName) => {
    if (!teamName || teamName.trim() === '') return;
    if (!isAdmin) return;
    onSelectWinner(match.id, teamName);
  };

  return (
    <div className={`match-card-box ${winner ? 'match-completed' : ''}`}>
      {match.title && <div className="match-card-title">{match.title}</div>}
      
      <div className="match-teams-container">
        {/* Squadra 1 */}
        <div
          onClick={() => handleTeamClick(team1)}
          className={`team-slot ${
            winner === team1 ? 'team-winner' : loser === team1 ? 'team-loser' : ''
          } ${isAdmin && team1 ? 'team-clickable' : ''}`}
        >
          <span className="team-name">{team1 || 'In attesa...'}</span>
          {winner === team1 && <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />}
        </div>

        <div className="match-divider">
          <span>VS</span>
        </div>

        {/* Squadra 2 */}
        <div
          onClick={() => handleTeamClick(team2)}
          className={`team-slot ${
            winner === team2 ? 'team-winner' : loser === team2 ? 'team-loser' : ''
          } ${isAdmin && team2 ? 'team-clickable' : ''}`}
        >
          <span className="team-name">{team2 || 'In attesa...'}</span>
          {winner === team2 && <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />}
        </div>
      </div>
    </div>
  );
}
