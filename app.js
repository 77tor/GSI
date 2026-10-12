/* =========================================================
   GSI – FUNKSJONER & SKOLEÅRHÅNDTERING
   ========================================================= */

const pages = [
  {id:1,name:'Enhetsopplysninger'},{id:2,name:'Om skolen'},{id:3,name:'Elever og timer'},
  {id:4,name:'Årstimer'},{id:5,name:'Lærere og assistenter'},{id:6,name:'Årsverk og ansatte'},
  {id:7,name:'Individuell tilrettelegging'},{id:8,name:'Særskilt språkopplæring'},{id:9,name:'Opplæringsspråk'},
  {id:10,name:'Fremmedspråk, språklig fordypning og arbeidslivsfag'},{id:11,name:'Valgfag'},
  {id:12,name:'Fysisk aktivitet og leksehjelp'},{id:13,name:'Andre opplysninger'},{id:14,name:'Skolefritidsordningen (SFO)'},
  {id:15,name:'Pedagogisk-psykologisk tjeneste (PPT)'},{id:16,name:'Fordrevne ukrainske elever'},
  {id:17,name:'Kontroller'},{id:18,name:'Fullfør'}
];

let currentPage = 1, formData = {}, saveTimer = null;
let activeSchoolYear = ''; // Holder styr på aktivt år direkte
let isLoadingData = false; // <-- Legg til denne øverst!

/* =========================================================
   HJELPEFUNKSJONER
   ========================================================= */

const parseNum = val => (Number.isFinite(Number.parseFloat(val)) ? Number.parseFloat(val) : 0);
const numberValue = id => parseNum(document.getElementById(id)?.value);

function setNumber(id, value) {
  let n = parseNum(value);

  // Avrund til maks 2 desimaler for å unngå flyttallsfeil (f.eks. 6.0799999999999 -> 6.08)
  n = Math.round((n + Number.EPSILON) * 100) / 100;

  formData[id] = n;
  const el = document.getElementById(id);
  if (el) el.value = n;
}

const sumIds = ids => ids.reduce((sum, id) => sum + numberValue(id), 0);
const rangeIds = (prefix, from, to, suffix = '') => Array.from({ length: to - from + 1 }, (_, i) => `${prefix}${from + i}${suffix}`);
const allFormElements = () => document.querySelectorAll('main input[id], main select[id], main textarea[id], main input[name]');

/* =========================================================
   SKOLEÅR OG HÅNDTERING (SEPARERT & TRYGG LAGRING PER ÅR)
   ========================================================= */

function getActiveSchoolYear() {
  const now = new Date();
  const year = now.getFullYear();
  const startYear = now.getMonth() >= 6 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

const storageKeyFor = (year) => `gsi_data_${year || 'ukjent'}`;

function populateSchoolYears() {
  const select = document.getElementById('year-select');
  if (!select) return;

  const currentSchoolYear = getActiveSchoolYear();
  const [startY] = currentSchoolYear.split('-').map(Number);
  const futureSchoolYear = `${startY + 1}-${startY + 2}`;

  select.innerHTML = `
    <option value="${currentSchoolYear}">${startY}/${startY + 1}</option>
    <option value="${futureSchoolYear}">${startY + 1}/${startY + 2}</option>
  `;

  activeSchoolYear = select.value || currentSchoolYear;
}

function handleYearChange() {
  if (isLoadingData) return;

  // 1. Lagre NÅVÆRENDE data for det året vi FORLATER
  saveDataForYear(activeSchoolYear);

  // 2. Oppdater aktivt skoleår ut fra dropdown
  const select = document.getElementById('year-select');
  if (select) {
    activeSchoolYear = select.value;
  }

  // 3. Last inn data for det nye skoleåret
  loadDataForYear();
}

function saveDataForYear(year) {
  // Blokker lagring dersom data holder på å lastes inn
  if (isLoadingData || !year) return;

  syncInputsToData();
  try {
    localStorage.setItem(storageKeyFor(year), JSON.stringify(formData));
  } catch (err) {
    console.error('Kunne ikke lagre GSI-data:', err);
  }
}

function saveData(showMessage = false) {
  saveDataForYear(activeSchoolYear);
  if (showMessage) showSaveMessage('Endringer ble lagret.');
}

function loadDataForYear() {
  isLoadingData = true; // Sperr lagring mens vi fyller skjermfeltene

  const saved = localStorage.getItem(storageKeyFor(activeSchoolYear));
  try {
    formData = saved ? JSON.parse(saved) || {} : {};
  } catch (err) {
    console.warn('Lagrede data kunne ikke leses.', err);
    formData = {};
  }

  // Tøm dynamiske rader fra Side 9C
  document.querySelectorAll('#page-9 .table-s9-c tbody tr:not(.total-row)').forEach(row => row.remove());

  // Gjenopprett dynamiske rader for side 3E og fyll skjermfelt
  restoreSide3ERows();
  syncDataToInputs();

  // Kjør beregninger uten å utløse lagring
  calculateAll(false);

  // Oppdater grensesnitt
  updateTopbarInfo();
  updateHeading();
  renderSidebar();

  // Åpne for lagring igjen
  setTimeout(() => {
    isLoadingData = false;
  }, 100);
}

function syncInputsToData() {
  if (isLoadingData) return; // Unngå å hente fra tomme/delvis fylte felt under oppstart

  allFormElements().forEach(el => {
    if (el.type === 'file' || (!el.id && !el.name)) return;

    if (['radio', 'checkbox'].includes(el.type)) {
      const key = el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`;
      formData[key] = el.checked;
    } else if (el.id) {
      formData[el.id] = el.value;
    }
  });
}

function restoreSide3ERows() {
  const tbody = document.getElementById('s3_e_tbody');
  if (!tbody) return;

  // Finn høyeste indeks for side 3E i formData for AKTIVT år
  let maxIdx = 0;
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s3_e_kommune_') || key.startsWith('s3_e_elever_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx) && idx > maxIdx) maxIdx = idx;
    }
  });

  const targetCount = Math.max(1, maxIdx);
  tbody.innerHTML = '';
  for (let i = 1; i <= targetCount; i++) {
    if (typeof addRowSide3E === 'function') addRowSide3E();
  }
}

function syncDataToInputs() {
  allFormElements().forEach(el => {
    if (el.type === 'file' || (!el.id && !el.name)) return;

    const isCheck = ['radio', 'checkbox'].includes(el.type);
    const key = isCheck ? (el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`) : el.id;

    if (Object.prototype.hasOwnProperty.call(formData, key)) {
      if (isCheck) {
        el.checked = Boolean(formData[key]);
      } else {
        el.value = formData[key] !== undefined && formData[key] !== null ? formData[key] : '';
      }
    } else {
      // TØM feltet helt dersom dette skoleåret ikke har registrerte verdier
      if (isCheck) {
        el.checked = false;
      } else {
        el.value = '';
      }
    }
  });
}

function autoSave() {
  if (isLoadingData) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveData(false), 300);
}

function calculateAll(saveAfter = false) {
  [calcSide3, calcSide4, calcSide5, calcSide6, calcSide7, calcSide8, calcSide9, calcSide12, calcSide13, calcSide14, calcSide16]
    .forEach(fn => typeof fn === 'function' && fn());

  if (!isLoadingData) {
    syncInputsToData();
  }
  updateTopbarInfo();

  if (saveAfter) saveData(false);
}


/* =========================================================
   SIDEMENY, BEREGNINGER OG BINDINGER
   ========================================================= */

function renderSidebar() {
  const nav = document.getElementById('sidebar-menu');
  if (!nav) return;

  nav.innerHTML = pages.map(p => `
    <a href="#" class="nav-item${p.id === currentPage ? ' active' : ''}" onclick="event.preventDefault(); selectPage(${p.id})">
      <span class="nav-number">${p.id}</span><span>${p.name}</span>
    </a>
  `).join('');
}

function updateHeading() {
  const heading = document.getElementById('page-heading');
  const page = pages.find(p => p.id === currentPage);

  const yearSelect = document.getElementById('year-select');
  const yearText = yearSelect?.selectedOptions[0]?.text || activeSchoolYear;

  const startYear = parseInt(yearText.split('/')[0].split('-')[0], 10) || new Date().getFullYear();
  const colorIndex = (startYear % 6) + 1;
  const themeClass = `year-theme-${colorIndex}`;

  if (heading && page) {
    heading.innerHTML = `
      <div class="heading-left">
        <span>${page.id}. ${page.name}</span>
        <span class="school-year-badge ${themeClass}">Skoleår ${yearText}</span>
        <button class="mini-btn btn-fetch-prev" id="copy-prev-year-btn" type="button" title="Hent registreringer fra forrige skoleår for kun denne siden">
          ⟲ Hent fra forrige år
        </button>
      </div>
    `;

    document.getElementById('copy-prev-year-btn')?.addEventListener('click', copyPreviousYearPageData);
  }
}

function selectPage(id) {
  if (id < 1 || id > 18) return;
  saveData(false);

  currentPage = id;
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', Number(p.dataset.page) === id));

  updateHeading();
  renderSidebar();
  if (id === 17) runValidation(false);
}

const navigatePage = dir => selectPage(currentPage + dir);

function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveData(false), 200);
}

function showSaveMessage(msg) {
  let box = document.getElementById('save-message');
  if (!box) {
    box = document.createElement('div');
    box.id = 'save-message';
    box.className = 'save-message-toast';
    document.body.appendChild(box);
  }
  box.textContent = msg;
  box.style.display = 'block';
  clearTimeout(box._timer);
  box._timer = setTimeout(() => box.style.display = 'none', 1800);
}


/* =========================================================
   OPPDATER TOPPLINJE (USERBOX)
   ========================================================= */

function updateTopbarInfo() {
  // Hent skolenavn fra s1_skole, med fallback
  const schoolInput = document.getElementById('s1_skole');
  const schoolName = schoolInput?.value || formData['s1_skole'] || 'Skolenavn';

  // Hent kommunenavn fra s1_kommunenavn, med fallback
  const muniInput = document.getElementById('s1_kommunenavn');
  const municipality = muniInput?.value || formData['s1_kommunenavn'] || 'Kommune';

  // Hent navn og rolle fra side 18 (sjekker typiske ID-er)
  const userNameInput = document.getElementById('s18_navn') || document.getElementById('s18_a_navn');
  const userName = userNameInput?.value || formData['s18_navn'] || formData['s18_a_navn'] || 'Navn';

  const userRoleInput = document.getElementById('s18_rolle') || document.getElementById('s18_a_rolle');
  const userRole = userRoleInput?.value || formData['s18_rolle'] || formData['s18_a_rolle'] || 'Rolle';

  // Oppdater elementene i userbox
  const elSchool = document.getElementById('topbar-school');
  const elMuni = document.getElementById('topbar-municipality');
  const elName = document.getElementById('topbar-user-name');
  const elRole = document.getElementById('topbar-user-role');

  if (elSchool) elSchool.textContent = schoolName;
  if (elMuni) elMuni.textContent = municipality;
  if (elName) elName.textContent = userName;
  if (elRole) elRole.textContent = userRole;
}


/* =========================================================
   UTSKRIFT OG UTSKRIFTSMODAL
   ========================================================= */

// Hjelpefunksjon for å hente listen over skoleår
function getSchoolYearOptions() {
  const yearSelect = document.getElementById('year-select');
  if (yearSelect && yearSelect.options.length > 0) {
    return Array.from(yearSelect.options).map(opt => ({
      value: opt.value,
      text: opt.text
    }));
  }
  return [{ value: activeSchoolYear, text: activeSchoolYear }];
}

function openPrintModal() {
  const modal = document.getElementById('print-modal');
  const yearSelect = document.getElementById('print-year-select');
  const pagesList = document.getElementById('print-pages-list');

  if (!modal) return;

  // 1. Fyll skoleår
  if (yearSelect) {
    yearSelect.innerHTML = '';
    getSchoolYearOptions().forEach(yr => {
      const opt = document.createElement('option');
      opt.value = yr.value;
      opt.textContent = yr.text;
      if (yr.value === activeSchoolYear) opt.selected = true;
      yearSelect.appendChild(opt);
    });
  }

  // 2. Generer struktur med sider og underseksjoner
  if (pagesList) {
    pagesList.innerHTML = '';
    pages.forEach(p => {
      const pageEl = document.querySelector(`.page[data-page="${p.id}"]`);
      const sections = pageEl ? Array.from(pageEl.querySelectorAll('.section-card')) : [];

      const pageContainer = document.createElement('div');
      pageContainer.className = 'print-page-group';

      let sectionsHTML = '';
      if (sections.length > 0) {
        sectionsHTML = `<div class="print-sections-list">`;
        sections.forEach((sec, idx) => {
          const title = sec.querySelector('.section-header')?.textContent?.trim() || `Del ${idx + 1}`;
          sectionsHTML += `
            <label class="print-sub-item">
              <input type="checkbox" class="print-section-check" data-page="${p.id}" data-section-idx="${idx}" checked>
              <span>${title}</span>
            </label>
          `;
        });
        sectionsHTML += `</div>`;
      }

      pageContainer.innerHTML = `
        <div class="print-page-header">
          <label class="print-page-item">
            <input type="checkbox" class="print-page-check" data-page="${p.id}" checked>
            <span><strong>${p.id}.</strong> ${p.name}</span>
          </label>
          ${sections.length > 0 ? `<button type="button" class="toggle-sub-btn" onclick="this.parentElement.nextElementSibling.classList.toggle('show')">▼ Deloppgaver</button>` : ''}
        </div>
        ${sectionsHTML}
      `;

      pagesList.appendChild(pageContainer);
    });

    // Kobl hovedsjekkboks til alle sine underseksjoner
    pagesList.querySelectorAll('.print-page-check').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const pageId = e.target.getAttribute('data-page');
        const subChecks = pagesList.querySelectorAll(`.print-section-check[data-page="${pageId}"]`);
        subChecks.forEach(sub => sub.checked = e.target.checked);
      });
    });
  }

  modal.style.display = 'flex';
}

function closePrintModal() {
  const modal = document.getElementById('print-modal');
  if (modal) modal.style.display = 'none';
}

function handleStartPrint() {
  const selectedYear = document.getElementById('print-year-select')?.value;
  const isDataMode = document.querySelector('input[name="print-data-mode"]:checked')?.value === 'with-data';
  
  const checkedPageCbs = Array.from(document.querySelectorAll('.print-page-check:checked'));
  const checkedPageIds = checkedPageCbs.map(cb => parseInt(cb.getAttribute('data-page'), 10));

  if (checkedPageIds.length === 0) {
    alert('Vennligst velg minst én side for utskrift.');
    return;
  }

  let printData = {};
  if (isDataMode && selectedYear) {
    const raw = localStorage.getItem(storageKeyFor(selectedYear));
    if (raw) {
      try { printData = JSON.parse(raw) || {}; } catch (e) { printData = {}; }
    }
  }

  const backupFormData = { ...formData };
  const backupPage = currentPage;

  formData = printData;
  syncDataToInputs();
  calculateAll(false);

  const schoolName = formData['s1_skole'] || 'Skole';
  const muniName = formData['s1_kommunenavn'] || 'Kommune';
  const yearText = `Skoleår ${selectedYear ? selectedYear.replace('-', '/') : activeSchoolYear}`;

  // Fjern eventuelle gamle utskriftstopptekster
  document.querySelectorAll('.print-header-instance').forEach(el => el.remove());

  // Styr synlighet for sider og delseksjoner
  document.querySelectorAll('.page').forEach(pageEl => {
    const pageNum = parseInt(pageEl.getAttribute('data-page'), 10);
    const pageObj = pages.find(p => p.id === pageNum);
    const pageTitle = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${pageNum}`;

    pageEl.querySelectorAll('.section-card').forEach(sc => sc.classList.remove('print-section-hidden'));

    if (checkedPageIds.includes(pageNum)) {
      pageEl.classList.add('print-visible');

      // Sett inn en egen topptekst øverst på DENNE siden for utskrift
      const printHeader = document.createElement('div');
      printHeader.className = 'print-header print-header-instance';
      printHeader.innerHTML = `
        <div><strong>${schoolName}</strong> — ${muniName}</div>
        <div><strong>${pageTitle}</strong></div>
        <div>${yearText}</div>
      `;
      pageEl.insertBefore(printHeader, pageEl.firstChild);

      // Skjul delseksjoner som brukeren har valgt bort
      const sections = pageEl.querySelectorAll('.section-card');
      sections.forEach((secEl, idx) => {
        const subCb = document.querySelector(`.print-section-check[data-page="${pageNum}"][data-section-idx="${idx}"]`);
        if (subCb && !subCb.checked) {
          secEl.classList.add('print-section-hidden');
        }
      });

    } else {
      pageEl.classList.remove('print-visible');
    }
  });

  closePrintModal();

  setTimeout(() => {
    window.print();

    // Gjenopprett applikasjonen etter utskrift
    formData = backupFormData;
    syncDataToInputs();
    calculateAll(false);

    document.querySelectorAll('.print-header-instance').forEach(el => el.remove());
    document.querySelectorAll('.page').forEach(pageEl => {
      pageEl.classList.remove('print-visible');
      pageEl.querySelectorAll('.section-card').forEach(sc => sc.classList.remove('print-section-hidden'));
    });

    if (typeof navigateToPage === 'function') navigateToPage(backupPage);
  }, 150);
}

/* =========================================================
   HENT DATA FRA FORRIGE SKOLEÅR (KUN FOR GJELDENDE SIDE)
   ========================================================= */

function copyPreviousYearPageData() {
  // 1. Finne ut hva forrige skoleår er
  const [startY, endY] = activeSchoolYear.split('-').map(Number);
  if (!startY) {
    alert('Ugyldig skoleår valgt.');
    return;
  }
  
  const prevSchoolYear = `${startY - 1}-${endY - 1}`;
  const prevYearDisplay = `${startY - 1}/${endY - 1}`;
  const prevKey = storageKeyFor(prevSchoolYear);

  // 2. Sjekk om det finnes lagrede data for forrige år
  const prevDataRaw = localStorage.getItem(prevKey);
  if (!prevDataRaw) {
    alert(`Fant ingen lagrede data for forrige skoleår (${prevYearDisplay}).`);
    return;
  }

  let prevData = {};
  try {
    prevData = JSON.parse(prevDataRaw) || {};
  } catch (err) {
    alert(`Kunne ikke lese data for skoleåret ${prevYearDisplay}.`);
    return;
  }

  const pageObj = pages.find(p => p.id === currentPage);
  const pageName = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${currentPage}`;

  // 3. Bekreftelse fra bruker
  const confirmCopy = window.confirm(
    `Vil du hente registreringene fra skoleåret ${prevYearDisplay} for "${pageName}"?\n\nNåværende tall/tekst på denne siden vil bli overskrevet.`
  );

  if (!confirmCopy) return;

  // 4. Finn kun felt som tilhører gjeldende side
  const pageEl = document.querySelector(`.page[data-page="${currentPage}"]`);
  if (!pageEl) return;

  const pageInputs = pageEl.querySelectorAll('input[id], select[id], textarea[id], input[name]');
  let copiedCount = 0;

  pageInputs.forEach(el => {
    if (el.type === 'file') return;

    const isCheck = ['radio', 'checkbox'].includes(el.type);
    const key = isCheck ? (el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`) : el.id;

    if (key && Object.prototype.hasOwnProperty.call(prevData, key)) {
      formData[key] = prevData[key];
      copiedCount++;
    }
  });

  if (copiedCount === 0) {
    alert(`Det ble ikke funnet noen lagrede data på ${pageName} for ${prevYearDisplay}.`);
    return;
  }

  // 5. Synkroniser til felt, kjør beregninger og lagre
  syncDataToInputs();
  calculateAll(false);
  saveData(false);

  showSaveMessage(`Data for ${pageName} ble hentet fra ${prevYearDisplay}!`);
}

/* =========================================================
   NULLSTILLING / SLETTING AV DATA
   ========================================================= */

function resetCurrentPageData() {
  const pageObj = pages.find(p => p.id === currentPage);
  const pageName = pageObj ? `${pageObj.id}. ${pageObj.name}` : `Side ${currentPage}`;

  if (!window.confirm(`Er du sikker på at du vil slette alle inndata på "${pageName}"?`)) return;

  // Finn alle input-, select- og textarea-elementer som tilhører aktiv side
  const pageEl = document.querySelector(`.page[data-page="${currentPage}"]`);
  if (!pageEl) return;

  const pageInputs = pageEl.querySelectorAll('input[id], select[id], textarea[id], input[name]');

  pageInputs.forEach(el => {
    if (['radio', 'checkbox'].includes(el.type)) {
      const key = el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`;
      delete formData[key];
      el.checked = false;
    } else if (el.id) {
      delete formData[el.id];
      el.value = ''; // Tømmer feltet helt i stedet for å bruke HTML-defaultValue
    }
  });

  calculateAll(false);
  saveData(false);
  syncDataToInputs(); // Sørger for at skjermen oppdateres umiddelbart
  showSaveMessage(`Innholdet på ${pageName} ble slettet.`);
}

function resetSchoolYearData(keepPage1And2 = true) {
  const currentYearText = document.getElementById('year-select')?.selectedOptions[0]?.text || activeSchoolYear;
  
  const msg = keepPage1And2
    ? `Er du sikker på at du vil slette registreringene for ${currentYearText}?\n\nSide 1 og 2 (Enhetsopplysninger og Om skolen) vil BLI BEVART.`
    : `Er du sikker på at du vil slette ABSOLUTT ALT for skoleåret ${currentYearText} (inkludert side 1 og 2)?`;

  if (!window.confirm(msg)) return;

  if (keepPage1And2) {
    // Bevar kun nøkler som tilhører side 1 og side 2
    const preservedData = {};
    
    // Hent elementer fra side 1 og 2
    const page1and2Elements = document.querySelectorAll('.page[data-page="1"] [id], .page[data-page="2"] [id]');
    const preservedKeys = new Set();
    
    page1and2Elements.forEach(el => {
      if (['radio', 'checkbox'].includes(el.type)) {
        preservedKeys.add(el.id ? `${el.id}__checked` : `${el.name}_${el.value}__checked`);
      } else if (el.id) {
        preservedKeys.add(el.id);
      }
    });

    preservedKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(formData, key)) {
        preservedData[key] = formData[key];
      }
    });

    formData = preservedData;
  } else {
    // Tøm alt
    formData = {};
  }

  // Slett dynamiske rader
  document.querySelectorAll('#page-9 .table-s9-c tbody tr:not(.total-row)').forEach(row => row.remove());

  // Oppdater skjermbilde og lagre
  syncDataToInputs();
  calculateAll(false);
  saveData(false);

  showSaveMessage(keepPage1And2 ? `Skoleåret ${currentYearText} ble nullstilt (beholdt side 1 & 2).` : `Alt for ${currentYearText} ble slettet.`);
}

function handleResetSelect(event) {
  const action = event.target.value;
  if (!action) return;

  if (action === 'page') {
    resetCurrentPageData();
  } else if (action === 'year_keep_1_2') {
    resetSchoolYearData(true);
  } else if (action === 'year_all') {
    resetSchoolYearData(false);
  }

  // Tilbakestill valgmenyen til overskriften "Nullstill..."
  event.target.value = '';
}

/* =========================================================
   EKSPORT OG IMPORT (JSON)
   ========================================================= */

function exportJSON() {
  syncInputsToData();

  // Bygg et komplett objekt med metadata og data for gjeldende skoleår
  const exportPayload = {
    schoolYear: activeSchoolYear,
    exportedAt: new Date().toISOString(),
    formData: formData
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
  const downloadAnchor = document.createElement('a');
  
  // Generer filnavn, f.eks. "GSI_data_2026-2027.json"
  const fileName = `GSI_data_${activeSchoolYear}.json`;

  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showSaveMessage(`Data for ${activeSchoolYear} ble eksportert!`);
}

function importJSON(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);

      // Sjekk om filen har riktig struktur (enten direkte object eller med payload-wrapper)
      const newFormData = imported.formData || imported;

      if (typeof newFormData !== 'object' || newFormData === null) {
        throw new Error('Ugyldig filformat.');
      }

      const confirmImport = window.confirm(
        `Vil du importere dataene fra filen "${file.name}" into skoleåret ${activeSchoolYear}?\n\nNåværende registrerte data for dette året vil bli overskrevet.`
      );

      if (!confirmImport) return;

      formData = newFormData;
      
      // Lagre de nye dataene for det aktive skoleåret
      saveDataForYear(activeSchoolYear);

      // Synkroniser til skjerm og beregn på nytt
      syncDataToInputs();
      calculateAll(false);

      showSaveMessage(`Data ble importert fra ${file.name}!`);
    } catch (err) {
      console.error('Feil ved import:', err);
      alert('Kunne ikke importere filen. Sjekk at det er en gyldig GSI JSON-fil.');
    } finally {
      // Tilbakestill file-input slik at samme fil kan velges på nytt om ønskelig
      event.target.value = '';
    }
  };

  reader.readAsText(file);
}

/* =========================================================
   SIDE 3 TIL 16 BEREGNINGSFUNKSJONER
   ========================================================= */

function calcSide3() {
  // A, B, C beregninger
  for (let t = 1; t <= 10; t++) setNumber(`s3_a_${t}_sum`, numberValue(`s3_a_${t}_gutter`) + numberValue(`s3_a_${t}_jenter`));
  ['gutter', 'jenter', 'sum'].forEach(sfx => {
    setNumber(`s3_a_sum17_${sfx}`, sumIds(rangeIds('s3_a_', 1, 7, `_${sfx}`)));
    setNumber(`s3_a_sum810_${sfx}`, sumIds(rangeIds('s3_a_', 8, 10, `_${sfx}`)));
    setNumber(`s3_a_total_${sfx === 'sum' ? '' : sfx}`.replace(/_$/, ''), numberValue(`s3_a_sum17_${sfx}`) + numberValue(`s3_a_sum810_${sfx}`));
  });
  setNumber('s3_b_sum17', sumIds(rangeIds('s3_b_', 1, 7)));
  setNumber('s3_b_sum810', sumIds(rangeIds('s3_b_', 8, 10)));
  setNumber('s3_b_total', numberValue('s3_b_sum17') + numberValue('s3_b_sum810'));
  setNumber('s3_c_sum', sumIds(rangeIds('s3_c_', 1, 10)));

  // BEREGNING FOR DEL E: Sum av elever fra andre kommuner
  let totalEleverE = 0;
  const tbody = document.getElementById('s3_e_tbody');
  if (tbody) {
    tbody.querySelectorAll('input[type="number"]').forEach(input => {
      totalEleverE += (parseInt(input.value, 10) || 0);
    });
  }
  setNumber('s3_e_total', totalEleverE);
}

// Liste over norske kommuner for GSI (alfabetisk)
const NORWEGIAN_MUNICIPALITIES = [
  "Agdenes", "Agder fylkeskommune", "Akershus fylkeskommune", "Alstahaug", "Alta", "Alvdal", "Alver", "Andebu", "Andøy",
  "Aremark", "Arendal", "Asker", "Askim", "Askvoll", "Askøy", "Aukra", "Aure", "Aurland", "Aurskog-Høland", "Austevoll",
  "Austrheim", "Averøy", "Balestrand", "Ballangen", "Balsfjord", "Bamble", "Bardu", "Beiarn", "Berg", "Bergen", "Berlevåg",
  "Bindal", "Birkenes", "Bjerkreim", "Bjørnafjorden", "Bodhø", "Bokn", "Bremanger", "Brønnøy", "Bygland", "Bykle", "Bærum",
  "Bø", "Bømlo", "Båtsfjord", "Dovre", "Drammen", "Drangedal", "Dyrøy", "Dønna", "Eid", "Eidsberg", "Eidfjord", "Eidsvoll",
  "Eigersund", "Elverum", "Enebakk", "Engerdal", "Etne", "Etnedal", "Evje og Hornnes", "Farsund", "Fauske", "Fedje", "Fitjar",
  "Fjaler", "Fjord", "Flakstad", "Flatanger", "Flekkefjord", "Flå", "Folldal", "Fredrikstad", "Frogn", "Froland", "Frosta",
  "Frøya", "Fyresdal", "Færder", "Gáivuotna - Kåfjord", "Gausdal", "Gildeskål", "Giske", "Gjemnes", "Gjerdrum", "Gjøvik",
  "Gloppen", "Gol", "Gran", "Grane", "Granvin", "Gratangen", "Grimstad", "Grue", "Gulen", "Hadsel", "Halden", "Hamar",
  "Hamarøy", "Hammerfest", "Harstad", "Hasvik", "Hattfjelldal", "Haugesund", "Heim", "Hemnes", "Hemsedal", "Herøy", "Hitra",
  "Hjartdal", "Hjelmeland", "Hobøl", "Hol", "Hole", "Holtålen", "Horten", "Hurdal", "Hustadvika", "Hvaler", "Hyllestad",
  "Hå", "Ibestad", "Inderøy", "Indre Fosen", "Indre Østfold", "Iveland", "Jevnaker", "Karasjok", "Karlsøy", "Karmøy",
  "Kautokeino", "Kinn", "Klep", "Kongsberg", "Kongsvinger", "Kragero", "Kristiansand", "Kristiansund", "Krødsherad",
  "Kvam", "Kvinesdal", "Kvinnherad", "Kvitesseid", "Kvitsøy", "Kvæfjord", "Kvænangen", "Kåfjord", "Larvik", "Leka",
  "Lenvik", "Lesja", "Levanger", "Lier", "Lierne", "Lillehammer", "Lillesand", "Lillestrøm", "Lindesnes", "Lom", "Loppa",
  "Lund", "Lúnner", "Lurøy", "Luster", "Lyngdal", "Lyngen", "Lærdal", "Lødingen", "Lørenskog", "Løten", "Malvik", "Marker",
  "Masfjorden", "Melhus", "Meløy", "Meråker", "Midt-Telemark", "Midtre Gauldal", "Modum", "Molde", "Moskenes", "Moss",
  "Nærøysund", "Namsos", "Namsskogan", "Nannestad", "Narvik", "Nes", "Nesna", "Nesodden", "Nissedal", "Nittedal",
  "Nome", "Nord-Aurdal", "Nord-Fron", "Nord-Odal", "Nordkapp", "Nordre Land", "Nordre Follo", "Nordreisa", "Nore og Uvdal",
  "Notodden", "Nærøy", "Oppdal", "Orkland", "Os", "Osen", "Oslo", "Osterøy", "Overhalla", "Pasvik", "Porsgrunn", "Rakkestad",
  "Rana", "Randaberg", "Rauma", "Rendalen", "Renesøy", "Rindal", "Ringebu", "Ringerike", "Ringsaker", "Risør", "Rode",
  "Rollag", "Rælingen", "Rødøy", "Røros", "Røst", "Røyrvik", "Råde", "Saltdal", "Samnanger", "Sande", "Sandefjord",
  "Sandnes", "Sarpsborg", "Sauda", "Sel", "Selbu", "Selje", "Seljord", "Senja", "Sigdal", "Siljan", "Sirdal", "Skaun",
  "Skien", "Skiptvet", "Skjervøy", "Skjåk", "Smøla", "Snåsa", "Sogndal", "Sokndal", "Sola", "Solund", "Somna", "Songdalen",
  "Sortland", "Stavanger", "Steinkjer", "Stjørdal", "Stord", "Stordal", "Storfjord", "Strand", "Stranda", "Stryn",
  "Sula", "Suldal", "Sunndal", "Sunnfjord", "Surnadal", "Sveio", "Svelvik", "Sykkylven", "Sømna", "Søndre Land", "Sør-Aurdal",
  "Sør-Fron", "Sør-Odal", "Sør-Varanger", "Sørfold", "Sørreisa", "Sørum", "Tana", "Time", "Tingvoll", "Tinn", "Tjeldsund",
  "Tokke", "Tolga", "Tromsø", "Trondheim", "Trysil", "Træna", "Tvedestrand", "Tydal", "Tynset", "Tysnes", "Tysvær",
  "Ullensvang", "Ullensaker", "Ulstein", "Ulvik", "Vadsø", "Vaksdal", "Valalle", "Valle", "Vang", "Vanylven", "Vardø",
  "Vefsn", "Vega", "Vegårshei", "Vennesla", "Verdal", "Vestby", "Vestnes", "Vestre Slidre", "Vestre Toten", "Vestvågøy",
  "Vevelstad", "Vik", "Vikna", "Vindafjord", "Vinje", "Volda", "Voss", "Værøy", "Vågan", "Vågå", "Våler", "Øksnes",
  "Ørland", "Ørsta", "Østre Toten", "Øvre Eiker", "Øyer", "Øygarden", "Øystre Slidre", "Åfjord", "Ål", "Ålesund",
  "Åmli", "Åmot", "Årdal", "Ås", "Åseral", "Åsnes"
];

function getMunicipalityOptionsHTML() {
  let html = `<option value="">Legg til</option>`;
  NORWEGIAN_MUNICIPALITIES.forEach(muni => {
    html += `<option value="${muni}">${muni}</option>`;
  });
  return html;
}

function addRowSide3E() {
  const tbody = document.getElementById('s3_e_tbody');
  if (!tbody) return;

  const currentRows = tbody.querySelectorAll('tr').length;
  const newIndex = currentRows + 1;

  const newRow = document.createElement('tr');
  newRow.setAttribute('data-s3e-idx', newIndex);
  newRow.innerHTML = `
    <td class="row-no-cell">${newIndex}</td>
    <td>
      <select id="s3_e_kommune_${newIndex}" class="gsi-select">
        ${getMunicipalityOptionsHTML()}
      </select>
    </td>
    <td>
      <input id="s3_e_elever_${newIndex}" type="number" min="0" placeholder="0">
    </td>
    <td style="text-align:center; vertical-align:middle;">
      <button type="button" class="btn-delete-row" onclick="deleteRowSide3E(this)" title="Slett rad">⊗</button>
    </td>
  `;

  tbody.appendChild(newRow);

  newRow.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', () => { calculateAll(false); autoSave(); });
    el.addEventListener('input', () => { calculateAll(false); autoSave(); });
  });

  updateSide3ERowNumbers();
  calculateAll(false);
}

function deleteRowSide3E(btnEl) {
  const tr = btnEl.closest('tr');
  if (!tr) return;

  tr.querySelectorAll('input[id], select[id]').forEach(el => {
    delete formData[el.id];
  });

  tr.remove();
  updateSide3ERowNumbers();
  calculateAll(false);
  autoSave();
}

function updateSide3ERowNumbers() {
  const tbody = document.getElementById('s3_e_tbody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach((row, idx) => {
    const num = idx + 1;
    const cell = row.querySelector('.row-no-cell');
    if (cell) cell.textContent = num;
  });

  const sumRowNoCell = document.getElementById('s3_e_sum_row_no');
  if (sumRowNoCell) {
    sumRowNoCell.textContent = rows.length + 1;
  }
}

function restoreSide3ERows() {
  const tbody = document.getElementById('s3_e_tbody');
  if (!tbody) return;

  let maxIdx = 0;
  Object.keys(formData).forEach(key => {
    if (key.startsWith('s3_e_kommune_') || key.startsWith('s3_e_elever_')) {
      const idx = parseInt(key.split('_').pop(), 10);
      if (!isNaN(idx) && idx > maxIdx) maxIdx = idx;
    }
  });

  const targetCount = Math.max(1, maxIdx);
  tbody.innerHTML = '';
  for (let i = 1; i <= targetCount; i++) {
    addRowSide3E();
  }
}

function calcSide4() {
  // 1. DEL 4A: Beregn vannrette summer (1.-7. trinn og Sum 1.-10. trinn)
  [1, 2].forEach(r => {
    const sum17 = numberValue(`s4_a${r}_1`) + numberValue(`s4_a${r}_2`);
    setNumber(`s4_a${r}_17`, sum17);

    const sumTotal = sum17 + numberValue(`s4_a${r}_3`);
    setNumber(`s4_a${r}_sum`, sumTotal);
  });

  // Rad 3 i 4A: Sum årstimer som gis til undervisning (Rad 1 + Rad 2 loddrett)
  const cols4A = ['1', '2', '17', '3', 'sum'];
  cols4A.forEach(col => {
    setNumber(`s4_a3_${col}`, numberValue(`s4_a1_${col}`) + numberValue(`s4_a2_${col}`));
  });

  // 2. DEL 4B: Spesialundervisning og andre timer (Summer rader og kolonner)
  for (let r = 1; r <= 12; r++) {
    setNumber(`s4_b${r}_17`, numberValue(`s4_b${r}_1`) + numberValue(`s4_b${r}_2`));
    setNumber(`s4_b${r}_sum`, numberValue(`s4_b${r}_17`) + numberValue(`s4_b${r}_3`));
  }

  // Rad 13 i 4B: Sum av rad 1-12 loddrett
  [1, 2, 3].forEach(c => {
    setNumber(`s4_b13_${c}`, sumIds(rangeIds('s4_b', 1, 12, `_${c}`)));
  });
  setNumber('s4_b13_17', numberValue('s4_b13_1') + numberValue('s4_b13_2'));
  setNumber('s4_b13_sum', numberValue('s4_b13_17') + numberValue('s4_b13_3'));

  // 3. DEL 4C: Ordinær undervisning (4A Rad 3 minus 4B Rad 13)
  cols4A.forEach(col => {
    const a3Val = numberValue(`s4_a3_${col}`);
    const b13Val = numberValue(`s4_b13_${col}`);
    setNumber(`s4_c_${col}`, Math.max(0, a3Val - b13Val));
  });

  // 4. DEL 4D & 4E: Øvrige beregninger
  setNumber('s4_d_sum', numberValue('s4_d_17') + numberValue('s4_d_3'));
  ['e1', 'e2', 'e3', 'e4', 'e6'].forEach(row => setNumber(`s4_${row}_sum`, sumIds(rangeIds(`s4_${row}_`, 1, 3))));
  [1, 2, 3].forEach(col => setNumber(`s4_e5_${col}`, sumIds([1, 2, 3, 4].map(r => `s4_e${r}_${col}`))));
  setNumber('s4_e5_sum', sumIds(['s4_e5_1', 's4_e5_2', 's4_e5_3']));
}

function calcSide5() {
  ['a1', 'a2'].forEach(row => {
    const trinn = numberValue(`s5_${row}_14`) + numberValue(`s5_${row}_57`) + numberValue(`s5_${row}_810`);
    const kjonn = numberValue(`s5_${row}_m`) + numberValue(`s5_${row}_k`);
    setNumber(`s5_${row}_sum`, trinn > 0 ? trinn : kjonn);
  });
  ['b1', 'b2', 'b3', 'f'].forEach(r => setNumber(`s5_${r}_sum`, numberValue(`s5_${r}_m`) + numberValue(`s5_${r}_k`)));
  ['c1', 'c2'].forEach(r => setNumber(`s5_${r}_sum`, numberValue(`s5_${r}_17`) + numberValue(`s5_${r}_810`)));
  for (let r = 1; r <= 5; r++) {
    setNumber(`s5_d${r}_17sum`, numberValue(`s5_d${r}_1730`) + numberValue(`s5_d${r}_170`));
    setNumber(`s5_d${r}_810sum`, numberValue(`s5_d${r}_81060`) + numberValue(`s5_d${r}_8103059`) + numberValue(`s5_d${r}_810029`));
  }
  setNumber('s5_e_sum', numberValue('s5_e1') + numberValue('s5_e2') + numberValue('s5_e3'));
}

function calcSide6() {
  const calcYears = (timer, rammeKey) => numberValue(rammeKey) > 0 ? Math.round((timer / numberValue(rammeKey)) * 100) / 100 : 0;
  setNumber('s6_a_sum', numberValue('s6_a1') + numberValue('s6_a2'));
  const c14 = calcYears(numberValue('s4_c_1') + numberValue('s4_b13_1'), 's6_b_17');
  const c57 = calcYears(numberValue('s4_c_2') + numberValue('s4_b13_2'), 's6_b_17');
  const c810 = calcYears(numberValue('s4_c_3') + numberValue('s4_b13_3'), 's6_b_810');
  setNumber('s6_c_14', c14);
  setNumber('s6_c_57', c57);
  setNumber('s6_c_810', c810);
  setNumber('s6_c_sum', Math.round((c14 + c57 + c810) * 100) / 100);
}

function calcSide7() {
  const sumGJ = prefix => setNumber(`${prefix}_sum`, numberValue(`${prefix}_g`) + numberValue(`${prefix}_j`));
  let [totG, totJ] = [0, 0];
  for (let t = 1; t <= 10; t++) {
    const [g, j] = [numberValue(`s7_a${t}_g`), numberValue(`s7_a${t}_j`)];
    setNumber(`s7_a${t}_sum`, g + j);
    totG += g; totJ += j;
  }
  setNumber('s7_a_gsum', totG);
  setNumber('s7_a_jsum', totJ);
  setNumber('s7_a_tot', totG + totJ);

  for (let r = 1; r <= 2; r++) {
    const ito = numberValue(`s7_b${r}_ito_g`) + numberValue(`s7_b${r}_ito_j`);
    const uten = numberValue(`s7_b${r}_uten_g`) + numberValue(`s7_b${r}_uten_j`);
    setNumber(`s7_b${r}_ito_sum`, ito);
    setNumber(`s7_b${r}_uten_sum`, uten);
    setNumber(`s7_b${r}_tot`, ito + uten);
  }
  ['c', 'd'].forEach(sumGJ);
  [1, 2, 3, 4].forEach(r => ['e', 'f', 'g'].forEach(sec => sumGJ(`s7_${sec}${r}`)));
  ['14', '57', '810', 'g', 'j'].forEach(sfx => setNumber(`s7_f5_${sfx}`, sumIds([1, 2, 3, 4].map(r => `s7_f${r}_${sfx}`))));
  sumGJ('s7_f5');
  setNumber('s7_g5_g', sumIds([1, 2, 3, 4].map(r => `s7_g${r}_g`)));
  setNumber('s7_g5_j', sumIds([1, 2, 3, 4].map(r => `s7_g${r}_j`)));
  sumGJ('s7_g5');
}

function calcSide8() {
  setNumber('s8_a_norsk_sum', sumIds(rangeIds('s8_a', 1, 10, '_norsk')));
  setNumber('s8_a_gno_sum', sumIds(rangeIds('s8_a', 1, 10, '_gno')));
  ['b1', 'b2'].forEach(row => setNumber(`s8_${row}_sum`, numberValue(`s8_${row}_g`) + numberValue(`s8_${row}_j`)));
  setNumber('s8_c1_sum', sumIds(['s8_c1_morsmal', 's8_c1_tosprak', 's8_c1_begge', 's8_c1_annen']));
}

function calcSide9() {
  for (let t = 1; t <= 10; t++) {
    setNumber(`s9_a${t}_sum`, sumIds(['bokmal', 'nynorsk', 'samisk', 'andre'].map(s => `s9_a${t}_${s}`)));
    setNumber(`s9_a${t}_elevtall`, numberValue(`s3_a_${t}_sum`));
  }
  ['bokmal', 'nynorsk', 'samisk', 'andre', 'sum'].forEach(sfx => setNumber(`s9_a_sum_${sfx}`, sumIds(rangeIds('s9_a', 1, 10, `_${sfx}`))));
  setNumber('s9_a_elevtall_sum', numberValue('s3_a_total'));
  calcSide9C();
  [1, 2, 3].forEach(r => setNumber(`s9_d${r}_sum`, sumIds(['14', '57', '810'].map(col => `s9_d${r}_${col}`))));
  ['14', '57', '810', 'sum'].forEach(col => setNumber(`s9_d3_${col}`, numberValue(`s9_d1_${col}`) + numberValue(`s9_d2_${col}`)));
}

function calcSide9C() {
  const totals = Array(10).fill(0);
  document.querySelectorAll('#page-9 .table-s9-c tbody tr:not(.total-row)').forEach(row => {
    row.querySelectorAll('input[type="number"]').forEach((input, i) => {
      if (i < 10) totals[i] += Number.parseFloat(input.value) || 0;
    });
  });
  totals.forEach((tot, i) => setNumber(`s9_c_${i + 1}`, tot));
  setNumber('s9_c_sum', totals.reduce((a, b) => a + b, 0));
}

function calcSide12() {
  ['students', 'hours'].forEach(type => setNumber(`s12_c_${type}_sum`, sumIds(rangeIds('s12_c_', 1, 10, `_${type}`))));
}

function calcSide13() {
  setNumber('s13_a_sum', numberValue('s13_a_1') + numberValue('s13_a_2'));
  [1, 2, 3, 4].forEach(col => setNumber(`s13_c_sum_${col}`, sumIds(rangeIds('s13_c_', 1, 10, `_${col}`))));
  [1, 2, 3, 4, 5].forEach(r => setNumber(`s13_e_${r}_sum`, sumIds(rangeIds(`s13_e_${r}_`, 1, 10))));
  for (let t = 1; t <= 10; t++) {
    setNumber(`s13_e_total_${t}`, sumIds([1, 2, 3, 4, 5].map(r => `s13_e_${r}_${t}`)));
    setNumber(`s13_e_students_${t}`, numberValue(`s3_a_${t}_sum`));
  }
  setNumber('s13_e_total_sum', sumIds(rangeIds('s13_e_total_', 1, 10)));
  setNumber('s13_e_students_sum', numberValue('s3_a_total'));
  [1, 2].forEach(r => setNumber(`s13_g_${r}_sum`, sumIds([8, 9, 10].map(t => `s13_g_${r}_${t}`))));
  [8, 9, 10].forEach(t => setNumber(`s13_g_sum_${t}`, numberValue(`s13_g_1_${t}`) + numberValue(`s13_g_2_${t}`)));
  setNumber('s13_g_total', numberValue('s13_g_sum_8') + numberValue('s13_g_sum_9') + numberValue('s13_g_sum_10'));
}

function calcSide14() {
  [1, 2].forEach(c => {
    setNumber(`s14_a_sum_${c}`, sumIds(rangeIds('s14_a_', 1, 5, `_${c}`)));
    setNumber(`s14_e_sum_${c}`, sumIds(rangeIds('s14_e_', 1, 4, `_${c}`)));
  });
  [1, 2, 3].forEach(r => setNumber(`s14_b_${r}_sum`, numberValue(`s14_b_${r}_m`) + numberValue(`s14_b_${r}_k`)));
  ['m', 'k', 'sum', 'year'].forEach(sfx => {
    const key = sfx === 'sum' ? 'total' : sfx;
    setNumber(`s14_b_sum_${key}`, sumIds([1, 2, 3].map(r => `s14_b_${r}_${sfx}`)));
  });
}

function calcSide16() {
  for (let t = 1; t <= 10; t++) setNumber(`s16_a_${t}_sum`, numberValue(`s16_a_${t}_1`) + numberValue(`s16_a_${t}_2`));
  ['1', '2', 'sum'].forEach(sfx => setNumber(`s16_a_total_${sfx}`, sumIds(rangeIds('s16_a_', 1, 10, `_${sfx}`))));
  setNumber('s16_d_sum', sumIds([1, 2, 3, 4].map(r => `s16_d_${r}`)));
}

/* =========================================================
   HENDELSER OG OPPSTART
   ========================================================= */

function bindEvents() {
  const on = (id, event, fn) => document.getElementById(id)?.addEventListener(event, fn);

  // Skoleår og verktøy
  on('year-select', 'change', handleYearChange);
  on('validate-btn', 'click', () => runValidation(true));
  on('export-btn', 'click', typeof exportJSON === 'function' ? exportJSON : null);
  on('import-file', 'change', typeof importJSON === 'function' ? importJSON : null);
  on('s3_e_add_row', 'click', addRowSide3E);
  on('reset-select', 'change', handleResetSelect);

// Hamburgermeny (Plassert helt til høyre, med robust valghåndtering)
  const toolsBtn = document.getElementById('tools-menu-btn');
  const toolsDropdown = document.getElementById('tools-dropdown');

  if (toolsBtn && toolsDropdown) {
    // Apne / Lukk ved klikk på hamburgermenyknappen
    toolsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toolsDropdown.classList.toggle('show');
    });

    // Forhindre at klikk inne i menyen (f.eks. når du åpner select-boksen) lukker panelet
    toolsDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Lukker menyen KUN når du klikker på vanlige knapper
    toolsDropdown.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        toolsDropdown.classList.remove('show');
      });
    });

    // Lukker menyen KUN etter at et nullstillingsvalg faktis er utført
    const resetSelect = document.getElementById('reset-select');
    if (resetSelect) {
      resetSelect.addEventListener('change', () => {
        toolsDropdown.classList.remove('show');
      });
    }

    // Lukker menyen dersom du klikker et annet sted på skjermen
    document.addEventListener('click', () => {
      toolsDropdown.classList.remove('show');
    });
  }

  // Utskrift-modal
  on('print-modal-btn', 'click', openPrintModal);
  on('close-print-modal', 'click', closePrintModal);
  on('cancel-print', 'click', closePrintModal);
  on('start-print-btn', 'click', handleStartPrint);

  on('print-select-all', 'click', () => {
    document.querySelectorAll('.print-page-check').forEach(cb => cb.checked = true);
  });
  on('print-deselect-all', 'click', () => {
    document.querySelectorAll('.print-page-check').forEach(cb => cb.checked = false);
  });

  // Navigasjon og manuell lagring
  document.querySelectorAll('[data-nav="prev"]').forEach(b => b.addEventListener('click', () => navigatePage(-1)));
  document.querySelectorAll('[data-nav="next"]').forEach(b => b.addEventListener('click', () => navigatePage(1)));
  document.querySelectorAll('[data-save],#save-1').forEach(b => b.addEventListener('click', () => saveData(true)));

  // Automatisk lagring ved skriving i felter
  allFormElements().forEach(el => {
    const evt = ['radio', 'checkbox'].includes(el.type) || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (!isLoadingData) {
        calculateAll(false);
        autoSave();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateSchoolYears();
  bindEvents();
  loadDataForYear();
});