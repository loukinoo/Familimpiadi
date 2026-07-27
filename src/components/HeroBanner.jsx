/**
 * @file HeroBanner.jsx
 * @description Banner introduttivo con statistiche in evidenza dell'edizione corrente.
 */

import React from 'react';
import { calculateOverallLeaderboard } from '../services/tournamentLogic';
import { Trophy, Swords, Users, Sparkles } from 'lucide-react';

export default function HeroBanner({ state }) {
  const leaderboard = calculateOverallLeaderboard(state.sportsData, state.couples);
  const leader = leaderboard[0];

  return (
    <div className="hero-banner-card animate-fade-in">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Familimpiadi {state.year || 2025}</span>
        </div>
        <h1 className="hero-title">Il Torneo Ufficiale della Famiglia 🏆</h1>
        <p className="hero-description">
          Segui dal vivo i risultati, l'estrazione delle coppie e la classifica generale delle Familimpiadi.
        </p>

        <div className="hero-stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-amber-500/20 text-amber-400">
              <Swords className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{state.sports?.length || 0}</span>
              <span className="stat-label">Disciplone</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-blue-500/20 text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value">{state.couples?.length || 0}</span>
              <span className="stat-label">Coppie in Gara</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-yellow-500/20 text-yellow-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="stat-info">
              <span className="stat-value text-amber-300">
                {leader ? leader.couple : 'In attesa'}
              </span>
              <span className="stat-label">In Testa alla Classifica</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
