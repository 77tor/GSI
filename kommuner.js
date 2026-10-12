/* =========================================================
   KOMMUNER I NORGE (Offisiell liste)
   ========================================================= */

const NORSKE_KOMMUNER = [
  "Alstahaug", "Alta", "Alvdal", "Alver", "Andøy", "Aremark", "Arendal", "Asker", "Askim", "Askøy", 
  "Aukra", "Aure", "Aurland", "Aurskog-Høland", "Austevoll", "Austrheim", "Averøy", "Balsfjord", "Bamble", "Bardu", 
  "Beiarn", "Bergen", "Berlevåg", "Bindal", "Birkenes", "Bjerkreim", "Bjørnafjorden", "Bodø", "Bokn", "Bremanger", 
  "Brønnøy", "Bygland", "Bykle", "Bærum", "Bø", "Bømlo", "Drammen", "Drangedal", "Dyrøy", "Elverum", 
  "Enebakk", "Engerdal", "Etne", "Etnedal", "Evje og Hornnes", "Farsund", "Fauske", "Fedje", "Fitjar", "Fjaler", 
  "Fjord", "Flakstad", "Flatanger", "Flekkefjord", "Flå", "Folldal", "Fredrikstad", "Frogn", "Froland", "Frosta", 
  "Frøya", "Gausdal", "Gildeskål", "Giske", "Gjemnes", "Gjerdrum", "Gjøvik", "Gloppen", "Gol", "Gran", 
  "Grane", "Grimstad", "Grue", "Gulen", "Hadsel", "Halden", "Hamar", "Hammerfest", "Harstad", "Hasvik", 
  "Hattfjelldal", "Haugesund", "Heim", "Hemnes", "Hemsedal", "Herøy (Møre og Romsdal)", "Herøy (Nordland)", "Hitra", "Hjartdal", "Hjelmeland", 
  "Hol", "Hole", "Holtålen", "Horten", "Hurdal", "Hustadvika", "Hvaler", "Hyllestad", "Hægebostad", "Høyanger", 
  "Høylandet", "Ibestad", "Inderøy", "Indre Østfold", "Iveland", "Jevnaker", "Karasjok", "Karlsøy", "Karmøy", "Kautokeino", 
  "Kinn", "Kongsberg", "Kongsvinger", "Kragerø", "Kristiansand", "Kristiansund", "Krødsherad", "Kvam", "Kvinesdal", "Kvinnherad", 
  "Kviteseid", "Kvitsøy", "Kåfjord", "Larvik", "Lebesby", "Leirfjord", "Leka", "Lesja", "Levanger", "Lier", 
  "Lierne", "Lillehammer", "Lillesand", "Lillestrøm", "Lindesnes", "Lom", "Loppa", "Lund", "Lunner", "Lurøy", 
  "Luster", "Lyngdal", "Lyngen", "Lærdal", "Lødingen", "Lørenskog", "Løten", "Malvik", "Marker", "Masfjorden", 
  "Melhus", "Meløy", "Meråker", "Midt-Telemark", "Midtre Gauldal", "Modalen", "Modum", "Molde", "Moskenes", "Moss", 
  "Namsos", "Namsskogan", "Nannestad", "Narvik", "Nesbyen", "Nesna", "Nesodden", "Nisseidal", "Nittedal", "Nordre Follo", 
  "Nordre Land", "Nordreisa", "Nore og Uvdal", "Notodden", "Nærøysund", "Oppdal", "Orkland", "Osen", "Oslo", "Osterøy", 
  "Overhalla", "Porsgrunn", "Rakkestad", "Rana", "Randaberg", "Rauma", "Rendalen", "Rennebu", "Rindal", "Ringebu", 
  "Ringerike", "Ringsaker", "Risør", "Rollag", "Rælingen", "Rødøy", "Røros", "Røst", "Røyrvik", "Råde", 
  "Saltdal", "Samnanger", "Sande", "Sandefjord", "Sandnes", "Sarpsborg", "Sauda", "Sel", "Selbu", "Seljord", 
  "Senja", "Sigdal", "Siljan", "Sirdal", "Skaun", "Skien", "Skiptvet", "Skjervøy", "Skjåk", "Smøla", 
  "Snåsa", "Sogndal", "Sokndal", "Sola", "Solund", "Stad", "Stange", "Stavanger", "Steinkjer", "Stjørdal", 
  "Stord", "Storfjord", "Strand", "Stranda", "Stryn", "Sula", "Suldal", "Sunnfjord", "Sunndal", "Surnadal", 
  "Sveio", "Sykkylven", "Sømna", "Søndre Land", "Sør-Aurdal", "Sør-Fron", "Sør-Odal", "Sør-Varanger", "Sørfold", "Sørreisa", 
  "Tana", "Time", "Tingvoll", "Tinn", "Tjeldsund", "Tokke", "Tolga", "Tromsø", "Trondheim", "Trysil", 
  "Træna", "Tvedestrand", "Tydal", "Tynset", "Tysnes", "Tysvær", "Tønsberg", "Ullensaker", "Ullensvang", "Ulstein", 
  "Ulvik", "Utsira", "Vadsø", "Vaksdal", "Valle", "Vang", "Vanylven", "Vardø", "Vefsn", "Vega", 
  "Vegårshei", "Vennesla", "Verdal", "Vestby", "Vestnes", "Vestre Slidre", "Vestre Toten", "Vestvågøy", "Vevelstad", "Vik", 
  "Vindafjord", "Vinje", "Volda", "Voss", "Værøy", "Vågan", "Våler (Innlandet)", "Våler (Viken)", "Øksnes", "Ørland", 
  "Ørsta", "Østre Toten", "Øvre Eiker", "Øyer", "Øygarden", "Øystre Slidre", "Åfjord", "Ål", "Ålesund", "Åmli", 
  "Åmot", "Årdal", "Ås", "Åseral", "Åsnes"
];

// Generer datalist-elementet i DOM-en når skriptet lastes
function initKommunerDatalist() {
  let datalist = document.getElementById('kommuner-list');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'kommuner-list';
    document.body.appendChild(datalist);
  }

  datalist.innerHTML = NORSKE_KOMMUNER.map(k => `<option value="${k}"></option>`).join('');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKommunerDatalist);
} else {
  initKommunerDatalist();
}