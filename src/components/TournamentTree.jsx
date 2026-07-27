/**
 * @file TournamentTree.jsx
 * @description Albero grafico del torneo con ramificazioni ad albero e connettori grafici.
 */

import React, { useState } from 'react';
import MatchCard from './MatchCard';
import FirstTimeIntro from './FirstTimeIntro';
import { setMatchWinner } from '../services/tournamentLogic';
import { Trophy, Award, Medal, ShieldAlert, GitBranch } from 'lucide-react';

export default function TournamentTree({ state, onUpdateSportsData, isAdmin }) {
  const sports = state.sports || [];
  const [selectedSport, setSelectedSport] = useState(sports[0] || 'Biliardino');

  const currentSportData = state.sportsData[selectedSport] || {};

  const handleWinnerSelect = (matchId, winnerTeam) => {
    if (!isAdmin) return;
    const updatedSportState = setMatchWinner(currentSportData, matchId, winnerTeam);
    const updatedSportsData = {
      ...state.sportsData,
      [selectedSport]: updatedSportState,
    };
    onUpdateSportsData(updatedSportsData);
  };

  const quarters = currentSportData.quarters || [];
  const mainSemis = currentSportData.semis?.main || [];
  const consolationSemis = currentSportData.semis?.consolation || [];
  const finals = currentSportData.finals || [];
  const standings = currentSportData.standings || {};

  return (
    <div className="tournament-tree-container animate-fade-in">
      {/* Effetto speciale d'ingresso */}
      <FirstTimeIntro
        title={`Torneo di ${selectedSport}`}
        storageKey={`intro_seen_${selectedSport.toLowerCase().replace(/\s+/g, '_')}`}
      />

      {/* Sport Selector Bar */}
      <div className="sport-selector-bar">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`sport-chip ${selectedSport === sport ? 'sport-chip-active' : ''}`}
          >
            🏆 {sport}
          </button>
        ))}
      </div>

      <div className="tournament-header text-center">
        <h2>Disciplina: <span className="text-amber-400">{selectedSport}</span> 🏆</h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto mt-1">
          Formato casereccio a piazzamento completo: ogni coppia gioca 3 partite per determinare l'esatta posizione finale dal 1º all'8º posto.
        </p>
        {!isAdmin && (
          <div className="read-only-hint">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Modalità Visitatore: Clicca "Accedi Admin" in alto per segnare i vincitori.</span>
          </div>
        )}
      </div>

      {/* Main Bracket ad Albero (1º - 4º Posto) */}
      <div className="tree-section mt-6">
        <div className="section-title">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h3>Albero del Torneo - Main Bracket (1º – 4º Posto)</h3>
        </div>

        {/* Tree Layout Wrapper con Connettori Grafici */}
        <div className="bracket-tree-wrapper">
          {/* Colonna 1: Quarti di Finale */}
          <div className="bracket-column">
            <div className="column-header">
              <GitBranch className="w-4 h-4 text-amber-400" />
              <span>Quarti di Finale</span>
            </div>
            <div className="matches-group">
              <div className="match-pair">
                {quarters[0] && <MatchCard match={quarters[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
                {quarters[1] && <MatchCard match={quarters[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              </div>
              <div className="match-pair mt-8">
                {quarters[2] && <MatchCard match={quarters[2]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
                {quarters[3] && <MatchCard match={quarters[3]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              </div>
            </div>
          </div>

          {/* Connettore grafico SVG Quarti -> Semifinali */}
          <div className="tree-connector-col hidden md:block">
            <svg className="connector-svg" viewBox="0 0 40 400" preserveAspectRatio="none">
              {/* Ramo Top 1 */}
              <path d="M 0 50 L 20 50 L 20 100 L 40 100" stroke="#64748b" strokeWidth="2" fill="none" />
              <path d="M 0 150 L 20 150 L 20 100 L 40 100" stroke="#64748b" strokeWidth="2" fill="none" />
              {/* Ramo Bottom 2 */}
              <path d="M 0 250 L 20 250 L 20 300 L 40 300" stroke="#64748b" strokeWidth="2" fill="none" />
              <path d="M 0 350 L 20 350 L 20 300 L 40 300" stroke="#64748b" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Colonna 2: Semifinali Main */}
          <div className="bracket-column">
            <div className="column-header">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Semifinali Main</span>
            </div>
            <div className="matches-group justify-around h-full">
              {mainSemis[0] && <MatchCard match={mainSemis[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {mainSemis[1] && <MatchCard match={mainSemis[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          {/* Connettore grafico SVG Semifinali -> Finale */}
          <div className="tree-connector-col hidden md:block">
            <svg className="connector-svg" viewBox="0 0 40 400" preserveAspectRatio="none">
              <path d="M 0 100 L 20 100 L 20 200 L 40 200" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
              <path d="M 0 300 L 20 300 L 20 200 L 40 200" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
            </svg>
          </div>

          {/* Colonna 3: Grand Finale 1º - 2º Posto */}
          <div className="bracket-column highlight-column">
            <div className="column-header">
              <Award className="w-5 h-5 text-yellow-400 animate-bounce" />
              <span>Grande Finale (1º–2º Posto)</span>
            </div>
            <div className="matches-group justify-center h-full">
              {finals[0] && <MatchCard match={finals[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>
        </div>
      </div>

      {/* Consolation Bracket (5º - 8º Posto) */}
      <div className="tree-section mt-8">
        <div className="section-title">
          <Medal className="w-6 h-6 text-emerald-400" />
          <h3>Tabellone di Consolazione (5º – 8º Posto)</h3>
        </div>

        <div className="bracket-tree-wrapper">
          <div className="bracket-column">
            <div className="column-header">
              <span>Semifinali Consolation</span>
            </div>
            <div className="matches-group">
              {consolationSemis[0] && <MatchCard match={consolationSemis[0]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
              {consolationSemis[1] && <MatchCard match={consolationSemis[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          <div className="bracket-column">
            <div className="column-header">
              <span>Finale 5º – 6º Posto</span>
            </div>
            <div className="matches-group">
              {finals[2] && <MatchCard match={finals[2]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>

          <div className="bracket-column">
            <div className="column-header">
              <span>Finale 7º – 8º Posto</span>
            </div>
            <div className="matches-group">
              {finals[3] && <MatchCard match={finals[3]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
            </div>
          </div>
        </div>
      </div>

      {/* Finale 3º-4º Posto */}
      <div className="tree-section mt-6">
        <div className="section-title">
          <Medal className="w-6 h-6 text-amber-500" />
          <h3>Finale 3º – 4º Posto (Medaglia di Bronzo)</h3>
        </div>
        <div className="max-w-md mx-auto">
          {finals[1] && <MatchCard match={finals[1]} onSelectWinner={handleWinnerSelect} isAdmin={isAdmin} />}
        </div>
      </div>

      {/* Classifica Punti della Disciplina */}
      <div className="sport-standings-card mt-8">
        <h3>Classifica Finale: {selectedSport}</h3>
        <div className="standings-table-wrapper mt-3">
          <table className="standings-table">
            <thead>
              <tr>
                <th>Posizione</th>
                <th>Coppia / Squadra</th>
                <th>Punti Assegnati</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(standings).length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-slate-400">
                    I match di questo torneo sono in corso. Clicca sui vincitori dei match per aggiornare la classifica!
                  </td>
                </tr>
              ) : (
                Object.entries(standings)
                  .sort((a, b) => a[1].rank - b[1].rank)
                  .map(([team, info]) => (
                    <tr key={team}>
                      <td className="font-bold">
                        {info.rank === 1 && '🥇 1º Posto'}
                        {info.rank === 2 && '🥈 2º Posto'}
                        {info.rank === 3 && '🥉 3º Posto'}
                        {info.rank > 3 && `${info.rank}º Posto`}
                      </td>
                      <td className="font-semibold text-amber-200">{team}</td>
                      <td className="text-amber-400 font-bold">+{info.points} Punti</td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
