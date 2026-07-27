# 📖 Guida Semplice: Come Pubblicare Familimpiadi su GitHub Pages

Questa guida passo-passo ti spiegherà come pubblicare il sito **Familimpiadi** su **GitHub Pages** in modo che tutti i tuoi parenti possano vederlo e interagire con il loro smartphone o computer!

---

## 🎯 Requisiti
- Un account gratuito su [GitHub](https://github.com/).
- Node.js e Git installati sul computer.

---

## 🚀 Metodo Rapido (Consigliato: Pacchetto `gh-pages`)

### Passaggio 1: Crea un nuovo Repository su GitHub
1. Vai su [github.com/new](https://github.com/new).
2. Nome del repository: `Familimpiadi` (oppure il nome che preferisci).
3. Mantieni il repository **Pubblico** (Public).
4. **Non** selezionare "Add a README file" (lo abbiamo già creato).
5. Clicca su **Create repository**.

---

### Passaggio 2: Collega la tua cartella locale a GitHub
Apri il terminale all'interno della cartella del progetto `Familimpiadi` ed esegui i seguenti comandi (sostituisci `TUO-UTENTE` con il tuo nome utente GitHub):

```bash
git init
git add .
git commit -m "Primo commit Familimpiadi 🏆"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/Familimpiadi.git
git push -u origin main
```

---

### Passaggio 3: Installa il pacchetto di deploy automatico
Nel terminale della cartella del progetto, installa l'utility `gh-pages`:

```bash
npm install gh-pages --save-dev
```

Poi apri il file [`package.json`](file:///Users/lucabagini/Progetti/Personali/Familimpiadi/package.json) e aggiungi gli script di deploy all'interno della sezione `"scripts"`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

---

### Passaggio 4: Esegui il Deploy! 🚀
Nel terminale esegui semplicemente:

```bash
npm run deploy
```

Questo comando farà in automatico:
1. La compilazione del sito (`npm run build`).
2. La creazione di un ramo dedicato chiamato `gh-pages` su GitHub.
3. Il caricamento di tutti i file compilati.

---

### Passaggio 5: Attiva GitHub Pages sul Repository
1. Vai su GitHub alla pagina del tuo repository (`https://github.com/TUO-UTENTE/Familimpiadi`).
2. Clicca sulla scheda **Settings** (in alto a destra).
3. Nel menu a sinistra, clicca su **Pages**.
4. Sotto **Build and deployment** -> **Branch**:
   - Seleziona **`gh-pages`** dal menu a tendina.
   - Cartella: lascia **`/ (root)`**.
5. Clicca su **Save**.

Dopo 1 o 2 minuti, vedrai un banner verde con il link ufficiale del tuo sito, del tipo:
👉 `https://TUO-UTENTE.github.io/Familimpiadi/`

Condividi questo link nella chat di famiglia su WhatsApp! 📱🎉

---

## 🔄 Come aggiornare il sito in futuro
Ogni volta che fai modifiche al codice o ai dati del torneo:
```bash
git add .
git commit -m "Aggiornamento risultati torneo"
git push origin main
npm run deploy
```
Il sito su GitHub Pages si aggiornerà automaticamente in 60 secondi!
