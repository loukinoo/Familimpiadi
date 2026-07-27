/**
 * @file Navbar.jsx
 * @description Barra di navigazione principale reattiva con indicatore modalità Admin.
 */

import React from 'react';
import { Trophy, Swords, Shuffle, History, Lightbulb, ShieldCheck, Shield } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, isAdmin, onOpenAdminModal }) {
  const navItems = [
    { id: 'leaderboard', label: 'Classifica', icon: Trophy },
    { id: 'tournaments', label: 'Tornei Sport', icon: Swords },
    { id: 'drawer', label: 'Estrazione Live', icon: Shuffle },
    { id: 'history', label: 'Storico', icon: History },
    { id: 'suggestions', label: 'Suggerimenti', icon: Lightbulb },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand logo */}
        <div className="navbar-brand" onClick={() => setActiveTab('leaderboard')}>
          <div className="brand-logo">
            <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div className="brand-text">
            <span className="brand-title">Familimpiadi</span>
            <span className="brand-subtitle">Torneo Annuale</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-links">
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

        {/* Admin Button */}
        <div className="navbar-actions">
          <button
            onClick={onOpenAdminModal}
            className={`admin-toggle-btn ${isAdmin ? 'admin-active' : ''}`}
            title={isAdmin ? "Modalità Admin Attiva" : "Sblocca Modalità Admin"}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Admin Attivo</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="hidden sm:inline">Accedi Admin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
