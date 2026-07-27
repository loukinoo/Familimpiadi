/**
 * @file Navbar.jsx
 * @description Barra di navigazione reattiva con layout mobile dedicato per selettore anno e tab.
 */

import React from 'react';
import { Trophy, Swords, Shuffle, History, Lightbulb, ShieldCheck, Shield, Calendar } from 'lucide-react';
import { AVAILABLE_YEARS } from '../services/storageService';

export default function Navbar({
  activeTab,
  setActiveTab,
  selectedYear,
  setSelectedYear,
  isAdmin,
  onOpenAdminModal,
}) {
  const navItems = [
    { id: 'leaderboard', label: 'Classifica', icon: Trophy },
    { id: 'tournaments', label: 'Tornei', icon: Swords },
    { id: 'drawer', label: 'Estrazione Live', icon: Shuffle },
    { id: 'history', label: 'Storico', icon: History },
    { id: 'suggestions', label: 'Suggerimenti', icon: Lightbulb },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-content">

        {/* Riga Superiore: Brand + Selettore Anno + Admin Button */}
        <div className="navbar-top-row">
          <div className="navbar-brand" onClick={() => setActiveTab('leaderboard')}>
            <div className="brand-logo">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 animate-pulse" />
            </div>
            <div className="brand-text">
              <span className="brand-title">Familimpiadi</span>
            </div>
          </div>

          <div className="navbar-top-right-group">
            {/* Selettore Anno visibile sia su Mobile che Desktop */}
            <div className="year-selector-box">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="year-dropdown"
              >
                {AVAILABLE_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y} {y === 2026 ? '🏆 (In corso)' : '📜 (Storico)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Pulsante Admin */}
            <button
              onClick={onOpenAdminModal}
              className={`admin-toggle-btn ${isAdmin ? 'admin-active' : ''}`}
              title={isAdmin ? 'Modalità Admin Attiva' : 'Sblocca Modalità Admin'}
            >
              {isAdmin ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ) : (
                <Shield className="w-4 h-4 text-slate-400" />
              )}
              <span className="hidden xs:inline">{isAdmin ? 'Admin' : 'Accedi'}</span>
            </button>
          </div>
        </div>

        {/* Riga Inferiore: Tab Navigazione Scorrevoli su Mobile */}
        <nav className="navbar-links-scroll mt-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab ${isActive ? 'nav-tab-active' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
