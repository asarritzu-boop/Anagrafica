/**
 * APP.JS - VERSIONE INTEGRALE CON GESTIONE GRUPPI AVANZATA
 */

let db = JSON.parse(localStorage.getItem('congregazione_db')) || {
    membri: [],
    gruppi: [], // Ogni gruppo: { id, nome, sorvegliante }
    statisticheS88: {}, 
    archivio: {}
};

const MESI = ["Settembre", "Ottobre", "Novembre", "Dicembre", "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto"];

function saveData() {
    localStorage.setItem('congregazione_db', JSON.stringify(db));
}

// --- UTILITY UI ---
function chiudiModal() {
    document.getElementById('mainModal').classList.add('hidden');
}

function apriModal(html) {
    const modal = document.getElementById('mainModal');
    document.getElementById('modalContent').innerHTML = html + 
        `<button onclick="chiudiModal()" class="w-full mt-6 bg-gray-200 p-3 rounded-xl font-bold text-gray-600">Torna alla Dashboard</button>`;
    modal.classList.remove('hidden');
}

// --- GESTIONE GRUPPI (MENU PRINCIPALE) ---
function mostraGestioneGruppi() {
    let html = `
    <h2 class="text-2xl font-bold mb-6 text-bordeaux border-b pb-2 text-center">Gruppi di Servizio</h2>
    <div class="grid grid-cols-1 gap-4">
        <button onclick="apriModalNuovoGruppo()" class="p-4 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition shadow-sm">
            <span class="text-2xl">➕</span>
            <div class="text-left"><p class="font-bold">Crea Nuovo Gruppo</p><p class="text-xs text-gray-400 uppercase">Aggiungi un nuovo gruppo</p></div>
        </button>
        <button onclick="elencoGruppi()" class="p-4 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition shadow-sm">
            <span class="text-2xl">👥</span>
            <div class="text-left"><p class="font-bold">Visualizza Gruppi</p><p class="text-xs text-gray-400 uppercase">Gestisci membri e sorveglianti</p></div>
        </button>
        <button onclick="apriCercaGruppo()" class="p-4 bg-white border-2 border-gray-100 rounded-2xl flex items-center gap-4 hover:bg-gray-50 transition shadow-sm">
            <span class="text-2xl">🔍</span>
            <div class="text-left"><p class="font-bold">Cerca Gruppo</p><p class="text-xs text-gray-400 uppercase">Per numero o sorvegliante</p></div>
        </button>
    </div>`;
    apriModal(html);
}

// --- CREA GRUPPO ---
function apriModalNuovoGruppo() {
    let html = `
    <h2 class="text-xl font-bold mb-4 text-bordeaux">Nuovo Gruppo</h2>
    <div class="space-y-4 text-left">
        <div>
            <label class="block text-xs font-bold text-gray-400 uppercase">Numero o Nome Gruppo</label>
            <input type="text" id="g_nome" placeholder="Es: Gruppo 1" class="w-full border p-3 rounded-xl font-bold outline-none focus:border-bordeaux">
        </div>
        <div>
            <label class="block text-xs font-bold text-gray-400 uppercase">Sorvegliante di Gruppo</label>
            <input type="text" id="g_sorv" placeholder="Nome del sorvegliante" class="w-full border p-3 rounded-xl font-bold outline-none focus:border-bordeaux">
        </div>
        <button onclick="salvaGruppo()" class="w-full bg-bordeaux text-white p-4 rounded-xl font-bold shadow-lg">SALVA GRUPPO</button>
    </div>`;
    apriModal(html);
}

function salvaGruppo() {
    const nome = document.getElementById('g_nome').value;
    const sorv = document.getElementById('g_sorv').value;
    if(!nome) return alert("Inserisci almeno il nome del gruppo");
    
    db.gruppi.push({ id: Date.now(), nome: nome, sorvegliante: sorv });
    saveData();
    mostraGestioneGruppi();
}

// --- VISUALIZZA / ELENCO GRUPPI ---
function elencoGruppi() {
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux text-center">Tutti i Gruppi</h2><div class="space-y-3">`;
    if(db.gruppi.length === 0) html += `<p class="text-center text-gray-400">Nessun gruppo creato.</p>`;
    
    db.gruppi.forEach(g => {
        const membriCount = db.membri.filter(m => m.gruppoId == g.id).length;
        html += `
        <div class="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
            <div class="text-left">
                <p class="font-bold text-gray-800">${g.nome}</p>
                <p class="text-[10px] text-gray-500 uppercase">Sorv: ${g.sorvegliante || 'Non assegnato'}</p>
                <p class="text-[10px] font-bold text-bordeaux uppercase">Membri: ${membriCount}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="gestisciMembriGruppo(${g.id})" class="bg-gray-200 p-2 rounded-lg text-xs">👥 Membri</button>
                <button onclick="alert('Download PDF Gruppo...')" class="bg-green-600 text-white p-2 rounded-lg text-xs">📥</button>
                <button onclick="eliminaGruppo(${g.id})" class="text-red-400 p-2 text-xs">🗑️</button>
            </div>
        </div>`;
    });
    html += `</div>`;
    apriModal(html);
}

// --- CERCA GRUPPO ---
function apriCercaGruppo() {
    let html = `
    <h2 class="text-xl font-bold mb-4 text-bordeaux">Cerca Gruppo</h2>
    <input type="text" id="search_input" onkeyup="filtraGruppi()" placeholder="Cerca numero o sorvegliante..." class="w-full border p-3 rounded-xl mb-4 outline-none focus:border-bordeaux">
    <div id="risultati_ricerca" class="space-y-2"></div>`;
    apriModal(html);
    filtraGruppi(); // Mostra tutti all'inizio
}

function filtraGruppi() {
    const query = document.getElementById('search_input').value.toLowerCase();
    const container = document.getElementById('risultati_ricerca');
    const filtrati = db.gruppi.filter(g => g.nome.toLowerCase().includes(query) || g.sorvegliante.toLowerCase().includes(query));
    
    container.innerHTML = filtrati.map(g => `
        <div class="p-3 bg-gray-50 rounded-xl border flex justify-between items-center">
            <span class="font-bold">${g.nome} (${g.sorvegliante})</span>
            <button onclick="gestisciMembriGruppo(${g.id})" class="text-bordeaux font-bold text-xs uppercase">Vedi</button>
        </div>
    `).join('');
}

// --- ASSEGNAZIONE MEMBRI AI GRUPPI ---
function gestisciMembriGruppo(gruppoId) {
    const gruppo = db.gruppi.find(g => g.id == gruppoId);
    let html = `<h2 class="text-xl font-bold mb-2 text-bordeaux">${gruppo.nome}</h2>
    <p class="text-[10px] text-gray-400 uppercase mb-4">Seleziona i membri da includere</p>
    <div class="space-y-1 max-h-80 overflow-y-auto pr-2">`;

    db.membri.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(m => {
        const isChecked = m.gruppoId == gruppoId;
        html += `
        <label class="flex justify-between items-center p-2 border-b text-sm">
            <span>${m.nome}</span>
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="toggleMembroInGruppo(${m.id}, ${gruppoId})">
        </label>`;
    });

    html += `</div>`;
    apriModal(html);
}

function toggleMembroInGruppo(membroId, gruppoId) {
    const m = db.membri.find(x => x.id == membroId);
    if(m.gruppoId == gruppoId) {
        m.gruppoId = null; // Rimuovi
    } else {
        m.gruppoId = gruppoId; // Assegna
    }
    saveData();
}

function eliminaGruppo(id) {
    if(confirm("Eliminare questo gruppo? I membri non verranno cancellati, solo rimossi dal gruppo.")) {
        db.membri.forEach(m => { if(m.gruppoId == id) m.gruppoId = null; });
        db.gruppi = db.gruppi.filter(g => g.id !== id);
        saveData();
        elencoGruppi();
    }
}

// --- FUNZIONI MEMBRI / S-21 ---
function apriModalNuovoMembro(idMembro = null) {
    const m = idMembro ? db.membri.find(x => x.id === idMembro) : null;
    let html = `
    <h2 class="text-2xl font-bold mb-6 text-bordeaux border-b pb-2">${m ? 'Modifica' : 'Nuova Scheda S-21'}</h2>
    <form id="formMembro" class="space-y-4 text-left">
        <input type="hidden" id="m_id" value="${m ? m.id : ''}">
        <div>
            <label class="text-[10px] font-bold text-gray-400 uppercase">Nome e Cognome</label>
            <input type="text" id="n_nome" value="${m ? m.nome : ''}" class="w-full border-2 border-gray-100 p-3 rounded-xl font-bold outline-none focus:border-bordeaux" required>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="border p-2 rounded-xl">
                <label class="text-[10px] font-bold text-gray-400 block uppercase">Nascita</label>
                <input type="date" id="n_nascita" value="${m ? m.nascita : ''}" class="w-full bg-transparent">
            </div>
            <div class="border p-2 rounded-xl">
                <label class="text-[10px] font-bold text-gray-400 block uppercase">Battesimo</label>
                <input type="date" id="n_battesimo" value="${m ? m.battesimo : ''}" class="w-full bg-transparent">
            </div>
        </div>
        <div class="p-4 border rounded-xl space-y-2 text-sm">
            <label class="block text-xs font-bold text-gray-400 uppercase">Privilegi</label>
            <div class="grid grid-cols-2 gap-2">
                <label><input type="checkbox" id="c_anziano" ${m?.anziano?'checked':''}> Anziano</label>
                <label><input type="checkbox" id="c_servitore" ${m?.servitore?'checked':''}> Servitore</label>
                <label><input type="checkbox" id="c_pionR" ${m?.pioniereR?'checked':''}> Pion. Reg.</label>
                <label><input type="checkbox" id="c_pionS" ${m?.pioniereS?'checked':''}> Pion. Spec.</label>
            </div>
        </div>
        <textarea id="n_osservazioni" class="w-full border p-3 rounded-xl text-sm h-24" placeholder="Osservazioni...">${m ? m.osservazioni : ''}</textarea>
        <button type="button" onclick="salvaMembro()" class="w-full bg-bordeaux text-white p-4 rounded-xl font-bold">SALVA PROFILO</button>
        ${m ? `<button type="button" onclick="eliminaMembro(${m.id})" class="w-full mt-2 text-red-500 text-[10px] font-bold uppercase">🗑️ Elimina Definitivamente</button>` : ''}
    </form>`;
    apriModal(html);
}

function salvaMembro() {
    const id = document.getElementById('m_id').value;
    const nome = document.getElementById('n_nome').value;
    if(!nome) return alert("Inserisci il nome");

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
        gruppoId: id ? db.membri.find(x => x.id == id).gruppoId : null,
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
}

function vaiAElencoProfili() {
    let html = `<h2 class="text-2xl font-bold mb-4 text-bordeaux border-b pb-2 text-center">Tutti i Membri</h2>
    <div class="space-y-2">`;
    db.membri.sort((a,b) => a.nome.localeCompare(b.nome)).forEach(m => {
        html += `
        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
            <button onclick="apriModalNuovoMembro(${m.id})" class="font-bold text-gray-700 text-left flex-1">${m.nome}</button>
            <button onclick="apriEditorRapporti(${m.id})" class="bg-bordeaux text-white px-4 py-1 rounded-lg text-sm ml-2">Rapporti</button>
        </div>`;
    });
    html += `</div>`;
    apriModal(html);
}

// --- RESTO DELLE FUNZIONI (EDITOR, BACKUP, RESET) ---
function apriEditorRapporti(id) {
    const m = db.membri.find(x => x.id === id);
    let html = `<h2 class="text-xl font-bold mb-4 text-bordeaux text-center">${m.nome}</h2>
    <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2">`;
    MESI.forEach(mese => {
        const rap = m.rapporti[mese] || { partecipato: false, ore: '', studi: '' };
        html += `
        <div class="p-3 border rounded-xl bg-white flex items-center justify-between">
            <span class="w-20 text-[10px] font-bold text-gray-400 uppercase">${mese}</span>
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

function esportaBackup() {
    const blob = new Blob([JSON.stringify(db)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_congregazione_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function resetTotale() {
    if (confirm("Attenzione! Questo cancellerà TUTTI i dati. Continuare?")) {
        localStorage.removeItem('congregazione_db');
        location.reload();
    }
}

// --- FOOTER DINAMICO ---
document.addEventListener("DOMContentLoaded", () => {
    if(!document.getElementById('app-footer')) {
        const f = document.createElement('footer');
        f.id = 'app-footer';
        f.className = "max-w-4xl mx-auto p-12 flex flex-col items-center gap-4 text-gray-400";
        f.innerHTML = `
            <div class="flex gap-6 text-sm font-medium">
                <button onclick="esportaBackup()" class="hover:text-bordeaux">📤 Esporta</button>
                <button onclick="resetTotale()" class="text-red-300">⚠️ Reset</button>
            </div>
            <p class="text-[9px] uppercase tracking-widest">Database locale: I dati restano solo sul tuo dispositivo</p>`;
        document.body.appendChild(f);
    }
});
                   
