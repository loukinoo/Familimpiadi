# 🏆 Familimpiadi - Il Torneo Ufficiale di Famiglia

**Familimpiadi** è una piattaforma web moderna, fluida e reattiva progettata per gestire il torneo annuale di famiglia. Il sito permette a tutti i parenti di seguire in tempo reale l'andamento dei tornei per ogni disciplina sportiva, effettuare l'estrazione dal vivo delle coppie, consultare la classifica generale e proporre nuovi sport per le edizioni future.

---

## 🌟 Caratteristiche Principali

1. **🏆 Tabellone di Torneo Non a Eliminazione Diretta**:
   - Ogni disciplina (Biliardino, Bocce, Bowling, Equilibrio, Memory, Muffin Pong + sport personalizzati) ha la propria albero di sfide.
   - Struttura a **piazzamento completo**: chi vince avanza verso la finale principale (1º-4º posto), chi perde gioca nel tabellone di consolazione (5º-8º posto).
   - Tutte le 8 coppie effettuano 3 partite per determinare la classifica dal 1º all'8º posto.

2. **✨ Effetto Speciale di Ingresso**:
   - Alla prima apertura del tabellone di un torneo o di una sessione di estrazione viene attivata un'animazione spettacolare con confetti e fasci di luce per accogliere i parenti.

3. **🎲 Estrazione Coppie Live**:
   - Sezione interattiva per l'estrazione visiva casuale delle coppie dai partecipanti singoli con animazione tipo slot/roulette ed effetti speciali.
   - L'Amministratore può registrare i partecipanti e applicare istantaneamente le coppie a tutti i tabelloni del torneo.

4. **🥇 Classifica Generale Automatica**:
   - Calcolo automatico e in tempo reale dei punti totali assegnati in base al piazzamento in ciascun sport (es. 1º = 8pt, 2º = 7pt, ... 8º = 1pt).
   - Podio animato 3D per i primi 3 classificati e tabella di scomposizione dei punti per sport.

5. **📜 Storico Anni Passati**:
   - Sezione Archivio per consultare le edizioni precedenti (es. l'edizione 2025).

6. **💡 Form Suggerimenti Sport**:
   - I parenti possono proporre nuovi giochi/sport tramite un form pubblico. L'Amministratore può approvare o scartare le proposte.

7. **🔐 Permessi Admin**:
   - I parenti navigano il sito in modalità lettura/interattiva.
   - Modalità Admin protetta da PIN segreto (default: `1234`) per modificare i vincitori dei match, gestire i partecipanti ed estrarre le coppie.

8. **🌐 Deploy su GitHub Pages & Firebase Ready**:
   - Funziona in modalità stand-alone salvando i dati localmente sul dispositivo (`localStorage`).
   - Sincronizzazione multi-dispositivo in tempo reale attivabile collegando **Firebase Firestore**.

---

## 📁 Struttura del Progetto

```
Familimpiadi/
├── .gitignore               # Esclusioni di Git per node_modules, build e file locali
├── README.md                # Documentazione del progetto
├── index.html               # Entry point HTML con font Google e meta tag
├── package.json             # Dipendenze e script npm
├── vite.config.js           # Configurazione Vite con base path relativa per GitHub Pages
├── 2025/                    # Dati e archivio storico dell'edizione 2025
├── base/                    # Prototipi HTML storici del torneo
├── EstrazioneCoppie.java    # Script Java originale per estrazione coppie
├── EstrazioneSfide.java     # Script Java originale per estrazione sfide
└── src/
    ├── main.jsx             # Mounting React
    ├── App.jsx              # Layout principale e gestione stato globale
    ├── index.css            # Design System (Glassmorphism, gradienti e responsività)
    ├── config/
    │   └── firebase.js      # Inizializzazione facoltativa di Firebase Firestore
    ├── data/
    │   ├── defaultData2025.json      # Archivio storico 2025
    │   └── initialParticipants.json  # Lista iniziale partecipanti
    ├── services/
    │   ├── tournamentLogic.js # Algoritmo tabellone non a eliminazione & classifica
    │   └── storageService.js  # Salvataggio duale (localStorage + Firestore)
    └── components/
        ├── Navbar.jsx         # Navigation bar reattiva con indicatore Admin
        ├── HeroBanner.jsx     # Banner iniziale con statistiche
        ├── Leaderboard.jsx    # Classifica Generale con podio animato
        ├── TournamentTree.jsx # Albero del torneo per disciplina
        ├── MatchCard.jsx      # Card singola partita cliccabile in Admin mode
        ├── LiveDrawer.jsx     # Estrazione live animata delle coppie
        ├── HistoryArchive.jsx # Archivio albo d'oro anni precedenti
        ├── SportsManager.jsx  # Gestore sport ufficiali e form suggerimenti
        ├── AdminModal.jsx     # Modal inserimento PIN Admin
        └── FirstTimeIntro.jsx # Effetto speciale di benvenuto con confetti
```

---

## 🛠️ Guida all'Installazione e Sviluppo Locale

### Pre-requisiti
Assicurati di avere installato **Node.js** (versione 18 o superiore).

### 1. Installazione dipendenze
Esegui nel terminale all'interno della directory del progetto:
```bash
npm install
```

### 2. Avvio del server di sviluppo
Per avviare l'applicazione in locale con ricaricamento automatico:
```bash
npm run dev
```
Apri il browser all'indirizzo mostrato nel terminale (solitamente `http://localhost:5173`).

---

## 🚀 Guida al Deploy su GitHub Pages

Il progetto è configurato con percorsi relativi (`base: './'`) in `vite.config.js` per funzionare immediatamente su **GitHub Pages**.

### Passaggi per la pubblicazione:

1. **Compilazione del bundle statico**:
   ```bash
   npm run build
   ```
   Verrà creata la cartella `dist/` contenente tutti i file compilati.

2. **Pubblicazione su GitHub**:
   Puoi caricare il contenuto della cartella `dist/` sul ramo `gh-pages` oppure configurare le GitHub Actions del tuo repository per compilare ed eseguire il deploy automaticamente ad ogni push sul ramo `main`.

---

## 🔥 Configurazione Facoltativa di Firebase (Sync in Tempo Reale)

Se desideri che le modifiche ai risultati inserite dall'Admin appaiano **istantaneamente** sui telefoni di tutti i parenti durante il torneo, puoi configurare Firebase:

1. Crea un progetto gratuito su [Firebase Console](https://console.firebase.google.com/).
2. Crea un database **Cloud Firestore**.
3. Crea un file `.env.local` nella radice del progetto con le tue chiavi:
   ```env
   VITE_FIREBASE_API_KEY=tua_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tuo_progetto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tuo_progetto_id
   VITE_FIREBASE_STORAGE_BUCKET=tuo_progetto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=tuo_sender_id
   VITE_FIREBASE_APP_ID=tuo_app_id
   ```

Se le chiavi non vengono fornite, l'app funzionerà automaticamente in **modalità offline** salvando tutti i dati su `localStorage`.

---

## 🔐 PIN Amministratore Predefinito

- **PIN predefinito**: `1234` (oppure `admin`).
- Per cambiare il PIN, modifica il valore della costante `ADMIN_PIN` nel file [`src/services/storageService.js`](file:///Users/lucabagini/Progetti/Personali/Familimpiadi/src/services/storageService.js).
