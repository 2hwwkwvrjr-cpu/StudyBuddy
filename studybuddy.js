let faecher = [];
let aufgaben = [];

let aktiverTimer = null;
let timerStart = null;
let timerInterval = null;

let kalenderDatum = new Date();



const fachFarben = [

    {
        hintergrund: "#e3f8ee",
        text: "#438965",
        rand: "#94dfbd"
    },

    {
        hintergrund: "#eee9fb",
        text: "#705ba4",
        rand: "#ad9ade"
    },

    {
        hintergrund: "#fff7d5",
        text: "#806c1e",
        rand: "#f3dc7c"
    },

    {
        hintergrund: "#e8f5ff",
        text: "#4d7e9f",
        rand: "#9bc9ea"
    },

    {
        hintergrund: "#fff0f2",
        text: "#a95762",
        rand: "#efa4ad"
    },

    {
        hintergrund: "#fff0df",
        text: "#9b6735",
        rand: "#f2b981"
    },

    {
        hintergrund: "#edf5d8",
        text: "#64783c",
        rand: "#bace7d"
    },

    {
        hintergrund: "#f4e9ff",
        text: "#80599c",
        rand: "#c8a5e1"
    }

];



function farbeFuerFach(fachName) {

    const index =
        faecher.findIndex(
            fach =>
                fach.name === fachName
        );


    if (index === -1) {

        return fachFarben[0];
    }


    return fachFarben[
        index % fachFarben.length
    ];
}



function darkModeLaden() {

    const gespeichert =
        localStorage.getItem(
            "studybuddy_darkmode"
        );


    if (gespeichert === "true") {

        document.body
            .classList
            .add(
                "dark-mode"
            );
    }


    darkModeButtonAktualisieren();
}



function darkModeUmschalten() {

    document.body
        .classList
        .toggle(
            "dark-mode"
        );


    const aktiv =
        document.body
            .classList
            .contains(
                "dark-mode"
            );


    localStorage.setItem(
        "studybuddy_darkmode",
        aktiv
    );


    darkModeButtonAktualisieren();
}



function darkModeButtonAktualisieren() {

    const icon =
        document.getElementById(
            "darkmodeIcon"
        );


    const text =
        document.getElementById(
            "darkmodeText"
        );


    if (!icon || !text) {

        return;
    }


    const aktiv =
        document.body
            .classList
            .contains(
                "dark-mode"
            );


    if (aktiv) {

        icon.textContent =
            "☀️";

        text.textContent =
            "Light Mode";

    } else {

        icon.textContent =
            "🌙";

        text.textContent =
            "Dark Mode";
    }
}



async function appStarten() {

    darkModeLaden();


    const gespeicherteFaecher =
        localStorage.getItem(
            "studybuddy_faecher"
        );


    const gespeicherteAufgaben =
        localStorage.getItem(
            "studybuddy_aufgaben"
        );


    if (
        gespeicherteFaecher
        &&
        gespeicherteAufgaben
    ) {

        faecher =
            JSON.parse(
                gespeicherteFaecher
            );


        aufgaben =
            JSON.parse(
                gespeicherteAufgaben
            );

    } else {

        try {

            const response =
                await fetch(
                    "studybuddy_data.json"
                );


            const daten =
                await response.json();


            faecher =
                daten.faecher.map(
                    fach => ({

                        name:
                            fach.name,

                        gelernt:
                            Number(
                                fach.gelernteStunden
                                ??
                                fach.gelernt
                                ??
                                0
                            )

                    })
                );


            aufgaben =
                daten.aufgaben;

        } catch (fehler) {

            console.error(
                fehler
            );


            faecher = [];

            aufgaben = [];
        }
    }


    faecher =
        faecher.map(
            fach => ({

                name:
                    fach.name,

                gelernt:
                    Number(
                        fach.gelernt || 0
                    )

            })
        );


    pruefeAutomatischErledigteAufgaben();


    speichern();

    allesAktualisieren();
}



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



function zeigeSeite(
    seitenId,
    button
) {

    document
        .querySelectorAll(
            ".seite"
        )
        .forEach(
            seite =>
                seite
                    .classList
                    .remove(
                        "active"
                    )
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
            navButton =>
                navButton
                    .classList
                    .remove(
                        "active"
                    )
        );


    button
        .classList
        .add(
            "active"
        );


    if (
        seitenId ===
        "kalender"
    ) {

        zeigeKalender();
    }


    if (
        seitenId ===
        "faecher"
    ) {

        aktualisiereFaecher();
    }
}



// ======================================================
// BERECHNUNGSLOGIK:
// TAGE BIS ZUR DEADLINE
// ======================================================
//
// Berechnet die Anzahl der Tage zwischen heute
// und der Deadline.
//
// Diese Berechnung wird sowohl für die
// Dringlichkeit als auch für das automatische
// Wochenziel verwendet.
//

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
            deadline + "T00:00:00"
        );


    datum.setHours(
        0,
        0,
        0,
        0
    );


    return Math.ceil(

        (
            datum -
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



function deutschesDatum(
    datum
) {

    const teile =
        datum.split("-");


    return (
        teile[2]
        +
        "."
        +
        teile[1]
        +
        "."
        +
        teile[0]
    );
}



// ======================================================
// ENTSCHEIDUNGSLOGIK:
// AUFGABE AUTOMATISCH ERLEDIGEN
// ======================================================
//
// Wenn:
//
// investierteZeit >= zeitaufwand
//
// wird die Aufgabe automatisch als erledigt markiert.
//
// Beispiel:
//
// Aufwand:     8 h
// Investiert:  8 h
//
// Ergebnis:
//
// ✅ Erledigt
//

function pruefeAutomatischErledigteAufgaben() {

    aufgaben.forEach(
        aufgabe => {


            const aufwand =
                Number(
                    aufgabe.zeitaufwand || 0
                );


            const investiert =
                Number(
                    aufgabe.investierteZeit || 0
                );


            if (
                aufwand > 0
                &&
                investiert >= aufwand
            ) {

                aufgabe.status =
                    "erledigt";
            }

        }
    );
}



// ======================================================
// HAUPTALGORITHMUS:
// DRINGLICHKEIT EINER AUFGABE
// ======================================================
//
// Berücksichtigt:
//
// - Deadline
// - Priorität
// - Gesamtaufwand
// - investierte Zeit
// - Restaufwand
// - benötigte Stunden pro Tag
//
//
// Restaufwand:
//
// zeitaufwand - investierteZeit
//
//
// Stunden pro Tag:
//
// Restaufwand / verbleibende Tage
//
//
// Ergebnis:
//
// 😰 Sehr dringend
// 😬 Dringend
// 🙂 Bald einplanen
// 😌 Noch genug Zeit
// ✅ Erledigt
//

function berechneDringlichkeit(
    aufgabe
) {

    if (
        aufgabe.status ===
        "erledigt"
    ) {

        return {

            rang: 0,

            emoji: "✅",

            text: "Erledigt",

            klasse: "fertig",

            stundenProTag: 0

        };
    }


    const tage =
        tageBisDeadline(
            aufgabe.deadline
        );


    const aufwand =
        Number(
            aufgabe.zeitaufwand || 0
        );


    const investiert =
        Number(
            aufgabe.investierteZeit || 0
        );


    const restaufwand =
        Math.max(

            0,

            aufwand -
            investiert

        );


    if (
        aufwand > 0
        &&
        restaufwand === 0
    ) {

        return {

            rang: 0,

            emoji: "✅",

            text: "Erledigt",

            klasse: "fertig",

            stundenProTag: 0

        };
    }


    let stundenProTag;


    if (
        tage > 0
    ) {

        stundenProTag =
            restaufwand /
            tage;

    } else {

        stundenProTag =
            restaufwand > 0
                ?
                Infinity
                :
                0;
    }


    if (
        tage <= 1
        ||
        stundenProTag >= 2.5
    ) {

        return {

            rang: 4,

            emoji: "😰",

            text: "Sehr dringend",

            klasse: "sehr-dringend",

            stundenProTag:
                stundenProTag

        };
    }


    if (
        tage <= 3
        ||
        stundenProTag >= 1.5
        ||
        (
            aufgabe.prioritaet ===
            "hoch"
            &&
            tage <= 5
        )
    ) {

        return {

            rang: 3,

            emoji: "😬",

            text: "Dringend",

            klasse: "dringend",

            stundenProTag:
                stundenProTag

        };
    }


    if (
        tage <= 7
        ||
        stundenProTag >= 0.75
        ||
        aufgabe.prioritaet ===
        "hoch"
    ) {

        return {

            rang: 2,

            emoji: "🙂",

            text: "Bald einplanen",

            klasse: "bald",

            stundenProTag:
                stundenProTag

        };
    }


    return {

        rang: 1,

        emoji: "😌",

        text: "Noch genug Zeit",

        klasse: "genug-zeit",

        stundenProTag:
            stundenProTag

    };
}



// ======================================================
// HAUPTALGORITHMUS:
// AUTOMATISCHES WOCHENZIEL
// ======================================================
//
// Das Wochenziel wird NICHT mehr manuell eingegeben.
//
// Für jede offene Aufgabe wird zuerst berechnet:
//
// Restaufwand =
// Zeitaufwand - investierte Zeit
//
//
// Danach wird berechnet,
// wie viel davon pro Tag erledigt werden sollte:
//
// Restaufwand / verbleibende Tage
//
//
// Anschließend wird nur der Anteil berechnet,
// der noch in DIESE WOCHE fällt.
//
// Beispiel:
//
// Restaufwand: 12 Stunden
// Noch 21 Tage bis Deadline
//
// 12 / 21 = ca. 0,57 Stunden pro Tag
//
// Sind noch 5 Tage bis Sonntag:
//
// 0,57 * 5 = ca. 2,85 Stunden
//
// Diese Aufgabe erhöht das aktuelle Wochenziel
// also nur um ca. 2,85 Stunden.
//
// Gibt es mehrere Aufgaben für ein Fach,
// werden deren Wochenanteile addiert.
//

function wochenAnteilAufgabe(
    aufgabe
) {

    if (
        aufgabe.status ===
        "erledigt"
    ) {

        return 0;
    }


    const aufwand =
        Number(
            aufgabe.zeitaufwand || 0
        );


    const investiert =
        Number(
            aufgabe.investierteZeit || 0
        );


    const restaufwand =
        Math.max(

            0,

            aufwand -
            investiert

        );


    if (
        restaufwand <= 0
    ) {

        return 0;
    }


    const tage =
        tageBisDeadline(
            aufgabe.deadline
        );


    if (
        tage <= 0
    ) {

        return restaufwand;
    }


    const heute =
        new Date();


    const wochentag =
        heute.getDay();


    const tageBisSonntag =
        wochentag === 0
            ?
            1
            :
            8 - wochentag;


    const tageGesamt =
        tage + 1;


    const tageDieseWoche =
        Math.min(

            tageGesamt,

            tageBisSonntag

        );


    const stundenProTag =
        restaufwand /
        tageGesamt;


    return (
        stundenProTag
        *
        tageDieseWoche
    );
}



function wochenzielFuerFach(
    fachName
) {

    const ziel =
        aufgaben

        .filter(
            aufgabe =>
                aufgabe.fach ===
                    fachName
                &&
                aufgabe.status !==
                    "erledigt"
        )

        .reduce(
            (
                summe,
                aufgabe
            ) =>

                summe
                +
                wochenAnteilAufgabe(
                    aufgabe
                ),

            0
        );


    return Math.round(
        ziel * 100
    ) / 100;
}



function gesamtesWochenziel() {

    return faecher.reduce(
        (
            summe,
            fach
        ) =>

            summe
            +
            wochenzielFuerFach(
                fach.name
            ),

        0
    );
}



// ======================================================
// ALGORITHMUS:
// AUTOMATISCHE SORTIERUNG
// ======================================================
//
// Sortiert nach:
//
// 1. Dringlichkeit
// 2. benötigten Stunden pro Tag
// 3. Deadline
//

function sortiereAufgaben(
    liste
) {

    return liste.sort(
        (
            a,
            b
        ) => {


            const aInfo =
                berechneDringlichkeit(
                    a
                );


            const bInfo =
                berechneDringlichkeit(
                    b
                );


            if (
                bInfo.rang !==
                aInfo.rang
            ) {

                return (
                    bInfo.rang -
                    aInfo.rang
                );
            }


            if (
                bInfo.stundenProTag !==
                aInfo.stundenProTag
            ) {

                return (
                    bInfo.stundenProTag -
                    aInfo.stundenProTag
                );
            }


            return (
                new Date(
                    a.deadline
                )
                -
                new Date(
                    b.deadline
                )
            );

        }
    );
}



function updateAufgabe(
    id,
    feld,
    wert
) {

    const aufgabe =
        aufgaben.find(
            aufgabe =>
                aufgabe.id === id
        );


    if (!aufgabe) {

        return;
    }


    if (
        feld ===
            "zeitaufwand"
        ||
        feld ===
            "investierteZeit"
    ) {

        wert =
            Number(
                wert
            );


        if (
            Number.isNaN(
                wert
            )
            ||
            wert < 0
        ) {

            wert = 0;
        }
    }


    aufgabe[feld] =
        wert;


    pruefeAutomatischErledigteAufgaben();


    speichern();

    allesAktualisieren();
}



function erledigtUmschalten(
    id
) {

    const aufgabe =
        aufgaben.find(
            aufgabe =>
                aufgabe.id === id
        );


    if (!aufgabe) {

        return;
    }


    if (
        aufgabe.status ===
        "erledigt"
    ) {

        aufgabe.status =
            "offen";


        if (
            Number(
                aufgabe.zeitaufwand
            ) > 0
            &&
            Number(
                aufgabe.investierteZeit
            )
            >=
            Number(
                aufgabe.zeitaufwand
            )
        ) {

            aufgabe.investierteZeit =
                Math.max(

                    0,

                    Number(
                        aufgabe.zeitaufwand
                    )
                    -
                    0.5

                );
        }

    } else {

        aufgabe.status =
            "erledigt";
    }


    speichern();

    allesAktualisieren();
}



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


    let status =
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
        zeitaufwand > 0
        &&
        investierteZeit
        >=
        zeitaufwand
    ) {

        status =
            "erledigt";
    }


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
            zeitaufwand || 0,

        investierteZeit:
            investierteZeit || 0,

        notiz:
            notiz

    });


    formularLeeren();


    speichern();

    allesAktualisieren();
}



function formularLeeren() {

    document.getElementById(
        "aufgabeName"
    ).value = "";


    document.getElementById(
        "aufgabeFach"
    ).value = "";


    document.getElementById(
        "deadline"
    ).value = "";


    document.getElementById(
        "zeitaufwand"
    ).value = "";


    document.getElementById(
        "investierteZeit"
    ).value = "";


    document.getElementById(
        "notiz"
    ).value = "";


    document.getElementById(
        "typ"
    ).value =
        "Prüfung";


    document.getElementById(
        "prioritaet"
    ).value =
        "hoch";


    document.getElementById(
        "status"
    ).value =
        "offen";
}



function aufgabeLoeschen(
    id
) {

    if (
        !confirm(
            "Aufgabe wirklich löschen?"
        )
    ) {

        return;
    }


    aufgaben =
        aufgaben.filter(
            aufgabe =>
                aufgabe.id !==
                id
        );


    speichern();

    allesAktualisieren();
}



function sichererText(
    text
) {

    return String(
        text ?? ""
    )

    .replaceAll(
        "&",
        "&amp;"
    )

    .replaceAll(
        "\"",
        "&quot;"
    )

    .replaceAll(
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    );
}



function erstelleAufgabenKarte(
    aufgabe,
    bearbeitbar
) {

    const info =
        berechneDringlichkeit(
            aufgabe
        );


    const restzeit =
        Math.max(

            0,

            Number(
                aufgabe.zeitaufwand || 0
            )
            -
            Number(
                aufgabe.investierteZeit || 0
            )

        );


    const farbe =
        farbeFuerFach(
            aufgabe.fach
        );


    const karte =
        document.createElement(
            "div"
        );


    karte.className =
        "aufgaben-karte";


    karte.style.borderLeft =
        `6px solid ${farbe.rand}`;


    if (
        bearbeitbar
    ) {

        karte.innerHTML = `

            <input
                class="aufgabe-titel"

                value="${sichererText(
                    aufgabe.aufgabe
                )}"

                onchange="
                    updateAufgabe(
                        ${aufgabe.id},
                        'aufgabe',
                        this.value
                    )
                "
            >


            <div class="badges">

                <span
                    class="fach-badge"

                    style="
                        background:
                        ${farbe.hintergrund};

                        color:
                        ${farbe.text};
                    "
                >
                    ${sichererText(
                        aufgabe.fach
                    )}
                </span>


                <span class="typ-badge">

                    ${sichererText(
                        aufgabe.typ
                    )}

                </span>

            </div>


            <div class="edit-row">

                <label>📚 Fach</label>

                <select
                    class="inline-select"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'fach',
                            this.value
                        )
                    "
                >

                    ${faecher.map(
                        fach => `

                            <option
                                value="${sichererText(
                                    fach.name
                                )}"

                                ${
                                    fach.name
                                    ===
                                    aufgabe.fach

                                    ?

                                    "selected"

                                    :

                                    ""
                                }
                            >
                                ${sichererText(
                                    fach.name
                                )}
                            </option>

                        `
                    ).join("")}

                </select>

            </div>


            <div class="edit-row">

                <label>📝 Typ</label>

                <select
                    class="inline-select"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'typ',
                            this.value
                        )
                    "
                >

                    ${[
                        "Prüfung",
                        "Abgabe",
                        "Hausübung",
                        "Lernaufgabe",
                        "Projekt",
                        "Sonstiges"

                    ].map(
                        typ => `

                            <option
                                value="${typ}"

                                ${
                                    typ ===
                                    aufgabe.typ

                                    ?

                                    "selected"

                                    :

                                    ""
                                }
                            >
                                ${typ}
                            </option>

                        `
                    ).join("")}

                </select>

            </div>


            <div class="edit-row">

                <label>📅 Deadline</label>

                <input
                    class="inline-input"

                    type="date"

                    value="${aufgabe.deadline}"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'deadline',
                            this.value
                        )
                    "
                >

            </div>


            <div class="edit-row">

                <label>🚦 Priorität</label>

                <select
                    class="inline-select"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'prioritaet',
                            this.value
                        )
                    "
                >

                    <option
                        value="hoch"
                        ${
                            aufgabe.prioritaet ===
                            "hoch"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        Hoch
                    </option>


                    <option
                        value="mittel"
                        ${
                            aufgabe.prioritaet ===
                            "mittel"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        Mittel
                    </option>


                    <option
                        value="niedrig"
                        ${
                            aufgabe.prioritaet ===
                            "niedrig"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        Niedrig
                    </option>

                </select>

            </div>


            <div class="edit-row">

                <label>📌 Status</label>

                <select
                    class="inline-select"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'status',
                            this.value
                        )
                    "
                >

                    <option
                        value="offen"
                        ${
                            aufgabe.status ===
                            "offen"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        Offen
                    </option>


                    <option
                        value="in Bearbeitung"
                        ${
                            aufgabe.status ===
                            "in Bearbeitung"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        In Bearbeitung
                    </option>


                    <option
                        value="erledigt"
                        ${
                            aufgabe.status ===
                            "erledigt"
                            ?
                            "selected"
                            :
                            ""
                        }
                    >
                        Erledigt
                    </option>

                </select>

            </div>


            <div class="edit-row">

                <label>⏱ Aufwand</label>

                <input
                    class="inline-input"

                    type="number"

                    min="0"

                    step="0.5"

                    value="${Number(
                        aufgabe.zeitaufwand || 0
                    )}"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'zeitaufwand',
                            this.value
                        )
                    "
                >

            </div>


            <div class="edit-row">

                <label>✅ Investiert</label>

                <input
                    class="inline-input"

                    type="number"

                    min="0"

                    step="0.5"

                    value="${Number(
                        aufgabe.investierteZeit || 0
                    )}"

                    onchange="
                        updateAufgabe(
                            ${aufgabe.id},
                            'investierteZeit',
                            this.value
                        )
                    "
                >

            </div>


            <div class="restzeit">

                Noch benötigte Zeit:

                <strong>

                    ${restzeit.toFixed(1)}
                    Stunden

                </strong>

            </div>


            <textarea
                class="notiz-inline"

                placeholder="Notiz..."

                onchange="
                    updateAufgabe(
                        ${aufgabe.id},
                        'notiz',
                        this.value
                    )
                "
            >${sichererText(
                aufgabe.notiz
            )}</textarea>


            <div
                class="
                    dringlichkeit
                    ${info.klasse}
                "
            >

                ${info.emoji}

                ${info.text}

            </div>


            <div class="aktionen">

                <button
                    class="btn-erledigt"

                    onclick="
                        erledigtUmschalten(
                            ${aufgabe.id}
                        )
                    "
                >
                    ✓ Als erledigt markieren
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

        `;

    } else {

        karte.innerHTML = `

            <h3>
                ${sichererText(
                    aufgabe.aufgabe
                )}
            </h3>


            <div class="badges">

                <span
                    class="fach-badge"

                    style="
                        background:
                        ${farbe.hintergrund};

                        color:
                        ${farbe.text};
                    "
                >

                    ${sichererText(
                        aufgabe.fach
                    )}

                </span>


                <span class="typ-badge">

                    ${sichererText(
                        aufgabe.typ
                    )}

                </span>

            </div>


            <div class="restzeit">

                📅

                ${deutschesDatum(
                    aufgabe.deadline
                )}

            </div>


            <div class="restzeit">

                ⌛ Noch

                ${restzeit.toFixed(1)}

                Stunden

            </div>


            <div
                class="
                    dringlichkeit
                    ${info.klasse}
                "
            >

                ${info.emoji}

                ${info.text}

            </div>

        `;
    }


    return karte;
}



function erstelleErledigtKarte(
    aufgabe
) {

    const karte =
        erstelleAufgabenKarte(
            aufgabe,
            false
        );


    karte.innerHTML =
        `

        <div class="erledigt-banner">
            ✅ Erledigt
        </div>

        `

        +

        karte.innerHTML

        +

        `

        <div class="aktionen">

            <button
                class="btn-erledigt"

                onclick="
                    erledigtUmschalten(
                        ${aufgabe.id}
                    )
                "
            >
                ↩ Wieder öffnen
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

        `;


    return karte;
}



function zeigeAufgaben() {

    const liste =
        document.getElementById(
            "aufgabenListe"
        );


    const suche =
        document.getElementById(
            "suche"
        )
        .value
        .toLowerCase();


    const fach =
        document.getElementById(
            "fachFilter"
        )
        .value;


    const status =
        document.getElementById(
            "statusFilter"
        )
        .value;


    const typ =
        document.getElementById(
            "typFilter"
        )
        .value;


    let gefiltert =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status !==
                "erledigt"
        );


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
                    aufgabe.fach ===
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
                    aufgabe.status ===
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
                    aufgabe.typ ===
                    typ
            );
    }


    sortiereAufgaben(
        gefiltert
    );


    liste.innerHTML = "";


    if (
        gefiltert.length === 0
    ) {

        liste.innerHTML = `

            <div class="leer">
                Keine offenen Aufgaben gefunden. 🎉
            </div>

        `;


        return;
    }


    gefiltert.forEach(
        aufgabe =>

            liste.appendChild(

                erstelleAufgabenKarte(
                    aufgabe,
                    true
                )

            )
    );
}



function zeigeErledigteAufgaben() {

    const container =
        document.getElementById(
            "erledigteAufgaben"
        );


    const erledigte =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status ===
                "erledigt"
        );


    container.innerHTML = "";


    if (
        erledigte.length === 0
    ) {

        container.innerHTML = `

            <div class="leer">
                Noch keine erledigten Aufgaben.
            </div>

        `;


        return;
    }


    erledigte.forEach(
        aufgabe =>

            container.appendChild(

                erstelleErledigtKarte(
                    aufgabe
                )

            )
    );
}



function zeigeHeute() {

    const container =
        document.getElementById(
            "heuteAufgaben"
        );


    const text =
        document.getElementById(
            "heuteText"
        );


    const relevante =
        aufgaben.filter(
            aufgabe => {

                if (
                    aufgabe.status ===
                    "erledigt"
                ) {

                    return false;
                }


                return (
                    tageBisDeadline(
                        aufgabe.deadline
                    )
                    <=
                    2
                );

            }
        );


    sortiereAufgaben(
        relevante
    );


    container.innerHTML = "";


    if (
        relevante.length ===
        0
    ) {

        text.textContent =
            "🎉 In den nächsten zwei Tagen ist nichts fällig.";


        return;
    }


    text.textContent =
        `${relevante.length} Aufgabe(n) sind jetzt besonders wichtig.`;


    relevante.forEach(
        aufgabe =>

            container.appendChild(

                erstelleAufgabenKarte(
                    aufgabe,
                    false
                )

            )
    );
}



function zeigeDashboardAufgaben() {

    const container =
        document.getElementById(
            "dashboardAufgaben"
        );


    const liste =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status !==
                "erledigt"
        );


    sortiereAufgaben(
        liste
    );


    container.innerHTML = "";


    liste
        .slice(
            0,
            3
        )
        .forEach(
            aufgabe =>

                container.appendChild(

                    erstelleAufgabenKarte(
                        aufgabe,
                        false
                    )

                )
        );
}



function aktualisiereUebersicht() {

    document.getElementById(
        "gesamt"
    ).textContent =
        aufgaben.length;


    document.getElementById(
        "offen"
    ).textContent =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status !==
                "erledigt"
        ).length;


    document.getElementById(
        "dringend"
    ).textContent =
        aufgaben.filter(
            aufgabe =>

                aufgabe.status !==
                    "erledigt"

                &&

                berechneDringlichkeit(
                    aufgabe
                ).rang >= 3
        ).length;
}



// ======================================================
// BERECHNUNGSLOGIK:
// GESAMTER WOCHENFORTSCHRITT
// ======================================================
//
// Alle automatisch berechneten Fachziele
// werden addiert.
//
// Danach:
//
// gelernte Stunden / Wochenziel * 100
//

function aktualisiereWochenstatistik() {

    const gelernt =
        faecher.reduce(
            (
                summe,
                fach
            ) =>

                summe
                +
                Number(
                    fach.gelernt || 0
                ),

            0
        );


    const ziel =
        gesamtesWochenziel();


    let prozent = 0;


    if (
        ziel > 0
    ) {

        prozent =
            Math.round(

                gelernt
                /
                ziel
                *
                100

            );
    }


    document.getElementById(
        "wochenStunden"
    ).textContent =
        `${gelernt.toFixed(2)} h`;


    document.getElementById(
        "wochenZiel"
    ).textContent =
        `${ziel.toFixed(2)} h`;


    document.getElementById(
        "wochenProzent"
    ).textContent =
        `${prozent} % erreicht`;


    document.getElementById(
        "wochenProgress"
    ).style.width =
        `${Math.min(
            100,
            prozent
        )}%`;
}



function fachHinzufuegen() {

    const name =
        document
            .getElementById(
                "neuesFach"
            )
            .value
            .trim();


    if (
        name === ""
    ) {

        alert(
            "Bitte einen Fachnamen eingeben."
        );

        return;
    }


    const existiert =
        faecher.some(
            fach =>
                fach.name
                .toLowerCase()
                ===
                name.toLowerCase()
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

        gelernt:
            0

    });


    document.getElementById(
        "neuesFach"
    ).value = "";


    speichern();

    allesAktualisieren();
}



function fachLoeschen(
    index
) {

    const fach =
        faecher[index];


    const benutzt =
        aufgaben.some(
            aufgabe =>
                aufgabe.fach ===
                fach.name
        );


    if (
        benutzt
    ) {

        alert(
            "Dieses Fach wird noch bei Aufgaben verwendet."
        );

        return;
    }


    if (
        confirm(
            `Fach "${fach.name}" löschen?`
        )
    ) {

        faecher.splice(
            index,
            1
        );


        speichern();

        allesAktualisieren();
    }
}



// ======================================================
// BERECHNUNGSLOGIK:
// LERNZEIT ADDIEREN UND SUBTRAHIEREN
// ======================================================
//
// +0.5 = +30 Minuten
// +1   = +1 Stunde
//
// -0.5 = -30 Minuten
// -1   = -1 Stunde
//
// Die Lernzeit darf niemals negativ werden.
//

function lernzeitAendern(
    index,
    stunden
) {

    faecher[index].gelernt +=
        stunden;


    if (
        faecher[index].gelernt < 0
    ) {

        faecher[index].gelernt =
            0;
    }


    faecher[index].gelernt =
        Math.round(

            faecher[index].gelernt
            *
            100

        )

        /

        100;


    speichern();

    allesAktualisieren();
}



function sliderAendern(
    index,
    wert
) {

    faecher[index].gelernt =
        Number(
            wert
        );


    speichern();

    allesAktualisieren();
}



function timerStarten(
    index
) {

    if (
        aktiverTimer !==
        null
    ) {

        alert(
            "Es läuft bereits ein Timer."
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



function timerAktualisieren() {

    if (
        aktiverTimer ===
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
        document.getElementById(
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
// BERECHNUNGSLOGIK:
// TIMERZEIT AUTOMATISCH ADDIEREN
// ======================================================
//
// Sekunden / 3600 = Stunden
//
// Beispiel:
//
// 1800 Sekunden / 3600
// = 0,5 Stunden
//
// Diese Zeit wird automatisch zur Lernzeit
// des jeweiligen Faches addiert.
//

function timerStoppen(
    index
) {

    if (
        aktiverTimer !==
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
        sekunden /
        3600;


    faecher[index].gelernt +=
        stunden;


    faecher[index].gelernt =
        Math.round(

            faecher[index].gelernt
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

    allesAktualisieren();
}



function sekundenFormat(
    sekunden
) {

    const stunden =
        Math.floor(
            sekunden /
            3600
        );


    const minuten =
        Math.floor(

            (
                sekunden %
                3600
            )

            /

            60

        );


    const rest =
        sekunden %
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
            rest
        )
        .padStart(
            2,
            "0"
        )

    );
}



function aktualisiereFaecher() {

    const liste =
        document.getElementById(
            "fachListe"
        );


    const aufgabeFach =
        document.getElementById(
            "aufgabeFach"
        );


    const fachFilter =
        document.getElementById(
            "fachFilter"
        );


    liste.innerHTML = "";


    aufgabeFach.innerHTML = `

        <option value="">
            Fach auswählen
        </option>

    `;


    fachFilter.innerHTML = `

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
                document.createElement(
                    "option"
                );


            option.value =
                fach.name;


            option.textContent =
                fach.name;


            aufgabeFach.appendChild(
                option
            );


            const filter =
                document.createElement(
                    "option"
                );


            filter.value =
                fach.name;


            filter.textContent =
                fach.name;


            fachFilter.appendChild(
                filter
            );


            const ziel =
                wochenzielFuerFach(
                    fach.name
                );


            let prozent = 0;


            if (
                ziel > 0
            ) {

                prozent =
                    Math.round(

                        Number(
                            fach.gelernt
                        )

                        /

                        ziel

                        *

                        100

                    );
            }


            const sliderMax =
                Math.max(

                    ziel,

                    fach.gelernt,

                    1

                );


            const farbe =
                farbeFuerFach(
                    fach.name
                );


            const timerLaeuft =
                aktiverTimer ===
                index;


            const karte =
                document.createElement(
                    "div"
                );


            karte.className =
                "fach-card";


            karte.style.borderTop =
                `5px solid ${farbe.rand}`;


            karte.innerHTML = `

                <h3>

                    ${sichererText(
                        fach.name
                    )}

                </h3>


                <div class="wochenziel-auto">

                    🎯 Empfohlenes Wochenziel:

                    ${ziel.toFixed(2)}
                    Stunden

                </div>


                <input
                    class="slider"

                    type="range"

                    min="0"

                    max="${sliderMax}"

                    step="0.25"

                    value="${fach.gelernt}"

                    onchange="
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
                            ${Math.min(
                                100,
                                prozent
                            )}%;

                            background:
                            ${farbe.rand};
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
                        class="btn-rot"

                        onclick="
                            lernzeitAendern(
                                ${index},
                                -0.5
                            )
                        "
                    >
                        − 30 Min.
                    </button>


                    <button
                        class="btn-rot"

                        onclick="
                            lernzeitAendern(
                                ${index},
                                -1
                            )
                        "
                    >
                        − 1 Std.
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


            liste.appendChild(
                karte
            );

        }
    );


    if (
        aktiverTimer !==
        null
    ) {

        timerAktualisieren();
    }
}



function zeigeDashboardZiele() {

    const container =
        document.getElementById(
            "dashboardZiele"
        );


    container.innerHTML = "";


    faecher.forEach(
        fach => {


            const ziel =
                wochenzielFuerFach(
                    fach.name
                );


            const farbe =
                farbeFuerFach(
                    fach.name
                );


            let prozent = 0;


            if (
                ziel > 0
            ) {

                prozent =
                    Math.round(

                        fach.gelernt
                        /
                        ziel
                        *
                        100

                    );
            }


            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "mini-ziel";


            box.style.borderTop =
                `4px solid ${farbe.rand}`;


            box.innerHTML = `

                <h4>

                    ${sichererText(
                        fach.name
                    )}

                </h4>


                <p>

                    ${fach.gelernt.toFixed(2)}
                    h gelernt

                </p>


                <p>

                    🎯 Empfehlung:
                    ${ziel.toFixed(2)}
                    h

                </p>


                <div class="progress">

                    <div
                        class="progress-inner"

                        style="
                            width:
                            ${Math.min(
                                100,
                                prozent
                            )}%;

                            background:
                            ${farbe.rand};
                        "
                    ></div>

                </div>

            `;


            container.appendChild(
                box
            );

        }
    );
}



// ======================================================
// ALGORITHMUS:
// KALENDER NACH DEADLINES AUFBAUEN
// ======================================================
//
// Für jeden Tag des ausgewählten Monats wird geprüft:
//
// Gibt es Aufgaben mit genau dieser Deadline?
//
// Wenn ja:
// Die Aufgabe wird im entsprechenden Kalendertag
// angezeigt.
//
// Die Farbe wird über farbeFuerFach()
// aus dem zugehörigen Fach übernommen.
//

function zeigeKalender() {

    const grid =
        document.getElementById(
            "kalenderGrid"
        );


    const titel =
        document.getElementById(
            "kalenderTitel"
        );


    if (
        !grid
        ||
        !titel
    ) {

        return;
    }


    const jahr =
        kalenderDatum.getFullYear();


    const monat =
        kalenderDatum.getMonth();


    titel.textContent =
        new Date(
            jahr,
            monat,
            1
        )
        .toLocaleDateString(
            "de-DE",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );


    grid.innerHTML = "";


    const ersterTag =
        new Date(
            jahr,
            monat,
            1
        );


    const letzterTag =
        new Date(
            jahr,
            monat + 1,
            0
        );


    let startPosition =
        ersterTag.getDay();


    if (
        startPosition === 0
    ) {

        startPosition =
            7;
    }


    startPosition =
        startPosition - 1;


    for (
        let i = 0;
        i < startPosition;
        i++
    ) {

        const leer =
            document.createElement(
                "div"
            );


        leer.className =
            "kalender-tag leer-tag";


        grid.appendChild(
            leer
        );
    }


    const heute =
        new Date();


    for (
        let tag = 1;
        tag <= letzterTag.getDate();
        tag++
    ) {

        const datum =
            new Date(
                jahr,
                monat,
                tag
            );


        const datumString =
            [
                datum.getFullYear(),

                String(
                    datum.getMonth() + 1
                )
                .padStart(
                    2,
                    "0"
                ),

                String(
                    datum.getDate()
                )
                .padStart(
                    2,
                    "0"
                )

            ].join("-");


        const tagBox =
            document.createElement(
                "div"
            );


        tagBox.className =
            "kalender-tag";


        if (
            datum.getFullYear() ===
                heute.getFullYear()
            &&
            datum.getMonth() ===
                heute.getMonth()
            &&
            datum.getDate() ===
                heute.getDate()
        ) {

            tagBox.classList.add(
                "heute-tag"
            );
        }


        const nummer =
            document.createElement(
                "div"
            );


        nummer.className =
            "kalender-tagnummer";


        nummer.textContent =
            tag;


        tagBox.appendChild(
            nummer
        );


        const tagesAufgaben =
            aufgaben.filter(
                aufgabe =>
                    aufgabe.deadline ===
                    datumString
            );


        tagesAufgaben.forEach(
            aufgabe => {


                const farbe =
                    farbeFuerFach(
                        aufgabe.fach
                    );


                const event =
                    document.createElement(
                        "div"
                    );


                event.className =
                    "kalender-event";


                if (
                    aufgabe.status ===
                    "erledigt"
                ) {

                    event.classList.add(
                        "erledigt-event"
                    );
                }


                event.style.background =
                    farbe.hintergrund;


                event.style.color =
                    farbe.text;


                event.style.borderLeft =
                    `4px solid ${farbe.rand}`;


                event.innerHTML = `

                    ${aufgabe.status ===
                    "erledigt"
                        ?
                        "✅"
                        :
                        "•"
                    }

                    ${sichererText(
                        aufgabe.aufgabe
                    )}

                `;


                event.title =
                    `${aufgabe.fach} | ${aufgabe.typ} | ${deutschesDatum(
                        aufgabe.deadline
                    )}`;


                tagBox.appendChild(
                    event
                );

            }
        );


        grid.appendChild(
            tagBox
        );
    }
}



function kalenderMonatAendern(
    richtung
) {

    kalenderDatum =
        new Date(

            kalenderDatum
                .getFullYear(),

            kalenderDatum
                .getMonth()
                +
                richtung,

            1

        );


    zeigeKalender();
}



function kalenderHeute() {

    kalenderDatum =
        new Date();


    zeigeKalender();
}



function allesAktualisieren() {

    pruefeAutomatischErledigteAufgaben();

    aktualisiereFaecher();

    zeigeAufgaben();

    zeigeErledigteAufgaben();

    zeigeHeute();

    zeigeDashboardAufgaben();

    aktualisiereUebersicht();

    aktualisiereWochenstatistik();

    zeigeDashboardZiele();

    zeigeKalender();


    speichern();
}



appStarten();