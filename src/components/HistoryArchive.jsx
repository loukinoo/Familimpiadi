/**
 * @file HistoryArchive.jsx
 * @description Archivio storico delle edizioni passate del torneo (es. 2025).
 */

import React from 'react';
import default2025 from '../data/defaultData2025.json';
import { History, Trophy, Calendar, Medal } from 'lucide-react';

export default function HistoryArchive() {
  const archives = [default2025];

  return (
    <div className="history-container animate-fade-in">
      <div className="history-header">
        <div className="header-badge">
          <History className="w-5 h-5 text-amber-400" />
          <span>Albo d'Oro</span>
        </div>
        <h2>Storico Edizioni Passate</h2>
        <p>Rivivi i momenti storici, i campioni incoronati e le sfide delle precedenti Familimpiadi.</p>
      </div>

      <div className="history-grid mt-6">
        {archives.map((edition) => (
          <div key={edition.year} className="history-card">
            <div className="history-card-header">
              <div className="year-pill">
                <Calendar className="w-4 h-4" />
                <span>Edizione {edition.year}</span>
              </div>
              <div className="champion-badge">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span>Campioni: {edition.champion}</span>
              </div>
            </div>

            <div className="history-podium-section">
              <h4>Podio Ufficiale</h4>
              <div className="podium-mini-list">
                {edition.podium.map((p) => (
                  <div key={p.rank} className="podium-mini-item">
                    <span className="mini-rank">
                      {p.rank === 1 ? '🥇 ' : p.rank === 2 ? '🥈 ' : '🥉 '}
                    </span>
                    <span className="mini-team">{p.couple}</span>
                    <span className="mini-pts"> {p.points} pt</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="history-sports-section mt-4">
              <h4>Discipline Disputate</h4>
              <ul className="sports-pills">
                {edition.sports.map((sport) => (
                  <li key={sport} className="history-sport-tag" style={{ marginLeft: 20 }}>
                    {sport}
                  </li>
                ))}
              </ul>
            </div>

            {edition.notes && (
              <p className="history-notes mt-4">
                <em>"{edition.notes}"</em>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
