/* =========================================================
   GSI SPRÅKLISTE (sprak.js) - Komplett fra originalskjema
   ========================================================= */

const GSI_SPRAK_LISTE = [
  "Abkhasisk", "Addouma", "Adja", "Adygelsk", "Afrikaans", "Aizo", "Akan (Twi)", "Albansk", "Amharisk", "Annet",
  "Arabisk", "Armensk", "Aseri-Tyrkisk", "Assamesisk", "Avar", "Aymara", "Aserbajdsjansk", "Bahasa Indonesia",
  "Balante", "Baluchi", "Bambara", "Bamileke", "Bariba", "Basiri", "Basjkirsk", "Baskisk", "Bassa", "Bella",
  "Bemba", "Bengali", "Berbersk", "Beriberi-Manga", "Bete", "Beti", "Bhilodi", "Bhojpuru", "Bhutia", "Bihari",
  "Bikol", "Bissa", "Bobo", "Bosnisk", "Brahui", "Bubi", "Bulgarsk", "Bullom", "Bulu", "Burjatisk",
  "Burmesisk", "Cebuano", "Chichewa", "Crioulo", "Dagestansk", "Damara", "Danakil", "Dansk", "Darginsk", "Dari",
  "Dey", "Diola", "Divehi", "Djerma", "Dogon", "Duala", "Dzhongkha", "Engelsk", "Eshira", "Estlandsk",
  "Ewe", "Fang", "Fiji", "Filippinsk", "Finsk", "Flamsk", "Fon", "Fransk", "Friulisk", "Fulani",
  "Fulfulde", "Færøysk", "Ga-Adangbe", "Galicisk", "Garo", "Gbandi", "Georgisk", "Gio", "Gola", "Gourmantché",
  "Gourounsi", "Grebo", "Gresk", "Grønlandsk", "Guarani", "Gujarati", "Gurage", "Guri/Adsjarisk", "Gurma", "Gusii",
  "Gælisisk", "Hakka", "Hassanya", "Hausa", "Hebraisk", "Herero", "Hiligaynon", "Hindi", "Hunanesisk", "Hviterussisk",
  "Iban", "Ibo", "Ilocano", "Ingusjisk", "Irsk", "Islandsk", "Italiensk", "Jakutisk", "Japansk", "Kabardinsk",
  "Kabre", "Kalenjin", "Kamba", "Kannada", "Kantonesisk", "Karakalpakisk", "Karen", "Kasakhisk", "Kashin", "Kashmirsk",
  "Katalansk", "Kavango", "Khanti", "Khasi", "Khmer", "Khoi-San", "Kikongo", "Kikuyu", "Kiluba", "Kimbundu",
  "Kinesisk", "Kinyarwanda", "Kirgisisk", "Kirundi", "Kissi", "Komi", "Kongo", "Koniagi", "Konkani", "Kono",
  "Koranko", "Koreansk", "Kpelle", "Krahn", "Kreol", "Krio", "Kroatisk", "Kru", "Kurdisk (Kurmanji/Sorani)", "Ladino",
  "Lak", "Lao", "Latvisk", "Lepcha", "Lesgisk", "Limba", "Limboo", "Lingala", "Litauisk", "Lobi-Dagari",
  "Loma", "Lorma", "Lozi", "Luganda", "Luhya", "Lunda", "Luo", "Luri", "Luvale", "Maban",
  "Madagassisk", "Maithili", "Makedonsk", "Makua/Lomwe", "Malawi", "Malayalam", "Malayisk", "Malinke", "Maltesisk", "Mandé",
  "Mandingo", "Mandjako", "Manipuru", "Mano", "Mansi", "Marathi", "Mari", "Massi", "Mende", "Meru",
  "Mijikenda", "Min", "Mine", "Miri", "Miskito", "Mizo", "Moldavisk", "Mole-Dagbane", "Mongolsk", "Monokutuba",
  "Mordvinsk", "Moru", "Mossi", "Naga", "Nahuatl", "Nama", "Ndebele", "Nederlandsk", "Nenets", "Nepali",
  "Newari", "Niloti", "Nyanja", "Oriya", "Oromo", "Ossetisk", "Ovambo", "Pahari", "Pashto", "Pepel",
  "Persisk(Farsi/Iran)", "Polsk", "Portugisisk", "Punjabi", "Quechua", "Rajasthani", "Romanes", "Romani", "Romansh", "Rumensk",
  "Russisk", "Sango", "Sanskrit", "Sao", "Sarakole", "Sénoufo", "Serbisk", "Serer", "Sesotho", "Setswana",
  "Shona", "Sindhi", "Singalesisk", "Siswati", "Slovakisk", "Slovensk", "Somalisk", "Somba", "Songhai", "Soninke",
  "Spansk", "Suno", "Susu", "Svensk", "Swahili", "Syriac - Assyrisk", "Tadsjikisk", "Tamil", "Tatarisk", "Telugu",
  "Tem", "Temne", "Thai", "Thonga", "Tibetansk", "Tigrè", "Tigrinia", "Tikar", "Tonga", "Tripuri",
  "Tsjekkisk", "Tsjetsjensk", "Tsjuktsjisk", "Tsjuvasjisk", "Tuareg", "Tukulor", "Tulu", "Turkmensk", "Tuvinsk", "Tyrkisk",
  "Tysk", "Udmurtisk", "Ujgurisk", "Ukrainsk", "Umbundu", "Ungarsk", "Urdu", "Usbekisk", "Vai", "Vietnamesisk",
  "Watusi", "Wolof", "Xhosa", "Yao", "Yoruba", "Zulu"
];

function initSprakDatalist() {
  let datalist = document.getElementById('sprak-list');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'sprak-list';
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = GSI_SPRAK_LISTE.map(s => `<option value="${s}">`).join('');
}

document.addEventListener('DOMContentLoaded', initSprakDatalist);

/* =========================================================
   SAMISKE SPRÅK, KVENSK OG FINSK (Side 9C)
   ========================================================= */

const GSI_SAMISK_SPRAK_LISTE = [
  "Nordsamisk som førstespråk",
  "Nordsamisk som andrespråk 2",
  "Nordsamisk som andrespråk 3",
  "Sørsamisk som førstespråk",
  "Sørsamisk som andrespråk 2",
  "Sørsamisk som andrespråk 3",
  "Lulesamisk som førstespråk",
  "Lulesamisk som andrespråk 2",
  "Lulesamisk som andrespråk 3",
  "Finsk som andrespråk",
  "Kvensk som andrespråk"
];

function initSamiskSprakDatalist() {
  let datalist = document.getElementById('samisk-sprak-list');
  if (!datalist) {
    datalist = document.createElement('datalist');
    datalist.id = 'samisk-sprak-list';
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = GSI_SAMISK_SPRAK_LISTE.map(s => `<option value="${s}">`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof initSprakDatalist === 'function') initSprakDatalist();
  initSamiskSprakDatalist();
});