<script>
    const finals = [
      { titolo: "Finale 1º-2º posto" },
      { titolo: "Finale 3º-4º posto" },
      { titolo: "Finale 5º-6º posto" },
      { titolo: "Finale 7º-8º posto" }
    ];

    function createBracket(containerId, matchesPerRound, discipline, mirrored=false) {
      let html = '';
      matchesPerRound.forEach((numMatches, rIndex) => {
        html += '<div class="round">';
        for (let i = 0; i < numMatches; i++) {
          html += `<div class='match' data-discipline='${discipline}' data-round='${rIndex}' data-match='${i+1}'>
            <div class='team' contenteditable='true';></div>
            <div class='team' contenteditable='true'></div>
          </div>`;
        }
        html += '</div>';
      });
      const container = document.getElementById(containerId);
      container.innerHTML = html;
      if (mirrored) container.style.flexDirection = 'row-reverse';
    }

    function createFinals(containerId, finals, discipline) {
      let html = '';
      finals.forEach(final => {
        html += `<div class='match' data-discipline='${discipline}' data-round='final' data-match='1'>
          <div class='final-title'>${final.titolo}</div>
          <div class='team' contenteditable='true'></div>
          <div class='team' contenteditable='true'></div>
        </div>`;
      });
      document.getElementById(containerId).innerHTML = html;
    }

    createBracket("mainBracket", [4,2], "Biliardino"); // Quarti e semifinali (senza finale)
    createBracket("consolationBracket", [2], "Biliardino", true);
    createFinals("finals", finals, "Biliardino");

    function saveData() {
        const data = [];
        document.querySelectorAll(".match").forEach(match => {
            const teams = match.querySelectorAll(".team");
            data.push(Array.from(teams).map(t => ({
            text: t.textContent,
            winner: t.classList.contains("winner")
            })));
        });
        localStorage.setItem("biliardinoData", JSON.stringify(data));
    }

    function loadData() {
        const saved = localStorage.getItem("biliardinoData");
        if (saved) {
            const data = JSON.parse(saved);
            const matches = document.querySelectorAll(".match");
            matches.forEach((match, idx) => {
            const teams = match.querySelectorAll(".team");
            if (data[idx]) {
                teams.forEach((t, i) => {
                t.textContent = data[idx][i].text || '';
                t.classList.remove("winner", "loser");
                if (data[idx][i].winner) t.classList.add("winner");
                else if (t.textContent) t.classList.add("loser");
                });
            }
            });
        }
        aggiornaClassifica();
    }

    function resetTorneo() {
      localStorage.removeItem("biliardinoData");
      document.querySelectorAll(".team").forEach(t => { t.textContent = ''; t.classList.remove("winner", "loser"); });
      document.querySelector("#classifica tbody").innerHTML = '';
    }

    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("team") && e.target.textContent.trim() !== '') {
        const match = e.target.parentElement;
        const teams = match.querySelectorAll(".team");
        teams.forEach(t => t.classList.remove("winner", "loser"));
        e.target.classList.add("winner");
        teams.forEach(t => { if(t !== e.target) t.classList.add("loser"); });
        aggiornaTurni(match, e.target.textContent);
        saveData();
        aggiornaClassifica();
      }
    });

    function aggiornaTurni(match, winnerName) {
        const parentId = match.parentElement.parentElement.id;
        const roundIndex = parseInt(match.dataset.round);
        const matchNum = parseInt(match.dataset.match);

        if (parentId === 'mainBracket') {
            if (roundIndex === 0) { // Quarto → Semifinali
            const target = document.querySelector(`#mainBracket .round:nth-child(2) .match:nth-child(${Math.ceil(matchNum/2)}) .team:nth-child(${matchNum%2===1?1:2})`);
            if (target) target.textContent = winnerName;

            const loserName = [...match.querySelectorAll('.team')].find(t => t.textContent !== winnerName).textContent;
            const consTarget = document.querySelector(`#consolationBracket .round:nth-child(1) .match:nth-child(${Math.ceil(matchNum/2)}) .team:nth-child(${matchNum%2===1?1:2})`);
            if (consTarget && !consTarget.textContent) consTarget.textContent = loserName;

            } else if (roundIndex === 1) { // Semifinali → Finali centrali
            // Differenzia le due semifinali
            const finalsTargets = document.querySelectorAll(`#finals .match`);
            if (matchNum === 1) { // prima semifinale
                finalsTargets[0].querySelectorAll('.team')[0].textContent = winnerName; // 1º-2º
                finalsTargets[1].querySelectorAll('.team')[0].textContent = [...match.querySelectorAll('.team')].find(t => t.textContent !== winnerName).textContent; // 3º-4º
            } else if (matchNum === 2) { // seconda semifinale
                finalsTargets[0].querySelectorAll('.team')[1].textContent = winnerName; // 1º-2º
                finalsTargets[1].querySelectorAll('.team')[1].textContent = [...match.querySelectorAll('.team')].find(t => t.textContent !== winnerName).textContent; // 3º-4º
            }
            }
        } else if (parentId === 'consolationBracket') {
            if (roundIndex === 0) { // Semifinali consolation
            const finalsTargets = document.querySelectorAll(`#finals .match`);
            if (matchNum === 1) { // prima semifinale consolazione
                finalsTargets[2].querySelectorAll('.team')[0].textContent = winnerName; // 5º-6º
                finalsTargets[3].querySelectorAll('.team')[0].textContent = [...match.querySelectorAll('.team')].find(t => t.textContent !== winnerName).textContent; // 7º-8º
            } else if (matchNum === 2) { // seconda semifinale consolazione
                finalsTargets[2].querySelectorAll('.team')[1].textContent = winnerName; // 5º-6º
                finalsTargets[3].querySelectorAll('.team')[1].textContent = [...match.querySelectorAll('.team')].find(t => t.textContent !== winnerName).textContent; // 7º-8º
            }
            }
        }
    }

    function aggiornaClassifica() {
        const tbody = document.querySelector("#classifica tbody");
        tbody.innerHTML = '';
        const finalMatches = document.querySelectorAll("#finals .match");
        const posizioni = ["1º","3º","5º","7º"];
        finalMatches.forEach((match, idx) => {
            const teams = match.querySelectorAll(".team");
            let winner='', loser='';
            if (teams[0].classList.contains('winner')) { winner=teams[0].textContent; loser=teams[1].textContent; }
            else if (teams[1].classList.contains('winner')) { winner=teams[1].textContent; loser=teams[0].textContent; }
            else { winner=teams[0].textContent; loser=teams[1].textContent; } // fallback se non selezionato
            if (winner && loser) {
            tbody.innerHTML += `<tr><td>${posizioni[idx]}</td><td>${winner}</td></tr>`;
            tbody.innerHTML += `<tr><td>${parseInt(posizioni[idx]) +1}º</td><td>${loser}</td></tr>`;
            }
        });
    }

    function exportCSV() {
        let rows = ['MATCHES'];
        rows.push('Disciplina,Turno,Match,Squadra 1,Squadra 2,Vincitore');

        // Sezione match
        document.querySelectorAll(".match").forEach(match => {
            const discipline = match.dataset.discipline;
            const round = match.dataset.round;
            const matchNum = match.dataset.match;
            const teams = match.querySelectorAll('.team');
            const team1 = teams[0].textContent;
            const team2 = teams[1] ? teams[1].textContent : '';
            let winner = '';
            if (teams[0].classList.contains('winner')) winner = team1;
            else if (teams[1].classList.contains('winner')) winner = team2;
            rows.push(`${discipline},${round},${matchNum},${team1},${team2},${winner}`);
        });

        rows.push(''); // Riga vuota per separare
        rows.push('FINAL RANKING');
        rows.push('Posizione,Squadra');

        // Sezione classifica finale
        const finalMatches = document.querySelectorAll("#finals .match");
        const posizioni = ["1º","3º","5º","7º"];
        finalMatches.forEach((match, idx) => {
            const teams = match.querySelectorAll(".team");
            let winner='', loser='';
            if (teams[0].classList.contains('winner')) { winner=teams[0].textContent; loser=teams[1].textContent; }
            else if (teams[1].classList.contains('winner')) { winner=teams[1].textContent; loser=teams[0].textContent; }
            else { winner=teams[0].textContent; loser=teams[1].textContent; } // fallback
            if (winner && loser) {
            rows.push(`${posizioni[idx]},${winner}`);
            rows.push(`${parseInt(posizioni[idx]) +1}º,${loser}`);
            }
        });

        const csvContent = rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'risultati_biliardino.csv';
        a.click();
    }

    const API_URL = "https://script.google.com/macros/s/AKfycbxGojVqt2SFRWbMrzdEWXusTbKRhiy9Gh70US5haxwvYJwSLxrVRYrBdtBYAjPE-u4BtA/exec";

    // 🔹 Carica i dati (tutti li vedono)
    async function loadDataFromSheet() {
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("Dati dal foglio:", data);
    // qui aggiorni i tabelloni con i dati letti
    }

    // 🔹 Salva dati (solo tu, se usi un "codice segreto")
    async function saveMatch(discipline, round, match, team1, team2, winner) {
    const body = { Disciplina: discipline, Round: round, Match: match, Squadra1: team1, Squadra2: team2, Vincitore: winner };

    await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
    });
    }

    window.onload = loadData;
  