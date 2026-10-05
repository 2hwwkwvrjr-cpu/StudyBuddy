// ======================================================
// STUDYBUDDY
// ======================================================



// ======================================================
// STANDARD-FÄCHER
// ======================================================

const standardFaecher = [

    {
        name: "Datenmanagement",
        ziel: 4,
        gelernt: 0
    },

    {
        name: "Einführung in die Wirtschaftsinformatik",
        ziel: 4,
        gelernt: 0
    },

    {
        name: "Kompetenz und Kooperation",
        ziel: 2,
        gelernt: 0
    },

    {
        name: "Mathematik für Computer Science 1",
        ziel: 6,
        gelernt: 0
    },

    {
        name: "Rechnungswesen",
        ziel: 5,
        gelernt: 0
    },

    {
        name: "Strukturierte Programmierung",
        ziel: 6,
        gelernt: 0
    },

    {
        name: "Technical English",
        ziel: 3,
        gelernt: 0
    },

    {
        name: "Unternehmensführung",
        ziel: 3,
        gelernt: 0
    }

];



// ======================================================
// STANDARD-AUFGABEN
// ======================================================

const standardAufgaben = [

    {
        id: 1,

        aufgabe:
            "JavaScript Übung fertigstellen",

        fach:
            "Strukturierte Programmierung",

        typ:
            "Abgabe",

        deadline:
            "2026-10-08",

        prioritaet:
            "hoch",

        status:
            "in Bearbeitung",

        zeitaufwand:
            5,

        investierteZeit:
            2,

        notiz:
            "Code testen und anschließend auf GitHub committen."
    },


    {
        id: 2,

        aufgabe:
            "Mathematik Prüfung vorbereiten",

        fach:
            "Mathematik für Computer Science 1",

        typ:
            "Prüfung",

        deadline:
            "2026-10-12",

        prioritaet:
            "hoch",

        status:
            "offen",

        zeitaufwand:
            8,

        investierteZeit:
            2,

        notiz:
            "Binärzahlen, Logik und Kombinatorik wiederholen."
    },


    {
        id: 3,

        aufgabe:
            "Datenmanagement Stoff wiederholen",

        fach:
            "Datenmanagement",

        typ:
            "Lernaufgabe",

        deadline:
            "2026-10-15",

        prioritaet:
            "mittel",

        status:
            "offen",

        zeitaufwand:
            4,

        investierteZeit:
            1,

        notiz:
            "Unterlagen zusammenfassen."
    },


    {
        id: 4,

        aufgabe:
            "Rechnungswesen Übungsblatt",

        fach:
            "Rechnungswesen",

        typ:
            "Hausübung",

        deadline:
            "2026-10-10",

        prioritaet:
            "mittel",

        status:
            "offen",

        zeitaufwand:
            3,

        investierteZeit:
            0.5,

        notiz:
            "Bilanz und Bestandskonten üben."
    },


    {
        id: 5,

        aufgabe:
            "Technical English Vokabeln",

        fach:
            "Technical English",

        typ:
            "Lernaufgabe",

        deadline:
            "2026-10-18",

        prioritaet:
            "niedrig",

        status:
            "offen",

        zeitaufwand:
            2,

        investierteZeit:
            0.5,

        notiz:
            "Business und IT Vocabulary wiederholen."
    }

];



// ======================================================
// DATEN LADEN
// ======================================================

let faecher =
    JSON.parse(
        localStorage.getItem(
            "studybuddy_faecher"
        )
    )
    ||
    standardFaecher.map(
        fach => ({
            ...fach
        })
    );



let aufgaben =
    JSON.parse(
        localStorage.getItem(
            "studybuddy_aufgaben"
        )
    )
    ||
    standardAufgaben.map(
        aufgabe => ({
            ...aufgabe
        })
    );



let bearbeitungsId =
    null;



let aktiverTimer =
    null;



let timerStart =
    null;



let timerInterval =
    null;



// ======================================================
// SPEICHERN
// ======================================================

function speichern() {

    localStorage.setItem(

        "studybuddy_faecher",

        JSON.stringify(
            faecher
        )

    );


    localStorage.setItem(

        "studybuddy_aufgaben",

        JSON.stringify(
            aufgaben
        )

    );

}



// ======================================================
// NAVIGATION
// ======================================================

function zeigeSeite(
    seitenId,
    button
) {

    document
        .querySelectorAll(
            ".seite"
        )
        .forEach(
            seite => {

                seite
                    .classList
                    .remove(
                        "active"
                    );

            }
        );


    document
        .getElementById(
            seitenId
        )
        .classList
        .add(
            "active"
        );


    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            navButton => {

                navButton
                    .classList
                    .remove(
                        "active"
                    );

            }
        );


    button
        .classList
        .add(
            "active"
        );


    if (
        seitenId ===
        "dashboard"
    ) {

        aktualisiereUebersicht();

        zeigeDashboardAufgaben();

        zeigeDashboardZiele();

    }


    if (
        seitenId ===
        "aufgaben"
    ) {

        zeigeAufgaben();

    }


    if (
        seitenId ===
        "faecher"
    ) {

        aktualisiereFaecher();

    }

}



// ======================================================
// FACH HINZUFÜGEN
// ======================================================

function fachHinzufuegen() {

    const name =
        document
            .getElementById(
                "neuesFach"
            )
            .value
            .trim();


    const ziel =
        Number(

            document
                .getElementById(
                    "neuesZiel"
                )
                .value

        );


    if (
        name === ""
        ||
        ziel <= 0
    ) {

        alert(
            "Bitte Fachname und Wochenziel eingeben."
        );

        return;

    }


    const existiert =
        faecher.some(
            fach =>

                fach.name
                    .toLowerCase()
                ===
                name
                    .toLowerCase()
        );


    if (
        existiert
    ) {

        alert(
            "Dieses Fach gibt es bereits."
        );

        return;

    }


    faecher.push({

        name:
            name,

        ziel:
            ziel,

        gelernt:
            0

    });


    document
        .getElementById(
            "neuesFach"
        )
        .value =
        "";


    document
        .getElementById(
            "neuesZiel"
        )
        .value =
        "";


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// FACH LÖSCHEN
// ======================================================

function fachLoeschen(
    index
) {

    const fach =
        faecher[index];


    const verwendet =
        aufgaben.some(
            aufgabe =>

                aufgabe.fach
                ===
                fach.name
        );


    if (
        verwendet
    ) {

        alert(
            "Dieses Fach wird noch von mindestens einer Aufgabe verwendet."
        );

        return;

    }


    const bestaetigen =
        confirm(

            `Möchtest du "${fach.name}" wirklich löschen?`

        );


    if (
        !bestaetigen
    ) {

        return;

    }


    faecher.splice(
        index,
        1
    );


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// WOCHENZIEL ÄNDERN
// ======================================================

function zielAendern(
    index
) {

    const fach =
        faecher[index];


    const neuesZiel =
        Number(

            prompt(

                `Neues Wochenziel für ${fach.name}:`,

                fach.ziel

            )

        );


    if (
        neuesZiel <= 0
        ||
        Number.isNaN(
            neuesZiel
        )
    ) {

        return;

    }


    fach.ziel =
        neuesZiel;


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// LERNZEIT MANUELL ÄNDERN
// ======================================================

function lernzeitAendern(
    index,
    stunden
) {

    faecher[index]
        .gelernt +=
        stunden;


    if (
        faecher[index]
            .gelernt < 0
    ) {

        faecher[index]
            .gelernt =
            0;

    }


    faecher[index]
        .gelernt =
        Math.round(

            faecher[index]
                .gelernt
            *
            100

        )
        /
        100;


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// SLIDER
// ======================================================

function sliderAendern(
    index,
    wert
) {

    faecher[index]
        .gelernt =
        Number(
            wert
        );


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// TIMER STARTEN
// ======================================================

function timerStarten(
    index
) {

    if (
        aktiverTimer
        !==
        null
    ) {

        alert(
            "Es läuft bereits ein Lerntimer. Stoppe ihn zuerst."
        );

        return;

    }


    aktiverTimer =
        index;


    timerStart =
        Date.now();


    timerInterval =
        setInterval(

            timerAktualisieren,

            1000

        );


    aktualisiereFaecher();

}



// ======================================================
// TIMER AKTUALISIEREN
// ======================================================

function timerAktualisieren() {

    if (
        aktiverTimer
        ===
        null
    ) {

        return;

    }


    const sekunden =
        Math.floor(

            (
                Date.now()
                -
                timerStart
            )
            /
            1000

        );


    const anzeige =
        document
            .getElementById(

                `timer-${aktiverTimer}`

            );


    if (
        anzeige
    ) {

        anzeige.textContent =
            sekundenFormat(
                sekunden
            );

    }

}



// ======================================================
// TIMER STOPPEN
// ======================================================

function timerStoppen(
    index
) {

    if (
        aktiverTimer
        !==
        index
    ) {

        return;

    }


    const sekunden =
        (
            Date.now()
            -
            timerStart
        )
        /
        1000;


    const stunden =
        sekunden
        /
        3600;


    faecher[index]
        .gelernt +=
        stunden;


    faecher[index]
        .gelernt =
        Math.round(

            faecher[index]
                .gelernt
            *
            100

        )
        /
        100;


    clearInterval(
        timerInterval
    );


    aktiverTimer =
        null;


    timerStart =
        null;


    timerInterval =
        null;


    speichern();

    aktualisiereFaecher();

    zeigeDashboardZiele();

}



// ======================================================
// TIMER FORMAT
// ======================================================

function sekundenFormat(
    sekunden
) {

    const stunden =
        Math.floor(
            sekunden
            /
            3600
        );


    const minuten =
        Math.floor(

            (
                sekunden
                %
                3600
            )
            /
            60

        );


    const restSekunden =
        sekunden
        %
        60;


    return (

        String(
            stunden
        )
        .padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            minuten
        )
        .padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            restSekunden
        )
        .padStart(
            2,
            "0"
        )

    );

}



// ======================================================
// FÄCHER ANZEIGEN
// ======================================================

function aktualisiereFaecher() {

    const liste =
        document
            .getElementById(
                "fachListe"
            );


    const aufgabeFach =
        document
            .getElementById(
                "aufgabeFach"
            );


    const fachFilter =
        document
            .getElementById(
                "fachFilter"
            );


    liste.innerHTML =
        "";


    aufgabeFach.innerHTML =

        `
        <option value="">
            Fach auswählen
        </option>
        `;


    fachFilter.innerHTML =

        `
        <option value="alle">
            Alle Fächer
        </option>
        `;



    faecher.forEach(

        (
            fach,
            index
        ) => {


            const option =
                document
                    .createElement(
                        "option"
                    );


            option.value =
                fach.name;


            option.textContent =
                fach.name;


            aufgabeFach
                .appendChild(
                    option
                );



            const filterOption =
                document
                    .createElement(
                        "option"
                    );


            filterOption.value =
                fach.name;


            filterOption.textContent =
                fach.name;


            fachFilter
                .appendChild(
                    filterOption
                );



            const prozent =
                Math.min(

                    100,

                    Math.round(

                        (
                            fach.gelernt
                            /
                            fach.ziel
                        )

                        *

                        100

                    )

                );



            const sliderMax =
                Math.max(

                    fach.ziel,

                    fach.gelernt,

                    1

                );



            const karte =
                document
                    .createElement(
                        "div"
                    );


            karte.className =
                "fach-card";



            const timerLaeuft =
                aktiverTimer
                ===
                index;



            karte.innerHTML = `


                <h3>

                    ${fach.name}

                </h3>


                <div class="lern-info">

                    Wochenziel:

                    <strong>
                        ${fach.ziel} Stunden
                    </strong>

                </div>


                <input

                    class="slider"

                    type="range"

                    min="0"

                    max="${sliderMax}"

                    step="0.25"

                    value="${fach.gelernt}"

                    oninput="
                        sliderAendern(
                            ${index},
                            this.value
                        )
                    "
                >


                <div class="progress-info">

                    <span>

                        ${fach.gelernt.toFixed(2)}
                        h gelernt

                    </span>


                    <span>

                        ${prozent} %

                    </span>

                </div>


                <div class="progress">

                    <div

                        class="progress-inner"

                        style="
                            width:
                            ${prozent}%;
                        "

                    ></div>

                </div>


                <div class="zeit-buttons">


                    <button

                        class="btn-lila"

                        onclick="
                            lernzeitAendern(
                                ${index},
                                0.5
                            )
                        "
                    >

                        + 30 Min.

                    </button>



                    <button

                        class="btn-lila"

                        onclick="
                            lernzeitAendern(
                                ${index},
                                1
                            )
                        "
                    >

                        + 1 Std.

                    </button>



                    <button

                        class="btn-gelb"

                        onclick="
                            zielAendern(
                                ${index}
                            )
                        "
                    >

                        Ziel ändern

                    </button>


                </div>



                <div class="timer">


                    <span

                        class="timer-anzeige"

                        id="timer-${index}"
                    >

                        00:00:00

                    </span>



                    ${
                        timerLaeuft

                        ?

                        `
                        <button

                            class="btn-rot"

                            onclick="
                                timerStoppen(
                                    ${index}
                                )
                            "
                        >

                            ⏹ Stoppen

                        </button>
                        `

                        :

                        `
                        <button

                            class="btn-primary"

                            onclick="
                                timerStarten(
                                    ${index}
                                )
                            "
                        >

                            ▶ Lernen

                        </button>
                        `
                    }


                </div>



                <div class="zeit-buttons">


                    <button

                        class="btn-rot"

                        onclick="
                            fachLoeschen(
                                ${index}
                            )
                        "
                    >

                        Fach löschen

                    </button>


                </div>

            `;


            liste
                .appendChild(
                    karte
                );

        }

    );


    if (
        aktiverTimer
        !==
        null
    ) {

        timerAktualisieren();

    }

}



// ======================================================
// AUFGABE SPEICHERN
// ======================================================

function aufgabeSpeichern() {

    const name =
        document
            .getElementById(
                "aufgabeName"
            )
            .value
            .trim();


    const fach =
        document
            .getElementById(
                "aufgabeFach"
            )
            .value;


    const typ =
        document
            .getElementById(
                "typ"
            )
            .value;


    const deadline =
        document
            .getElementById(
                "deadline"
            )
            .value;


    const prioritaet =
        document
            .getElementById(
                "prioritaet"
            )
            .value;


    const status =
        document
            .getElementById(
                "status"
            )
            .value;


    const zeitaufwand =
        Number(

            document
                .getElementById(
                    "zeitaufwand"
                )
                .value

        );


    const investierteZeit =
        Number(

            document
                .getElementById(
                    "investierteZeit"
                )
                .value

        );


    const notiz =
        document
            .getElementById(
                "notiz"
            )
            .value
            .trim();



    if (
        name === ""
        ||
        fach === ""
        ||
        deadline === ""
    ) {

        alert(
            "Bitte Aufgabe, Fach und Deadline ausfüllen."
        );

        return;

    }



    if (
        bearbeitungsId
        !==
        null
    ) {


        const aufgabe =
            aufgaben.find(
                aufgabe =>
                    aufgabe.id
                    ===
                    bearbeitungsId
            );


        aufgabe.aufgabe =
            name;


        aufgabe.fach =
            fach;


        aufgabe.typ =
            typ;


        aufgabe.deadline =
            deadline;


        aufgabe.prioritaet =
            prioritaet;


        aufgabe.status =
            status;


        aufgabe.zeitaufwand =
            zeitaufwand;


        aufgabe.investierteZeit =
            investierteZeit;


        aufgabe.notiz =
            notiz;


        bearbeitungsId =
            null;


    } else {


        aufgaben.push({

            id:
                Date.now(),

            aufgabe:
                name,

            fach:
                fach,

            typ:
                typ,

            deadline:
                deadline,

            prioritaet:
                prioritaet,

            status:
                status,

            zeitaufwand:
                zeitaufwand,

            investierteZeit:
                investierteZeit,

            notiz:
                notiz

        });

    }



    formularLeeren();


    speichern();


    zeigeAufgaben();


    aktualisiereUebersicht();


    zeigeDashboardAufgaben();

}



// ======================================================
// FORMULAR LEEREN
// ======================================================

function formularLeeren() {

    document
        .getElementById(
            "aufgabeName"
        )
        .value =
        "";


    document
        .getElementById(
            "aufgabeFach"
        )
        .value =
        "";


    document
        .getElementById(
            "typ"
        )
        .value =
        "Prüfung";


    document
        .getElementById(
            "deadline"
        )
        .value =
        "";


    document
        .getElementById(
            "prioritaet"
        )
        .value =
        "hoch";


    document
        .getElementById(
            "status"
        )
        .value =
        "offen";


    document
        .getElementById(
            "zeitaufwand"
        )
        .value =
        "";


    document
        .getElementById(
            "investierteZeit"
        )
        .value =
        "";


    document
        .getElementById(
            "notiz"
        )
        .value =
        "";

}



// ======================================================
// AUFGABE BEARBEITEN
// ======================================================

function aufgabeBearbeiten(
    id
) {

    const aufgabe =
        aufgaben.find(
            aufgabe =>
                aufgabe.id
                ===
                id
        );


    if (
        !aufgabe
    ) {

        return;

    }


    document
        .getElementById(
            "aufgabeName"
        )
        .value =
        aufgabe.aufgabe;


    document
        .getElementById(
            "aufgabeFach"
        )
        .value =
        aufgabe.fach;


    document
        .getElementById(
            "typ"
        )
        .value =
        aufgabe.typ
        ||
        "Lernaufgabe";


    document
        .getElementById(
            "deadline"
        )
        .value =
        aufgabe.deadline;


    document
        .getElementById(
            "prioritaet"
        )
        .value =
        aufgabe.prioritaet;


    document
        .getElementById(
            "status"
        )
        .value =
        aufgabe.status;


    document
        .getElementById(
            "zeitaufwand"
        )
        .value =
        aufgabe.zeitaufwand
        ||
        0;


    document
        .getElementById(
            "investierteZeit"
        )
        .value =
        aufgabe.investierteZeit
        ||
        0;


    document
        .getElementById(
            "notiz"
        )
        .value =
        aufgabe.notiz
        ||
        "";


    bearbeitungsId =
        id;


    const aufgabenButton =
        document
            .querySelectorAll(
                ".nav-button"
            )[1];


    zeigeSeite(
        "aufgaben",
        aufgabenButton
    );


    window.scrollTo({

        top:
            0,

        behavior:
            "smooth"

    });

}



// ======================================================
// AUFGABE LÖSCHEN
// ======================================================

function aufgabeLoeschen(
    id
) {

    const bestaetigen =
        confirm(
            "Möchtest du diese Aufgabe wirklich löschen?"
        );


    if (
        !bestaetigen
    ) {

        return;

    }


    aufgaben =
        aufgaben.filter(
            aufgabe =>
                aufgabe.id
                !==
                id
        );


    speichern();


    zeigeAufgaben();


    aktualisiereUebersicht();


    zeigeDashboardAufgaben();

}



// ======================================================
// DEADLINE IN TAGEN
// ======================================================

function tageBisDeadline(
    deadline
) {

    const heute =
        new Date();


    heute.setHours(
        0,
        0,
        0,
        0
    );


    const datum =
        new Date(
            deadline
        );


    datum.setHours(
        0,
        0,
        0,
        0
    );


    return Math.ceil(

        (
            datum
            -
            heute
        )

        /

        (
            1000
            *
            60
            *
            60
            *
            24
        )

    );

}



// ======================================================
// DEADLINE TEXT
// ======================================================

function deadlineText(
    tage
) {

    if (
        tage < 0
    ) {

        return {

            text:
                `Überfällig seit ${Math.abs(tage)} Tag(en)`,

            klasse:
                "ueberfaellig"

        };

    }


    if (
        tage === 0
    ) {

        return {

            text:
                "Heute fällig!",

            klasse:
                "dringend"

        };

    }


    if (
        tage <= 3
    ) {

        return {

            text:
                `Nur noch ${tage} Tag(e)!`,

            klasse:
                "dringend"

        };

    }


    return {

        text:
            `Noch ${tage} Tag(e)`,

        klasse:
            ""

    };

}



// ======================================================
// DEUTSCHES DATUM
// ======================================================

function deutschesDatum(
    datum
) {

    return new Date(
        datum
    )
    .toLocaleDateString(
        "de-DE"
    );

}



// ======================================================
// ALGORITHMUS
// DRINGLICHKEIT BERECHNEN
// ======================================================

function berechneDringlichkeit(
    aufgabe
) {

    let punkte =
        0;



    // ==============================
    // PRIORITÄT
    // ==============================

    if (
        aufgabe.prioritaet
        ===
        "hoch"
    ) {

        punkte +=
            30;

    }

    else if (
        aufgabe.prioritaet
        ===
        "mittel"
    ) {

        punkte +=
            20;

    }

    else {

        punkte +=
            10;

    }



    // ==============================
    // DEADLINE
    // ==============================

    const tage =
        tageBisDeadline(
            aufgabe.deadline
        );


    if (
        tage <= 0
    ) {

        punkte +=
            50;

    }

    else if (
        tage === 1
    ) {

        punkte +=
            40;

    }

    else if (
        tage <= 3
    ) {

        punkte +=
            30;

    }

    else if (
        tage <= 7
    ) {

        punkte +=
            20;

    }

    else {

        punkte +=
            10;

    }



    // ==============================
    // STATUS
    // ==============================

    if (
        aufgabe.status
        ===
        "offen"
    ) {

        punkte +=
            10;

    }

    else if (
        aufgabe.status
        ===
        "in Bearbeitung"
    ) {

        punkte +=
            5;

    }

    else if (
        aufgabe.status
        ===
        "erledigt"
    ) {

        punkte -=
            100;

    }



    // ==============================
    // NOCH BENÖTIGTE ZEIT
    // ==============================

    const zeitaufwand =
        Number(
            aufgabe.zeitaufwand
            ||
            0
        );


    const investiert =
        Number(
            aufgabe.investierteZeit
            ||
            0
        );


    const restzeit =
        Math.max(

            0,

            zeitaufwand
            -
            investiert

        );


    if (
        restzeit >= 5
    ) {

        punkte +=
            20;

    }

    else if (
        restzeit >= 3
    ) {

        punkte +=
            15;

    }

    else if (
        restzeit >= 1
    ) {

        punkte +=
            10;

    }



    return punkte;

}



// ======================================================
// AUFGABEN FILTERN UND ANZEIGEN
// ======================================================

function zeigeAufgaben() {

    const liste =
        document
            .getElementById(
                "aufgabenListe"
            );


    const suche =
        document
            .getElementById(
                "suche"
            )
            .value
            .toLowerCase();


    const fach =
        document
            .getElementById(
                "fachFilter"
            )
            .value;


    const status =
        document
            .getElementById(
                "statusFilter"
            )
            .value;


    const typ =
        document
            .getElementById(
                "typFilter"
            )
            .value;



    let gefiltert =
        [...aufgaben];



    if (
        suche !== ""
    ) {

        gefiltert =
            gefiltert.filter(
                aufgabe =>

                    aufgabe.aufgabe
                        .toLowerCase()
                        .includes(
                            suche
                        )

                    ||

                    aufgabe.fach
                        .toLowerCase()
                        .includes(
                            suche
                        )
            );

    }



    if (
        fach !==
        "alle"
    ) {

        gefiltert =
            gefiltert.filter(
                aufgabe =>

                    aufgabe.fach
                    ===
                    fach
            );

    }



    if (
        status !==
        "alle"
    ) {

        gefiltert =
            gefiltert.filter(
                aufgabe =>

                    aufgabe.status
                    ===
                    status
            );

    }



    if (
        typ !==
        "alle"
    ) {

        gefiltert =
            gefiltert.filter(
                aufgabe =>

                    aufgabe.typ
                    ===
                    typ
            );

    }



    // ==================================================
    // SORTIERUNG NACH DRINGLICHKEITSALGORITHMUS
    // ==================================================

    gefiltert.sort(

        (
            a,
            b
        ) =>

            berechneDringlichkeit(
                b
            )

            -

            berechneDringlichkeit(
                a
            )

    );



    liste.innerHTML =
        "";



    if (
        gefiltert.length
        ===
        0
    ) {

        liste.innerHTML =

            `
            <div class="leer">

                Keine passenden Aufgaben gefunden.

            </div>
            `;

        return;

    }



    gefiltert.forEach(
        aufgabe => {

            liste.appendChild(

                erstelleAufgabenKarte(
                    aufgabe,
                    true
                )

            );

        }
    );

}



// ======================================================
// AUFGABENKARTE ERSTELLEN
// ======================================================

function erstelleAufgabenKarte(
    aufgabe,
    mitButtons
) {

    const tage =
        tageBisDeadline(
            aufgabe.deadline
        );


    const deadline =
        deadlineText(
            tage
        );


    const dringlichkeit =
        berechneDringlichkeit(
            aufgabe
        );


    const zeitaufwand =
        Number(
            aufgabe.zeitaufwand
            ||
            0
        );


    const investierteZeit =
        Number(
            aufgabe.investierteZeit
            ||
            0
        );


    const restzeit =
        Math.max(

            0,

            zeitaufwand
            -
            investierteZeit

        );


    const karte =
        document
            .createElement(
                "div"
            );


    karte.className =
        `aufgaben-karte ${aufgabe.prioritaet}`;



    karte.innerHTML = `


        <div class="kartenkopf">


            <h3>

                ${aufgabe.aufgabe}

            </h3>


            <span
                class="
                    prio
                    prio-${aufgabe.prioritaet}
                "
            >

                ${aufgabe.prioritaet}

            </span>


        </div>



        <div>


            <span class="fach-badge">

                ${aufgabe.fach}

            </span>


            <span class="typ-badge">

                ${aufgabe.typ || "Lernaufgabe"}

            </span>


        </div>



        <div class="karten-info">

            📅 Deadline:

            <strong>

                ${deutschesDatum(
                    aufgabe.deadline
                )}

            </strong>

        </div>



        <div class="karten-info">

            📌 Status:

            ${aufgabe.status}

        </div>



        <div class="karten-info">

            ⏱ Geschätzter Aufwand:

            ${zeitaufwand.toFixed(1)}
            Stunden

        </div>



        <div class="karten-info">

            ✅ Bereits investiert:

            ${investierteZeit.toFixed(1)}
            Stunden

        </div>



        <div class="karten-info">

            ⌛ Noch benötigte Zeit:

            <strong>

                ${restzeit.toFixed(1)}
                Stunden

            </strong>

        </div>



        ${
            aufgabe.notiz

            ?

            `
            <div class="karten-info">

                📝 ${aufgabe.notiz}

            </div>
            `

            :

            ""
        }



        <div
            class="
                deadline
                ${deadline.klasse}
            "
        >

            ${deadline.text}

        </div>



        <div class="dringlichkeit">

            🔥 Dringlichkeitswert:

            ${dringlichkeit}
            Punkte

        </div>



        ${
            mitButtons

            ?

            `
            <div class="aktionen">


                <button

                    class="btn-gelb"

                    onclick="
                        aufgabeBearbeiten(
                            ${aufgabe.id}
                        )
                    "
                >

                    Bearbeiten

                </button>



                <button

                    class="btn-rot"

                    onclick="
                        aufgabeLoeschen(
                            ${aufgabe.id}
                        )
                    "
                >

                    Löschen

                </button>


            </div>
            `

            :

            ""
        }


    `;


    return karte;

}



// ======================================================
// DASHBOARD AUFGABEN
// ======================================================

function zeigeDashboardAufgaben() {

    const liste =
        document
            .getElementById(
                "dashboardAufgaben"
            );


    liste.innerHTML =
        "";



    const wichtigste =
        [...aufgaben]

        .filter(
            aufgabe =>

                aufgabe.status
                !==
                "erledigt"
        )

        .sort(

            (
                a,
                b
            ) =>

                berechneDringlichkeit(
                    b
                )

                -

                berechneDringlichkeit(
                    a
                )

        )

        .slice(
            0,
            3
        );



    wichtigste.forEach(
        aufgabe => {

            liste.appendChild(

                erstelleAufgabenKarte(
                    aufgabe,
                    false
                )

            );

        }
    );

}



// ======================================================
// DASHBOARD LERNZIELE
// ======================================================

function zeigeDashboardZiele() {

    const container =
        document
            .getElementById(
                "dashboardZiele"
            );


    container.innerHTML =
        "";



    faecher.forEach(
        fach => {


            const prozent =
                Math.min(

                    100,

                    Math.round(

                        (
                            fach.gelernt
                            /
                            fach.ziel
                        )

                        *

                        100

                    )

                );



            const box =
                document
                    .createElement(
                        "div"
                    );


            box.className =
                "mini-ziel";



            box.innerHTML = `


                <h4>

                    ${fach.name}

                </h4>


                <p>

                    ${fach.gelernt.toFixed(2)}

                    von

                    ${fach.ziel}

                    Stunden gelernt

                </p>


                <div class="progress">


                    <div

                        class="progress-inner"

                        style="
                            width:
                            ${prozent}%;
                        "

                    ></div>


                </div>


            `;


            container
                .appendChild(
                    box
                );

        }
    );

}



// ======================================================
// ÜBERSICHT
// ======================================================

function aktualisiereUebersicht() {

    document
        .getElementById(
            "gesamt"
        )
        .textContent =
        aufgaben.length;



    document
        .getElementById(
            "offen"
        )
        .textContent =

        aufgaben.filter(
            aufgabe =>

                aufgabe.status
                !==
                "erledigt"

        ).length;



    document
        .getElementById(
            "dringend"
        )
        .textContent =

        aufgaben.filter(
            aufgabe => {

                if (
                    aufgabe.status
                    ===
                    "erledigt"
                ) {

                    return false;

                }


                return (

                    berechneDringlichkeit(
                        aufgabe
                    )

                    >=

                    70

                );

            }

        ).length;

}



// ======================================================
// BEISPIELDATEN ZURÜCKSETZEN
// ======================================================

function demoDatenZuruecksetzen() {

    const bestaetigen =
        confirm(

            "Alle selbst eingegebenen StudyBuddy-Daten werden gelöscht und die Beispieldaten wiederhergestellt. Fortfahren?"

        );


    if (
        !bestaetigen
    ) {

        return;

    }


    faecher =
        standardFaecher.map(
            fach => ({
                ...fach
            })
        );


    aufgaben =
        standardAufgaben.map(
            aufgabe => ({
                ...aufgabe
            })
        );


    speichern();


    aktualisiereFaecher();


    zeigeAufgaben();


    aktualisiereUebersicht();


    zeigeDashboardAufgaben();


    zeigeDashboardZiele();


    alert(
        "Die Beispieldaten wurden wiederhergestellt."
    );

}



// ======================================================
// APP START
// ======================================================

speichern();


aktualisiereFaecher();


zeigeAufgaben();


aktualisiereUebersicht();


zeigeDashboardAufgaben();


zeigeDashboardZiele();
