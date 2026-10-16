/* =========================================================
   GSI INFO-TEKSTER OG DIALOG-HÅNDTERING (FULLSTENDIG 1–18)
   ========================================================= */

const gsiInfoTexts = {
  // ---------------------------------------------------------
  // SIDE 1: ENHETSOPPLYSNINGER
  // ---------------------------------------------------------
  "s1_a": {
    title: "1A. Enhet",
    text: `Til skolene som skal registrere:
Adresser på de enheter som ligger i Nasjonalt Skoleregister (http://nsr.udir.no/), vil automatisk bli hentet inn i GSI. Det er derfor ikke mulig å endre adressedata direkte i skjema. Hvis adressedata skal endres, må det gis en melding til SSB/Brønnøysund om dette (Forsiden - Brønnøysundregistrene). Deretter overføres data til NSR, og neste dag vil GSI hente data fra NSR. Data skal da være oppdatert i GSI.

Til skoleeier/kommune:
De fleste opplysningene registreres på skolenivå. Det som er registrert på skolene skal ikke registreres på kommunen sentralt, siden det blir dobbeltregistrering. Opplysninger om PPT (i del 15) fylles imidlertid ut på kommunen sentralt. Det kan også være andre opplysninger som ikke passer å registrere på skolenivå, for eksempel registrerer noen kommuner lærerressurser til særskilt språkopplæring på kommunen sentralt i stedet for på skolenivå.

I de kommuner hvor midlertidige mottaksklasser er opprettet, kan elevene registreres på kommunen sentralt om det ikke er naturlig at de registreres et annet sted (så lenge elevene har rett på grunnskoleopplæring). Vi gjør oppmerksom på at det er fortsatt telledato 1. oktober som gjelder.`
  },

  // ---------------------------------------------------------
  // SIDE 2: OM SKOLEN
  // ---------------------------------------------------------
  "s2_a": {
    title: "2A. Skolens målform",
    text: "Her registrerer skolen målform eller opplæringsspråk. Internasjonale skoler kan krysse av for «annet»."
  },
  "s2_b": {
    title: "2B. Hva er normalt laveste trinn ved skolen?",
    text: `Her registreres laveste trinn på skolen.
Hvis en barneskole ikke har elever på 1. trinn akkurat dette ene skoleåret, registreres likevel 1. trinn som laveste årstrinn.`
  },
  "s2_c": {
    title: "2C. Hva er normalt høyeste trinn ved skolen?",
    text: `Her registreres høyeste trinn på skolen.
Hvis en barneskole ikke har elever på 7. trinn akkurat dette ene skoleåret, registreres likevel 7. trinn som høyeste årstrinn.`
  },
  "s2_d": {
    title: "2D. Har skolen tilbud om SFO?",
    text: "Her skal man registrere \"Ja\" dersom man har tilbud om SFO. Dette uavhengig av om elevene benytter seg av tilbudet."
  },

  // ---------------------------------------------------------
  // SIDE 3: ELEVER OG TIMER
  // ---------------------------------------------------------
  "s3_a": {
    title: "3A. Elever per trinn",
    text: `Skoler oppgir kun elever som er registrert ved skolen per 1. oktober. Elever som har et delt undervisningstilbud mellom flere skoler, fylles ut der de er registrert/innskrevet. Elever som registreres i del 7 eller 8, må også registreres i del 3 ved samme skole. For eksempel: Hvis en elev får individuell tilrettelegging på en annen skole, skal eleven likevel føres i del 7 på skolen der eleven er registrert i del 3.

Kommunen sentralt oppgir kun elever som ikke er registrert ved noen skole. Kommunen er ansvarlig for å påse at riktig antall elever er ført.`
  },
  "s3_b": {
    title: "3B. Undervisningstimer",
    text: `Under "Undervisningstimer" oppgir skolen elevtimer, det vil si hvor mange årstimer elevene får på hvert årstrinn. Dette summeres opp til et totalt timetall for 1.-7. årstrinn, 8.-10. årstrinn og totalt for skolen. Timetallet er fastsatt som 60 minutters enheter. Kommunene kan fatte vedtak om at det skal gis undervisningstid ut over minstetimetallet. Det er skolens reelle undervisningstimetall som skal oppgis, ikke det forskriftsfestede.

Timetallet skal føres opp for alle årstrinn som skolen normalt har elever på, uansett om elevene går i aldersblandede grupper eller ikke. Hvis en barneskole underviser elever på 4. og 5. årstrinn sammen, skal både timetallet som gis til elevene på 4. årstrinn og til elevene på 5. årstrinn, føres opp. Hvis en ren ungdomsskole pleier å ha elever på 8. årstrinn, men ikke har det akkurat dette skoleåret, skal den føre opp det normale årstimetallet for elever på 8. årstrinn.

Følgende fordeling av undervisningstimetallet er fastsatt: 1.-7. årstrinn = 5196 timer. 8.-10. årstrinn = 2622 timer.

Udir-1-2026 gir oversikt over fag- og timefordelingen.

For privatskoler må skolens timetallsfordeling være i samsvar med den fag- og timefordelingen som skolen har fått godkjent av Utdanningsdirektoratet.
Desimaler må rundes av. Der dette fører til en time for lite, kan det føres en ekstra time på ett av årstrinnene, så lenge totaltimetallet for skolen blir riktig.

76 timer til fysisk aktivitet kommer i tillegg og skal føres i del 12. Fysisk aktivitet og leksehjelp.

Elevtall og timetallsfordeling er med i beregningen av gruppestørrelse 2.`
  },
  "s3_c": {
    title: "3C. Asylsøkere",
    text: `Her registreres antall asylsøkere i opplæringspliktig alder som bor i mottak eller omsorgssenter og som mottar grunnskoleopplæring. Fylles ut av den skolen/institusjonen hvor eleven går. Asylsøkere skal også registreres i 3A. (dvs. at de registreres sammen med alle elever ved skolen).

Fordrevne fra Ukraina, som har kollektiv beskyttelse, skal ikke registreres som asylsøkere her.`
  },
  "s3_d": {
    title: "3D. Elever med tegnspråk og punktskriftopplæring",
    text: `Elever som er blinde eller sterkt svaksynte har rett til nødvendig opplæring i punktskrift. Her føres antall elever som har vedtak om opplæring i punktskrift, jf. opplæringsloven § 3-5.

Fylles ut av den skolen hvor eleven går. Eleven skal også registreres i 3A ved samme skole.`
  },
  "s3_e": {
    title: "3E. Finansiering fra annen kommune",
    text: `Skolen/institusjonen/kommunen skal registrere hvor mange elever som blir finansiert av en annen kommune, for eksempel elever som er fosterhjemsplassert fra en annen kommune.

Skolen elevene går på (ev. kommunen dersom undervisningen foregår sentralt), skal føre kommunen som er økonomisk ansvarlig for eleven i 3F. Kommunen er ansvarlig for å påse at antall elever finansiert av en annen kommune verken blir underrapportert eller talt opp dobbelt i GSI.`
  },
  "s3_f": {
    title: "3F. Hjemmeundervisning",
    text: `Opplysninger om antall elever som får privat grunnskoleopplæring i hjemmet innenfor rikets grenser pr 1. oktober, skal fylles ut av skolen eller kommunen sentralt, avhengig av hvem som har ansvaret og har tilgang på tallene.

Hjemmeundervisning gjelder elever som er tatt ut av skolen for å motta sin opplæring av foresatte, etter § 22-5 i opplæringsloven. Undervisning som foregår hjemme, men som kommunen har ansvaret for på grunn av sykdom e.l., er ikke regnet som hjemmeundervisning i denne sammenheng, og skal ikke føres her.
Kommunen er ansvarlig for å påse at antall som får hjemmeundervisning i kommunen, verken blir underrapportert eller registrert dobbelt.
Elever/barn i 3F kommer i tillegg til elevene oppgitt i linje 3A.`
  },
  "s3_g": {
    title: "3G. Elever som ikke har møtt ved skolestart",
    text: `Alle barn som er bosatt i Norge, har rett og plikt til grunnskoleopplæring etter opplæringsloven § 2-1 og § 2-2.

Dersom skolen finner eleven i Norge uten opplæring, eller skolen ikke finner eleven, skal eleven telles med. Dersom skolen kjenner til at eleven er i utlandet, skal eleven ikke telles med. Kun de med udokumentert fravær skal registreres.

Kommunens plikt til å oppfylle elevers rett til grunnskoleopplæring omhandles i opplæringsloven § 28-1. Tilsvarende bestemmelse finnes i privatskoleloven § 5-2, annet ledd.`
  },

  // ---------------------------------------------------------
  // SIDE 4: ÅRSTIMER
  // ---------------------------------------------------------
  "s4_a": {
    title: "4A. Årstimer til undervisning totalt",
    text: `Alle årstimer til undervisning skal føres i 60 minutters enheter.

I linje 1 føres antall lærertimer som gis til undervisning ved skolen inneværende skoleår av undervisningspersonale som oppfyller kompetansekravene for tilsetting jf. opplæringsloven § 17-3 og privatskoleloven § 4-2. Det er kun fullført utdanning som skal registreres.

I linje 2 føres antall lærertimer som gis til undervisning ved skolen inneværende skoleår av undervisningspersonale som ikke oppfyller kompetansekravene for tilsetting jf. opplæringsloven § 17-3 og privatskoleloven § 4-2.

I linje 3 vises summen av alle årstimer som brukes til undervisning. 

Se forskrift til opplæringsloven § 12-2, § 12-3 og § 12-5 for hvilke utdanninger som er godkjent for tilsetting per i dag.

Dersom årstimer gis samtidig til elever fra flere årstrinn, skal årstimene føres på det høyeste årstrinnet. På fådelte skoler kan man se vekk fra denne regelen i de tilfeller det skaper et urealistisk bilde av undervisningsressursene på skolen. Det er viktig at summen av lærertimer fra 1.-10. trinn blir riktig.

Lærerne er underlagt de kompetansekravene som gjaldt da de var ferdig utdannet. Det vil si at alle som var kvalifisert for ansettelse i stillingen da de fullførte utdannelsen sin, skal føres på undervisningspersonale som oppfyller kompetansekravene for tilsetting.

Timer til fysisk aktivitet skal ikke føres her, men i del 12. Fysisk aktivitet og leksehjelp. Timer til leksehjelp skal ikke føres i del 4. Årstimer.

Dersom assistenter utfører undervisningsoppgaver, regnes de som undervisningspersonell som ikke oppfyller kompetansekravene for tilsetting. De føres da i linje 2 og ikke i 4E.`
  },
  "s4_b": {
    title: "4B. Årstimer til individuelt tilrettelagt opplæring, særskilt språkopplæring og andre ressurser",
    text: `Linje 1: Her føres antall timer som går til individuelt tilrettelagt opplæring, jf. opplæringsloven § 11-6 og privatskoleloven § 3-6. Årstimer i egne skoler for ITO og egne grupper for ITO ved ordinære grunnskoler skal registreres her. Dersom tre elever i en klasse har vedtak på tre timer med individuelt tilrettelagt opplæring hver og undervises i en gruppe, skal det føres tre timer med undervisningspersonale.

Linje 2: Dersom undervisning gitt etter læreplan i grunnleggende norsk for språklige minoriteter, eller i form av særskilt tilpasning innenfor den ordinære læreplanen, medfører ekstra gruppedeling i norsk, skal timene føres her. Hvis undervisningen foregår sentralisert i kommunen, registreres årstimene på kommunens sentrale ressurser.

Linje 3: Morsmålsopplæring er undervisning i elevens morsmål som blir gitt til elever med et annet morsmål enn norsk og samisk utover det ordinære undervisningstimetallet. Årstimene til morsmålsopplæringen skal vanligvis føres på den skolen hvor undervisningen gis. Dersom en morsmålslærer underviser ved flere skoler, skal lærerens årstimer deles og føres opp på de enkelte skolene. Dersom morsmålsopplæringen ved flere skoler er samlet ved en enkelt skole, føres alle årstimene til morsmålsopplæring på denne skolen. Hvis morsmålsundervisningen foregår sentralisert i kommunen, registreres årstimene på kommunens sentrale ressurser.

Linje 4: Tospråklig opplæring i fag er den opplæring som skjer innenfor det ordinære undervisningstimetallet og hvor elevens morsmål benyttes i opplæringen, enten alene eller sammen med norsk (for eksempel matematikkundervisning gitt på urdu). Hvis undervisningen foregår sentralisert i kommunen, registreres årstimene på kommunens sentrale ressurser.

Linje 5: Her føres timer når kommunen ikke kan skaffe lærere på morsmålet som kan gi morsmålsopplæring og/eller tospråklig opplæring i fag.

Linje 6: Her føres årstimer til undervisning i samisk som førstespråk (Samisk 1) eller andrespråk (Samisk 2/Samisk 3) som fører til ekstra undervisningsressurser, jf. opplæringsloven § 3-2. Ressursene til undervisning i samisk skal registreres på skolen/enheten som gir undervisningen. Dette for å unngå at ressurser registreres dobbelt. Timer til fordypning i samisk som fremmedspråk skal ikke føres her. Elever som får opplæring i samisk, registreres i del 9, og elever med fordypning i samisk registreres i del 10. Dette feltet er med i beregningen av gruppestørrelse 2.

Linje 7: Her føres årstimer til undervisning på samisk som fører til ekstra undervisning av en elev, eller at det opprettes egen elevgruppe, jf. opplæringsloven § 3-2. Gruppedeling etter opplæringsloven § 3-2 trenger ikke å føre til at det totale antall grupper ved skolen blir høyere. Det er de ekstra årstimene når det er dannet ekstra grupper i tillegg til de skolen ellers ville hatt, som skal føres her. Ressursene til undervisning på samisk skal registreres på skolen/enheten som gir undervisningen. Dette feltet er med i beregningen av gruppestørrelse 2.

Linje 8: Gruppedeling etter målform trenger ikke å føre til at det totale antall grupper ved skolen blir høyere. Det er kun de ekstra ressurser når det er dannet grupper etter opplæringsloven § 3-1 tredje ledd i tillegg til de skolen ellers ville hatt, eller ekstra ressurser til enkeltelever/elever etter § 3-1 fjerde ledd, som skal telles her. Dette feltet er med i beregningen av gruppestørrelse 2.

Linje 9: Årstimer til kvensk som andrespråk etter opplæringsloven § 3-3 skal registreres her. Antall elever som får opplæring i kvensk som andrespråk, føres i del 9.

Linje 10: Årstimer til finsk som andrespråk etter opplæringsloven § 3-3 skal registreres her. Antall elever som får opplæring i finsk som andrespråk, føres i del 9.

Linje 11: Her føres timer til opplæring i og på norsk tegnspråk, jf. opplæringsloven § 3-4.

Linje 12: Her føres timer til opplæring i punktskrift for elever som har enkeltvedtak om punktskriftopplæring, jf. opplæringsloven § 3-5.`
  },
  "s4_c": {
    title: "4C. Årstimer til ordinær undervisning",
    text: `Tallet viser antall årstimer som brukes til undervisning i ordinær undervisning. Tallet som kommer fram her, regnes ut på følgende måte:
  Det totale antall lærertimer i 4A
- Antall lærertimer som er knyttet til elever med individuelt tilrettelagt opplæring og særskilt språkopplæring og andre ressurser i 4B
= Årstimer til ordinær undervisning

Disse feltene er med i beregningen av gruppestørrelse 2.`
  },
  "s4_d": {
    title: "4D. Årstimer til andre oppgaver utført av undervisningspersonale",
    text: `Her føres årstimer til reduksjon i årsrammen til undervisning på grunn av andre oppgaver.

Eksempler på oppgaver som kan føre til fratrekk i undervisningsplikten er:
- kontaktlærerfunksjon
- seniortiltak
- tidsressurspott
- pedagogisk veiledning og utviklingsarbeid
- vikartimer som en del av stillingen til lærere tilsatt ved skolen (beredskapsressurser)
- elevrådskontakt - hvis dette er en lærer
- lokalt fastsatte funksjoner som tillitsvalgte og lignende
- fjernundervisning eller annen undervisning til elever ved andre skoler
- tilsyn av elever som får hjemmeundervisning
- sosialpedagogisk rådgiver - hvis dette er en lærer
- utdannings- og yrkesrådgiver - hvis dette er en lærer
- annet pedagogisk arbeid for å fylle opp stillingens årsramme for leseplikttid.

Timer til fysisk aktivitet skal føres i del 12. Timer til leksehjelp skal ikke føres i del 4.

For lærere som både underviser på barne- og ungdomstrinnet, fordeles timene skjønnsmessig mellom 1.-7. trinn og 8.-10. trinn. I tilfeller der en slik fordeling ikke er mulig/hensiktsmessig, føres timene på det høyeste trinnet.`
  },
  "s4_e": {
    title: "4E. Årstimer til elevrettet arbeid utført av assistenter og annet personale",
    text: `Her føres årstimer utført av assistenter og annet elevrettet arbeid. Dersom en skole har omgjort tildelte lærertimer til assistenttimer, skal disse registreres her. Dersom assistenter utfører undervisningsoppgaver, regnes de ikke som assistenter, men som undervisningspersonell uten godkjent utdanning for de fag/trinn de underviser på. Årstimene skal da føres som "Årstimer til undervisning" i 4A.

Tid til assistenter som bare utfører helsetjenester, tas ikke med. Stillingsressurser til skolefritidsordning skal ikke tas med her. Vaktmestertjenester skal heller ikke telles her. Lærlinger skal ikke registreres.

Årstimene fordeles mellom linje 1 til 4, etter ansattes bakgrunn:
Linje 1: Barne- og ungdomsarbeidere (eller annen relevant fagarbeiderutdanning)
Linje 2: Vernepleier, barnevernspedagoger, sosionomer (eller tilsvarende yrkesgrupper med universitet/høyskoleutdanning)
Linje 3: Annen høyskole/universitetsutdanning
Linje 4: Annen bakgrunn
Linje 5: Totalt antall årstimer til assistent (assistenttimer) og annet elevrettet arbeid i skolen. Linje 5 fylles ikke ut, men summerer linje 1 til 4.
Linje 6: Hvor mange av årstimene i E5 er til assistent i henhold til vedtak om personlig assistanse, jf. opplæringsloven § 11-4 og privatskoleloven § 3-6. Her føres også timer med assistenter som del av gamle vedtak om spesialundervisning (videreføring etter § 5-1 i gammel opplæringslov). Hvis assistenttimene gis til flere elever samtidig, skal årstimene til assistent kun telles én gang.`
  },

  // ---------------------------------------------------------
  // SIDE 5: LÆRERE OG ASSISTENTER
  // ---------------------------------------------------------
  "s5_a": {
    title: "5A. Antall lærere",
    text: `Linje 1: Antall lærere: Her registreres antall personer som underviser på skolen. Assistenter skal ikke inkluderes, men dersom assistenter underviser regnes de som lærere uten godkjent utdanning og skal føres her. I fordelingen på hovedtrinn skal en person bare føres opp én gang, selv om vedkommende underviser på flere årstrinn. Personen skal føres på det høyeste årstrinnet vedkommende underviser. Dersom for eksempel en rektor også underviser, skal han/hun telles med.

Linje 2: Herav kontaktlærere: Der kontaktlærerfunksjonen for en gruppe er delt mellom flere personer, skal alle kontaktlærerne tas med her. I fordeling på hovedtrinn skal en person bare føres en gang, selv om en er kontaktlærer for elever på flere hovedtrinn. Hvis en person er kontaktlærer for elever fra flere hovedtrinn, skal han/hun føres på det høyeste årstrinnet elevene går på.`
  },
  "s5_b": {
    title: "5B. Annet personale i elevrettet arbeid",
    text: `En person kan ha en eller flere særskilte oppgaver i stillingen sin, og kan derfor måtte telles flere ganger i feltene 5A og 5B. En og samme person kan for eksempel føres opp både som kontaktlærer og sosialpedagogisk rådgiver.

Linje 1 og 2: Her føres antall utdannings- og yrkesrådgivere og antall sosialpedagogiske rådgivere. 

Linje 3: Her fylles det ut hvor mange tilsatte som er med undervisningspersonalet i undervisningen. Dersom assistenter utfører undervisningsoppgaver regnes de ikke som assistenter, men som undervisningspersonell (lærer) og skal føres i 5A.

Assistenter som bare utfører helsetjenester tas ikke med. Assistenter som utelukkende jobber i skolefritidsordningen skal ikke tas med her.`
  },
  "s5_c": {
    title: "5C. Antall lærere som oppfyller kompetansekravene",
    text: `Dersom læreren underviser elever både på 1.-7. årstrinn og 8.-10. årstrinn, skal læreren føres bare på 8.-10. årstrinn. Assistenter skal ikke inkluderes, men dersom assistenter utfører undervisningsoppgaver, regnes de som undervisningspersonell som ikke oppfyller kompetansekravene for tilsetting og skal føres i linje 2.

Linje 1: Antall lærere som oppfyller kompetansekravene for tilsetting jf. opplæringsloven § 17-3 og privatskoleloven § 4-2. Det er kun fullført utdanning som skal registreres. Se forskrift til opplæringsloven § 12-2, § 12-3 og § 12-5 for hvilke utdanninger som er godkjent per i dag. Steinerskoler og Montessoriskoler registrerer også etter kravene for tilsetting jf. privatskoleloven § 4-2 (skal ikke ta hensyn til egne krav om spesialkompetanse).

Linje 2: Antall lærere som ikke oppfyller kompetansekravene for tilsetting jf. opplæringsloven § 17-3 og privatskoleloven § 4-2. Dersom læreren underviser på både 1.-7. og 8.-10. årstrinn uten godkjent kompetanse, føres læreren bare på 8.-10. årstrinn slik at læreren ikke telles dobbelt. Assistenter som utfører undervisningsoppgaver føres her. En som er unntatt fra kravene og tilsatt midlertidig eller på vilkår etter opplæringsloven § 17-3 andre ledd registreres her.`
  },
  "s5_d": {
    title: "5D. Kompetansekrav for undervisning",
    text: `Bare lærere i 5C, linje 1, som oppfyller kompetansekravene for tilsetting, skal registreres i fagene de underviser i dette skoleåret. Registreringen skal fordeles etter hvor mange studiepoeng de har i hvert av fagene de underviser i. Dersom læreren underviser elever i faget både på 1.-7. og 8.-10. årstrinn, skal læreren føres bare på 8.-10. årstrinn.

I opplæringsloven stilles det krav til 30 studiepoeng på barnetrinnet og 60 studiepoeng på ungdomstrinnet for å undervise i norsk, samisk, norsk tegnspråk, matematikk og engelsk (jf. opplæringsloven § 17-4 / forskrift § 12-4 og § 12-6). Alle lærere i disse fagene omfattes, men skoleeier kan unntaksvis beslutte unntak for ett år av gangen.

Krav om relevant kompetanse gjelder ikke for midlertidig tilsatte eller tilsatte på vilkår (§ 17-3). Disse registreres ikke i 5D.

Steinerskoler registrerer etter faktiske studiepoeng i fagene de underviser i.

Linje 1: Norsk (alle former for norskopplæring, forsterket norsk, norsk for elever med samisk som 1. språk, osv.).
Linje 2: Matematikk.
Linje 3: Engelsk.
Linje 4: Samisk.
Linje 5: Norsk tegnspråk.`
  },
  "s5_e": {
    title: "5E. Antall ansatte som gir individuelt tilrettelagt opplæring",
    text: `Her registreres ansatte som gir individuelt tilrettelagt opplæring til elever som har vedtak om dette etter opplæringsloven § 11-6. De ansatte registreres enten i linje 1, 2 eller 3.

Den som skal gi individuelt tilrettelagt opplæring, må oppfylle kompetansekravene for å bli ansatt i lærerstilling, jf. opplæringsloven § 17-3. Lærere som oppfyller disse kravene, registreres i linje 1.

I vedtak om ITO kan det gjøres unntak fra kompetansekravene i § 17-3 dersom det vil gi eleven bedre opplæring. Slike unntak kan kun gjøres dersom opplæringen skal gis av personer med en universitets- eller høyskoleutdanning som gjør de særlig egnet. Ansatte med slik utdanning registreres i linje 2.`
  },
  "s5_f": {
    title: "5F. Antall ansatte med spesialpedagogisk kompetanse",
    text: `Her registreres ansatte som har minimum 30 studiepoeng i spesialpedagogikk fra høgskole og/eller universitet (studiepoeng fra fagskole beregnes ikke).

Dette kan være en samlet spesialpedagogisk kompetanse fra ett eller flere emner (f.eks. lese- og skrivevansker, matematikkvansker, språkvansker/logopedi, audiopedagogikk, synspedagogikk, ASK, utviklingshemming, atferdsvansker, sosiale/emosjonelle vansker, nevromangfold, osv.).

Ansatte i kommunens logopedtjeneste og i PP-tjenesten skal IKKE registreres under denne kategorien.`
  },

  // ---------------------------------------------------------
  // SIDE 6: ÅRSVERK OG ANSATTE
  // ---------------------------------------------------------
  "s6_a": {
    title: "6A. Årsverk til lederoppgaver",
    text: "Omfatter den samlede tidsressurs som er avsatt til administrative og pedagogiske lederoppgaver i henhold til SFS2213. Eksempel: 50 prosent stilling registreres som 0,5."
  },
  "s6_b": {
    title: "6B. Årsramme for undervisning",
    text: `Her føres det inn nye tall dersom leseplikten på skolen avviker fra det normale. Leseplikten skal kun endres der skoleeier har vedtatt en annen årsramme for undervisning.

Den forhåndsutfylte årsrammen (741 timer på barnetrinnet og 656 timer på ungdomstrinnet) brukes av de fleste skoler i Norge. Årsrammen skal kun endres der skoleeier har vedtatt en annen årsramme for undervisning.`
  },
  "s6_c": {
    title: "6C. Sum beregnede årsverk til undervisning",
    text: `Beregnes på bakgrunn av årstimer fra del 4. Årstimer etter formelen: årstimer/741 for 1.–7. årstrinn og årstimer/656 for 8.–10. årstrinn.

Undervisningspersonalets årsverk:
Undervisningspersonalets årsverk på 1687,5 timer er bygget opp av flere elementer på barnetrinnet innenfor 39 uker, med mindre annet er avtalt lokalt. Arbeidsplanfestet tid er 1300 timer (inntil 741 undervisningstimer + 559 timer utenom undervisning). I tillegg kommer tid til for- og etterarbeid og faglig ajourføring med 387,5 timer.

På ungdomstrinnet er arbeidsplanfestet tid 1225 timer (gjennomsnittlig 656 undervisningstimer + 569 timer utenom undervisning). I tillegg kommer tid til for- og etterarbeid og faglig ajourføring med 462,5 timer.

I den sentrale særavtalen, SFS2213, er det regulert inn flere bestemmelser som griper inn i årsrammene (seniortiltak, tidsressurspott, kontaktlærertjeneste, osv.). I GSI etterspørres kun undervisningstimene og eventuelt timer til arbeidsoppgaver som medfører reduksjon i årsrammen for undervisning.`
  },
  "s6_d": {
    title: "6D. Årsverk til annet personale",
    text: `Linje 1: Her registreres årsverk til skolebibliotekarer. 50 prosent stilling registreres som 0,5.

Linje 2: Her registreres årsverk til kontorteknisk personale. 50 prosent stilling registreres som 0,5.`
  },

  // ---------------------------------------------------------
  // SIDE 7: INDIVIDUELL TILRETTELEGGING (ITO)
  // ---------------------------------------------------------
  "s7_a": {
    title: "7A. Elever som får individuelt tilrettelagt opplæring",
    text: `Her registreres samlet antall elever som har vedtak om individuelt tilrettelagt opplæring (ITO) etter opplæringsloven § 11-6 og § 3-6 i privatskoleloven. Videreføring av vedtak om spesialundervisning etter den gamle opplæringsloven § 5-1, føres også her.

Elever som føres i del 7, skal være registrert i del 3 ved samme skole.
- Elever fra andre kommuner skal også føres her.
- Elever som har et delt undervisningstilbud mellom flere skoler, føres der de er registrert/innskrevet.

Siden både kommunen sentralt og skolene kan fylle ut feltet, må kommunen påse at elever som har fått tildeling, ikke dobbeltrapporteres eller underrapporteres.`
  },
  "s7_b": {
    title: "7B. Personlig assistanse, fysisk tilrettelegging og tekniske hjelpemidler",
    text: `Linje 1: Her føres elever som har vedtak om personlig assistanse etter opplæringsloven § 11-4. (Gjelder tilsvarende for privatskoler). Elever med videreføring av gamle vedtak om spesialundervisning føres ikke her, men i 7G. Elever fordeles etter om de i tillegg har vedtak om individuell tilrettelegging, eller kun personlig assistanse.

Linje 2: Her føres elever som har vedtak om fysisk tilrettelegging og tekniske hjelpemidler eller opplæring i mobilitet (§ 11-5). Elever fordeles etter om de i tillegg har vedtak om individuell tilrettelegging, eller kun vedtak etter § 11-5.`
  },
  "s7_c": {
    title: "7C. Faste avdelinger for individuelt tilrettelagt opplæring",
    text: "Dersom skolen har forsterket avdeling for individuelt tilrettelagt opplæring, oppgis antall elever her. Dette gjelder både egne skoler for ITO og skoler der elever har fast tilhørighet til «forsterket» avdeling. Tilfeldige elevgrupper som oppstår i en ordinær skole/klasse skal ikke telles her."
  },
  "s7_d": {
    title: "7D. Alternativ opplæringsarena",
    text: `Hvis skolen har elever som tilbringer én dag i uken eller mer utenfor ordinær undervisning, skal de registreres her (f.eks. friluftsliv, kantinedrift m.m.). Elever må ha vedtak om individuelt tilrettelagt opplæring for å bli plassert her. Gjelder ikke omdisponering av 25 % av timetallet (del 13).

Elever i fast avdeling for individuelt tilrettelagt opplæring skal føres i D15.`
  },
  "s7_e": {
    title: "7E. Organisering av individuelt tilrettelagt opplæring",
    text: "Det spørres om antall elever som får et flertall av sine tildelte timer til individuelt tilrettelagt opplæring i den ordinære klassen, i grupper på 2–5 elever, i grupper på 6 eller flere, eller alene. Elevene registreres kun én gang. Summen i 7E skal være lik summen i 7A."
  },
  "s7_f": {
    title: "7F. Tildelte timer til ITO med undervisningspersonale",
    text: "Her registreres antall elever som har fått tildelt timer til ITO med undervisningspersonale, gruppert etter hovedtrinn og tildelte timer per år (intervallene 1–75, 76–190, 191–270 eller 271+ timer per år). Elevene føres både på hovedtrinnsfordelingen og på kjønnsfordelingen."
  },
  "s7_g": {
    title: "7G. Personlig assistanse eller timer med assistent i videreført vedtak",
    text: `Her registreres antall elever som har fått tildelt timer til personlig assistanse jf. opplæringsloven § 11-4, gruppert etter tildelte timer per år (1–75, 76–190, 191–270 eller 271+ timer).

Timer med assistent i videreført vedtak om spesialundervisning etter forrige opplæringslov § 5-1 føres også her.`
  },
  "s7_h": {
    title: "7H. Elever med ITO fra andre kommuner",
    text: "Kommunale skoler skal registrere antall elever fra andre kommuner som får individuelt tilrettelagt opplæring. Privatskoler, statlige og fylkeskommunale skoler skal registrere alle elever med ITO fra alle kommuner, også hjemmekommunen."
  },

  // ---------------------------------------------------------
  // SIDE 8: SÆRSKILT SPRÅKOPPLÆRING
  // ---------------------------------------------------------
  "s8_a": {
    title: "8A. Forsterket opplæring i norsk",
    text: `I første kolonne føres alle elever som får undervisning etter opplæringsloven § 3-6 og privatskoleloven § 3-5. Elever føres der de er registrert/innskrevet (del 3).

I andre kolonne føres den delen av elevene som har forsterket opplæring i norsk og som følger læreplanen i grunnleggende norsk.`
  },
  "s8_b": {
    title: "8B. Elever i egne undervisningsgrupper for språklige minoriteter",
    text: `Linje 1: Egne innføringsskoler og skoler med egne grupper der elever har sin faste tilhørighet registreres her. Elever på mottaksskole pr. 1. oktober føres der. Time-ressursene føres i 4B (linje 2–5).

Linje 2: Her føres elever i egne undervisningsgrupper som bor i mottak eller omsorgssenter.`
  },
  "s8_c": {
    title: "8C. Morsmålsopplæring, tospråklig opplæring i fag eller annen tilrettelagt opplæring",
    text: `En elev skal her kun føres i én av kolonnene (morsmålsopplæring, både morsmål og tospråklig, kun tospråklig, eller annen tilrettelagt opplæring). Kun elever med enkeltvedtak registreres. Summen beregnes automatisk.`
  },
  "s8_d": {
    title: "8D. Elever med forsterket opplæring fra andre kommuner",
    text: "Kommunale skoler registrerer elever fra andre kommuner som får forsterket opplæring i norsk. Private, statlige og fylkeskommunale skoler registrerer alle elever fra alle kommuner."
  },

  // ---------------------------------------------------------
  // SIDE 9: OPPLÆRINGSSPRÅK
  // ---------------------------------------------------------
  "s9_a": {
    title: "9A. Opplæringsspråk",
    text: "Elevene registreres etter årstrinn, kjønn og faktiske målform de får opplæring i i alle andre fag enn norsk. Internasjonale skoler med undervisning på andre språk enn norsk/samisk føres på «Andre»."
  },
  "s9_b": {
    title: "9B. Elevgrupper",
    text: "Alle grupper opprettet etter opplæringsloven § 3-1 og § 3-2 registreres her. Det er kun grupper som kommer i tillegg til de skolen uansett ville hatt basert på elevtallet som telles her."
  },
  "s9_c": {
    title: "9C. Samiske språk, kvensk og finsk",
    text: "Her registreres elever som får opplæring i samiske språk (første- eller andrespråk) samt finsk eller kvensk som andrespråk. Samisk som andrespråk 2 gjelder nivå 1–7, og Samisk som andrespråk 3 gjelder nivå 1–4."
  },
  "s9_d": {
    title: "9D. Fjernundervisning",
    text: "Elever med fjernundervisning i samisk skal registreres både i 9C og 9D."
  },

  // ---------------------------------------------------------
  // SIDE 10: FREMMEDSPRÅK, FORDYPNING OG ARBEIDSLIVSFAG
  // ---------------------------------------------------------
  "s10_a": {
    title: "10A. Elever med fremmedspråk, fordypning eller arbeidslivsfag",
    text: "Linje 1–5: Tysk, fransk, spansk, italiensk, russisk. Linje 6: Andre språk. Linje 7–9: Fordypning i engelsk, norsk eller samisk. Linje 10: Arbeidslivsfag. Linje 11: Fordypning i matematikk. Linje 12–13: Fordypning i arbeid."
  },
  "s10_b": {
    title: "10B. Elever uten fremmedspråk, fordypning eller arbeidslivsfag",
    text: "Her føres elever som på bakgrunn av fritak eller av andre årsaker ikke har fremmedspråk, fordypning eller arbeidslivsfag."
  },

  // ---------------------------------------------------------
  // SIDE 11: VALGFAG
  // ---------------------------------------------------------
  "s11_a": {
    title: "11A. Antall elever med valgfag",
    text: "Her føres elever som tar valgfag, fordelt på de ulike valgfagene. Elever som tar fag fra videregående i stedet for valgfag, skal føres i 11B."
  },
  "s11_b": {
    title: "11B. Antall elever som tar fag fra videregående i stedet for valgfag",
    text: "Elever som bruker valgfagstimer til å ta fag fra videregående føres her. De vil da ikke ha et ordinært valgfag. Elever som kun bruker timer fra utdanningsvalg føres i 13G."
  },
  "s11_c": {
    title: "11C. Antall elever uten valgfag",
    text: "Her føres elever som på bakgrunn av fritak eller av andre årsaker ikke har valgfag. Elever i 11B føres ikke her."
  },
  "s11_d": {
    title: "11D. Sum elever med og uten valgfag",
    text: "Beregnes automatisk (11A + 11B + 11C). Antall elever på 8.–10. trinn i del 3A skal samsvare med summen her."
  },

  // ---------------------------------------------------------
  // SIDE 12: FYSISK AKTIVITET OG LEKSEHJELP
  // ---------------------------------------------------------
  "s12_a": {
    title: "12A. Antall elevtimer til fysisk aktivitet per år",
    text: "Registrer elevtimetall til fysisk aktivitet for 5.–7. årstrinn. Fysisk aktivitet er ikke et fag, så ekstra timer til kroppsøving føres ikke her. Timer registreres ikke i del 3B."
  },
  "s12_b": {
    title: "12B. Antall årstimer til fysisk aktivitet per år",
    text: "Her føres ressurser (ansattes timer) til fysisk aktivitet, uavhengig av om de gis av pedagoger eller andre."
  },
  "s12_c": {
    title: "12C. Leksehjelp på 1.-10. trinn",
    text: "Kolonne 1: Antall påmeldte/deltakende elever per årstrinn. Kolonne 2: Antall timer leksehjelp i uka som tilbys på hvert årstrinn. Timer til leksehjelp føres ikke i 3B."
  },

  // ---------------------------------------------------------
  // SIDE 13: ANDRE OPPLYSNINGER
  // ---------------------------------------------------------
  "s13_a": {
    title: "13A. Skoleskyss",
    text: "Her føres antall elever som får skyss (både rettighetselever og andre tilbudt skyss), uavhengig av om skyssen gjelder hele eller deler av året."
  },
  "s13_b": {
    title: "13B. Omdisponering av timetall (25 %-regelen)",
    text: "Oppgi antall elever som har fått omdisponert inntil 25 % av timene i et fag for å oppnå bedre samlet måloppnåelse. Må ikke forveksles med individuelt tilrettelagt opplæring."
  },
  "s13_c": {
    title: "13C. Leirskoleopphold / andre skoleturer med overnatting",
    text: "Registrer antall elever som har vært/skal på leirskole (minst 3 sammenhengende overnattinger). Antall overnattingsdøgn angis for klassen/gruppen totalt."
  },
  "s13_d": {
    title: "13D. Tilgang til skolebibliotek",
    text: "Kryss av for skolens bibliotektilbud (eget skolebibliotek, kombinasjonsbibliotek eller avtale med folkebibliotek). Oppgi ukentlige åpningstider om skolen har egne lokaler."
  },
  "s13_e": {
    title: "13E. Digital enhet (en-til-en)",
    text: "Registrer antall elever med tilgang til egen digital enhet i skolen. Private enheter hjemme telles ikke."
  },
  "s13_f": {
    title: "13F. Beredskap",
    text: "Svar på spørsmål om beredskapsplan ved tilsiktede og utilsiktede hendelser. Brannøvelser registreres ikke."
  },
  "s13_g": {
    title: "13G. Elever på ungdomstrinnet som tar fag fra vgo",
    text: "Linje 2: Elever som tar fag fra vgo uten å bruke valgfagstimer (følger ordinært valgfag). Elever som bruker valgfagstimer registreres i 11B. Linje 3 viser totalsum uten dobbeltcounting."
  },

  // ---------------------------------------------------------
  // SIDE 14: SFO
  // ---------------------------------------------------------
  "s14_a": {
    title: "14A. Antall barn med plass i SFO",
    text: "Antall barn på 1.–7. trinn fordeles på årstrinn. Heltidsplass registreres i egen kolonne."
  },
  "s14_b": {
    title: "14B. Ansattes utdanning",
    text: "Antall ansatte registreres uavhengig av stillingsprosent. SFO-leder føres i linje 1–3 etter utdanning. Rektor, vaktmester og vedlikeholdspersonell telles ikke."
  },
  "s14_c": {
    title: "14C. Foreldrebetaling",
    text: "Oppgi faktura-månedssats per elev for heltids- og deltidsplass (uten matpenger) samt ukentlig timetall plassen utgjør."
  },
  "s14_d": {
    title: "14D. Rabattordninger",
    text: "Svar «Ja» eller «Nei» på om SFO har inntektsgraderte satser, friplasser eller søskenmoderasjon."
  },
  "s14_e": {
    title: "14E. Elever i inntektsgraderte ordninger",
    text: "Antall elever som benytter ordning med inntektsgradert foreldrebetaling. Generelt gratis SFO for hele årstrinn telles ikke her."
  },

  // ---------------------------------------------------------
  // SIDE 16: FORDREVNE UKRAINSK ELEVER
  // ---------------------------------------------------------
  "s16_a": {
    title: "16A. Fordrevne ukrainske elever",
    text: "Fordrevne fra Ukraina føres både her og i del 8. Elever uten fullverdig tilbud eller uten tilbud registreres i linje A2."
  },
  "s16_b": {
    title: "16B. Forsterket opplæring i norsk",
    text: "Antall fordrevne ukrainske elever med vedtak om forsterket opplæring i norsk. Registreres både her og i del 8."
  },
  "s16_c": {
    title: "16C. Egne undervisningsgrupper",
    text: "Ukrainske fordrevne i egne grupper for minoritetsspråklige. KUN ukrainske elever føres her, mens hele gruppen føres i del 8."
  },
  "s16_d": {
    title: "16D. Morsmålsopplæring og/eller tospråklig opplæring",
    text: "Antall fordrevne ukrainske elever som får morsmålsopplæring, tospråklig fagopplæring eller annen tilrettelagt språkopplæring."
  },

  // ---------------------------------------------------------
  // SIDE 18: KONTROLLER OG MERKNADER
  // ---------------------------------------------------------
  "s18_a": {
    title: "18A. Skjemaet er fylt ut av",
    text: "Navn, tittel og kontaktinformasjon til personen som har fylt ut og kontrollert skjemaets opplysninger."
  },
  "s18_b": {
    title: "18B. Merknader fra skolen",
    text: "Eventuelle forklaringer, avvik eller tilleggsopplysninger fra skolens side vedrørende årets GSI-rapportering."
  },
  "s18_c": {
    title: "18C. Merknader fra kommunen",
    text: "Eventuelle merknader og avklaringer fra kommunen/skoleeier sentralt før endelig godkjenning."
  }
};


// =========================================================
// AUTOMATISK HÅNDTERING AV HØYREPANEL
// =========================================================
function initInfoDrawer() {
  // 1. Bygg høyremenyen i body dersom den ikke finnes fra før
  if (!document.getElementById("infoDrawerBackdrop")) {
    const drawerHTML = `
      <div class="info-drawer-backdrop" id="infoDrawerBackdrop">
        <div class="info-drawer-box">
          <div class="info-drawer-top">
            <button type="button" class="info-drawer-close-x" id="infoDrawerCloseX" title="Lukk">&#10005;</button>
          </div>
          <div class="info-drawer-header" id="infoDrawerTitle">Informasjon</div>
          <div class="info-drawer-body" id="infoDrawerText"></div>
          <div class="info-drawer-footer">
            <button type="button" id="infoDrawerCloseBtn">Lukk</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", drawerHTML);
  }

  // 2. Global klikk-lytter som fanger opp ALL klikking på .info-btn
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".info-btn");
    
    // Hvis man klikker på en info-knapp:
    if (btn) {
      e.preventDefault();
      e.stopPropagation();

      const backdrop = document.getElementById("infoDrawerBackdrop");
      const titleEl = document.getElementById("infoDrawerTitle");
      const textEl = document.getElementById("infoDrawerText");

      const infoKey = btn.getAttribute("data-info");
      const infoData = gsiInfoTexts[infoKey];

      if (infoData) {
        titleEl.textContent = infoData.title;
        textEl.innerHTML = infoData.text.replace(/\n/g, "<br>");
      } else {
        titleEl.textContent = "Informasjon";
        textEl.textContent = "Ingen veiledningstekst tilgjengelig for dette punktet ennå.";
      }

      backdrop.classList.add("active");
      return;
    }

    // Hvis man klikker på Lukk-knapp, Kryss eller bakgrunnen:
    if (e.target.closest("#infoDrawerCloseBtn") || 
        e.target.closest("#infoDrawerCloseX") || 
        e.target.id === "infoDrawerBackdrop") {
      const backdrop = document.getElementById("infoDrawerBackdrop");
      if (backdrop) backdrop.classList.remove("active");
    }
  });
}

// Kjør oppsettet uansett om siden er midt i lasting eller ferdig
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initInfoDrawer);
} else {
  initInfoDrawer();
}