/**
 * APP.JS - VERSIONE CORRETTA E COMPLETA
 */

let db = JSON.parse(localStorage.getItem('congregazione_db')) || {
    membri: [],
    gruppi: [],
    statisticheS88: {}, 
    archivio: {}
};

const MESI = ["Settembre", "Ottobre", "Novembre", "Dicembre", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto"];

function saveData() {
    localStorage.setItem('congregazione_db', JSON.stringify(db));
}

// --- GESTIONE MODALE ---
function chiudiModal() {
    document.getElementById('mainModal').classList.add('hidden');
}

function apriModal(html) {
    const modal = document.getElementById('mainModal');
    document.getElementById('modalContent').innerHTML = html + 
        `<button onclick="chiudiModal()" class="w-full mt-6 bg-gray-200 p-3 rounded-xl font-bold text-gray-600">Torna alla Dashboard</button>`;
    modal.classList.remove('hidden');
}

// --- CREAZIONE E MODIFICA PROFILO ---
function apriModalNuovoMembro(idMembro = null) {
    const m = idMembro ? db.membri.find(x => x.id === idMembro) : null;
    const titolo = m ? "Modifica Profilo" : "Nuova Scheda S-21";

    let html = `
    <h2 class="text-2xl font-bold mb-6 text-bordeaux border-b pb-2">${titolo}</h2>
    <form id="formMembro" class="space-y-4 text-left">
        <input type="hidden" id="m_id" value="${m ? m.id : ''}">
        <div>
            <label class="block text-xs font-bold text-gray-500 uppercase">Nome e Cognome</label>
            <input type="text" id="n_nome" value="${m ? m.nome : ''}" class="w-full border-2 border-gray-200 p-3 rounded-lg font-bold outline-none" required>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
            <div class="border p-2 rounded-lg bg-gray-50">
                <label class="text-[10px] font-bold block uppercase text-gray-400">Nascita</label>
                <input type="date" id="n_nascita" value="${m ? m.nascita : ''}" class="w-full bg-transparent">
            </div>
            <div class="border p-2 rounded-lg bg-gray-50">
                <label class="text-[10px] font-bold block uppercase text-gray-400">Battesimo</label>
                <input type="date" id="n_battesimo" value="${m ? m.battesimo : ''}" class="w-full bg-transparent">
            </div>
        </div>

        <div class="p-4 border rounded-xl bg-white space-y-2 text-sm">
            <label class="block text-xs font-bold text-gray-500 uppercase">Incarichi</label>
            <div class="grid grid-cols-2 gap-2">
                <label><input type="checkbox" id="c_anziano" ${m?.anziano?'checked':''}> Anziano</label>
                <label><input type="checkbox" id="c_servitore" ${m?.servitore?'checked':''}> Servitore</label>
                <label><input type="checkbox" id="c_pionR" ${m?.pioniereR?'checked':''}> Pion. Regolare</label>
                <label><input type="checkbox" id="c_pionS" ${m?.pioniereS?'checked':''}> Pion. Speciale</label>
            </div>
        </div>

        <textarea id="n_osservazioni" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm h-24" placeholder="Osservazioni...">${m ? m.osservazioni : ''}</textarea>
        
        <button type="button" onclick="salvaMembro()" class="w-full bg-bordeaux text-white p-4 rounded-xl font-bold">SALVA DATI</button>
        ${m ? `<button type="button" onclick="eliminaMembro(${m.id})" class="w-full mt-2 text-red-500 text-xs font-bold uppercase">Elimina Profilo</button>` : ''}
    </form>`;
    apriModal(html);
}

function salvaMembro() {
    const id = document.getElementById('m_id').value;
    const nome = document.getElementById('n_nome').value;
    if(!nome) return alert("Nome obbligatorio");

    const dati = {
        id: id ? parseInt(id) : Date.now(),
        nome: nome,
        nascita: document.getElementById('n_nascita').value,
        battesimo: document.getElementById('n_battesimo').value,
        anziano: document.getElementById('c_anziano').checked,
        servitore: document.getElementById('c_servitore').checked,
        pioniereR: document.getElementById('c_pionR').checked,
        pioniereS: document.getElementById('c_pionS').checked,
        osservazioni: document.getElementById('n_osservazioni').value,
        rapporti: id ? db.membri.find(x => x.id == id).rapporti : {}
    };

    if(id) {
        const index = db.membri.findIndex(x => x.id == id);
        db.membri[index] = dati;
    } else {
        db.membri.push(dati);
    }

    saveData();
    chiudiModal();
    alert("Dati salvati.");
}

function eliminaMembro(id) {
    if(confirm("Sei sicuro di voler eliminare questo profilo?")) {
        db.membri = db.membri.filter(x => x.id !== id);
        saveData();
        chiudiModal();
    }
}

// --- FUNZIONI PULSANTI DASHBOARD ---
function vaiAElencoProfili() {
    let html = `<h2 class="text-2xl font-bold mb-4 text-bordeaux border-b pb-2">Gestione Membri</h2>
    <p class="text-[10px] text-gray-400 mb-4 uppercase">Clicca sul nome per modificare il profilo o su "Compila" per i rapporti</p>
    <div class="space-y-2">`;
    db.membri.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(m => {
        html += `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <button onclick="apriModalNuovoMembro(${m.id})" class="font-bold text-gray-700 text-left flex-1">${m.nome}</button>
            <button onclick="apriEditorRapporti(${m.id})" class="bg-bordeaux text-white px-4 py-1 rounded-lg text-sm ml-2">Rapporti</button>
        </div>`;
    });
    html += `</div>`;
    apriModal(html);
}

function mostraGestioneGruppi() {
    apriModal(`<h2 class="text-xl font-bold text-bordeaux">Gruppi di Servizio</h2><p class="mt-4 text-gray-500">Funzione in fase di attivazione...</p>`);
}

function mostraPionieri() {
    const pionieri = db.membri.filter(m => m.pioniereR || m.pioniereS);
    let html = `<h2 class="text-xl font-bold text-bordeaux mb-4">Gruppo Pionieri</h2>`;
    if(pionieri.length === 0) html += `<p class="text-gray-500">Nessun pioniere registrato.</p>`;
    else {
        pionieri.forEach(p => {
            html += `<div class="p-2 border-b text-left font-bold text-gray-700">${p.nome}</div>`;
        });
    }
    apriModal(html);
}

// --- EDITOR RAPPORTI ---
function apriEditorRapporti(id) {
    const m = db.membri.find(x => x.id === id);
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux">${m.nome}</h2>
    <div class="space-y-2 max-h-96 overflow-y-auto pr-2">`;
    MESI.forEach(mese => {
        const rap = m.rapporti[mese] || { partecipato: false, ore: '', studi: '' };
        html += `
        <div class="p-3 border rounded-xl bg-white shadow-sm flex items-center justify-between">
            <span class="w-20 text-[10px] font-bold text-gray-500 uppercase">${mese}</span>
            <div class="flex items-center gap-2">
                <input type="checkbox" ${rap.partecipato?'checked':''} onchange="salvaMese(${id},'${mese}','partecipato',this.checked)">
                <input type="number" placeholder="Ore" value="${rap.ore}" class="w-12 border p-1 rounded text-xs" onchange="salvaMese(${id},'${mese}','ore',this.value)">
                <input type="number" placeholder="Studi" value="${rap.studi}" class="w-12 border p-1 rounded text-xs" onchange="salvaMese(${id},'${mese}','studi',this.value)">
            </div>
        </div>`;
    });
    apriModal(html);
}

function salvaMese(id, mese, campo, valore) {
    const m = db.membri.find(x => x.id === id);
    if(!m.rapporti[mese]) m.rapporti[mese] = {};
    m.rapporti[mese][campo] = valore;
    saveData();
}

// --- ALTRE UTILITY ---
function resetTotale() {
    if (confirm("Cancellare tutto?")) { localStorage.removeItem('congregazione_db'); location.reload(); }
}

function esportaBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
}

// Correzione Footer Doppio
document.addEventListener("DOMContentLoaded", () => {
    if(!document.getElementById('app-footer')) {
        const f = document.createElement('footer');
        f.id = 'app-footer';
        f.className = "max-w-4xl mx-auto p-8 flex flex-col items-center gap-4 text-gray-400";
        f.innerHTML = `
            <div class="flex gap-6 text-sm font-medium">
                <button onclick="esportaBackup()">📤 Esporta</button>
                <button onclick="resetTotale()" class="text-red-400">⚠️ Reset</button>
            </div>`;
        document.body.appendChild(f);
    }
});
