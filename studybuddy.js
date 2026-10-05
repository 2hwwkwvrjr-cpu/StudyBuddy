// ======================================================
// STUDYBUDDY
// ======================================================

let faecher = [];
let aufgaben = [];

let aktiverTimer = null;
let timerStart = null;
let timerInterval = null;


// ======================================================
// FACHFARBEN
// ======================================================

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


function farbeFuerFach(
    fachName
) {

    const index =
        faecher.findIndex(
            fach =>
                fach.name === fachName
        );


    if (
        index === -1
    ) {

        return fachFarben[0];
    }


    return fachFarben[
        index % fachFarben.length
    ];
}



// ======================================================
// APP START
// ======================================================

async function appStarten() {

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

                        ziel:
                            Number(
                                fach.wochenzielStunden
                                ??
                                fach.ziel
                                ??
                                5
                            ),

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

        } catch (
            fehler
        ) {

            console.error(
                "JSON konnte nicht geladen werden:",
                fehler
            );


            faecher = [];
            aufgaben = [];
        }
    }


    speichern();

    allesAktualisieren();
}



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
        seitenId === "dashboard"
    ) {

        aktualisiereUebersicht();

        aktualisiereWochenstatistik();

        zeigeDashboardAufgaben();

        zeigeDashboardZiele();

    }


    if (
        seitenId === "heute"
    ) {

        zeigeHeute();

    }


    if (
        seitenId === "aufgaben"
    ) {

        zeigeAufgaben();

    }


    if (
        seitenId === "erledigt"
    ) {

        zeigeErledigteAufgaben();

    }


    if (
        seitenId === "faecher"
    ) {

        aktualisiereFaecher();

    }
}



// ======================================================
// DATUM
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
            datum - heute
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

    return new Date(
        datum
    )
    .toLocaleDateString(
        "de-DE"
    );
}



// ======================================================
// DRINGLICHKEITSALGORITHMUS
// ======================================================

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


    const zeitaufwand =
        Number(
            aufgabe.zeitaufwand || 0
        );


    const investiert =
        Number(
            aufgabe.investierteZeit || 0
        );


    const restzeit =
        Math.max(

            0,

            zeitaufwand
            -
            investiert

        );


    let stundenProTag;


    if (
        tage > 0
    ) {

        stundenProTag =
            restzeit / tage;

    } else {

        stundenProTag =
            restzeit > 0
                ? Infinity
                : 0;
    }



    if (
        tage <= 0
        ||
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
            aufgabe.prioritaet === "hoch"
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
        aufgabe.prioritaet === "hoch"
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
// SORTIERUNG
// ======================================================

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
                    bInfo.rang
                    -
                    aInfo.rang
                );
            }


            if (
                bInfo.stundenProTag !==
                aInfo.stundenProTag
            ) {

                return (
                    bInfo.stundenProTag
                    -
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



// ======================================================
// AUFGABE DIREKT ÄNDERN
// ======================================================

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


    if (
        !aufgabe
    ) {

        return;
    }


    if (
        feld === "zeitaufwand"
        ||
        feld === "investierteZeit"
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


    speichern();

    allesAktualisieren();
}



// ======================================================
// ERLEDIGT / WIEDER ÖFFNEN
// ======================================================

function erledigtUmschalten(
    id
) {

    const aufgabe =
        aufgaben.find(
            aufgabe =>
                aufgabe.id === id
        );


    if (
        !aufgabe
    ) {

        return;
    }


    if (
        aufgabe.status ===
        "erledigt"
    ) {

        aufgabe.status =
            "offen";

    } else {

        aufgabe.status =
            "erledigt";
    }


    speichern();

    allesAktualisieren();
}



// ======================================================
// AUFGABE HINZUFÜGEN
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
// AUFGABE LÖSCHEN
// ======================================================

function aufgabeLoeschen(
    id
) {

    if (
        !confirm(
            "Möchtest du diese Aufgabe wirklich löschen?"
        )
    ) {

        return;
    }


    aufgaben =
        aufgaben.filter(
            aufgabe =>
                aufgabe.id !== id
        );


    speichern();

    allesAktualisieren();
}



// ======================================================
// SICHERER TEXT
// ======================================================

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



// ======================================================
// NORMALE AUFGABENKARTE
// ======================================================

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

                <label>
                    📚 Fach
                </label>

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
                                    fach.name ===
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

                <label>
                    📝 Typ
                </label>

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

                <label>
                    📅 Deadline
                </label>

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

                <label>
                    🚦 Priorität
                </label>

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
                        ${aufgabe.prioritaet === "hoch" ? "selected" : ""}
                    >
                        Hoch
                    </option>

                    <option
                        value="mittel"
                        ${aufgabe.prioritaet === "mittel" ? "selected" : ""}
                    >
                        Mittel
                    </option>

                    <option
                        value="niedrig"
                        ${aufgabe.prioritaet === "niedrig" ? "selected" : ""}
                    >
                        Niedrig
                    </option>

                </select>

            </div>


            <div class="edit-row">

                <label>
                    📌 Status
                </label>

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
                        ${aufgabe.status === "offen" ? "selected" : ""}
                    >
                        Offen
                    </option>

                    <option
                        value="in Bearbeitung"
                        ${aufgabe.status === "in Bearbeitung" ? "selected" : ""}
                    >
                        In Bearbeitung
                    </option>

                    <option
                        value="erledigt"
                        ${aufgabe.status === "erledigt" ? "selected" : ""}
                    >
                        Erledigt
                    </option>

                </select>

            </div>


            <div class="edit-row">

                <label>
                    ⏱ Aufwand
                </label>

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

                <label>
                    ✅ Investiert
                </label>

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

            <h3
                style="
                    margin-bottom:
                    12px;
                "
            >

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

                Stunden Arbeitsaufwand

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



// ======================================================
// ERLEDIGTE AUFGABENKARTE
// ======================================================

function erstelleErledigtKarte(
    aufgabe
) {

    const farbe =
        farbeFuerFach(
            aufgabe.fach
        );


    const karte =
        document.createElement(
            "div"
        );


    karte.className =
        "aufgaben-karte erledigt-karte";


    karte.style.borderLeft =
        `6px solid ${farbe.rand}`;


    karte.innerHTML = `

        <div class="erledigt-banner">

            ✅ Erledigt

        </div>


        <h3
            style="
                margin-bottom:
                12px;
            "
        >

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

            📅 Ursprüngliche Deadline:

            <strong>

                ${deutschesDatum(
                    aufgabe.deadline
                )}

            </strong>

        </div>


        ${
            aufgabe.notiz

            ?

            `
            <div class="restzeit">

                📝

                ${sichererText(
                    aufgabe.notiz
                )}

            </div>
            `

            :

            ""
        }


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



// ======================================================
// NORMALE AUFGABEN ANZEIGEN
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


    /*
        WICHTIG:
        Erledigte Aufgaben kommen NICHT
        mehr in die normale Aufgabenliste.
    */

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


    liste.innerHTML =
        "";


    if (
        gefiltert.length ===
        0
    ) {

        liste.innerHTML = `

            <div class="leer">

                Keine offenen Aufgaben gefunden. 🎉

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
// ERLEDIGTE AUFGABEN ANZEIGEN
// ======================================================

function zeigeErledigteAufgaben() {

    const container =
        document
            .getElementById(
                "erledigteAufgaben"
            );


    const erledigte =
        aufgaben
        .filter(
            aufgabe =>
                aufgabe.status ===
                "erledigt"
        )
        .sort(
            (
                a,
                b
            ) =>

                new Date(
                    b.deadline
                )

                -

                new Date(
                    a.deadline
                )
        );


    container.innerHTML =
        "";


    if (
        erledigte.length ===
        0
    ) {

        container.innerHTML = `

            <div class="leer">

                Hier landen deine erledigten Aufgaben. ✅

            </div>

        `;


        return;
    }


    erledigte.forEach(
        aufgabe => {

            container.appendChild(

                erstelleErledigtKarte(
                    aufgabe
                )

            );

        }
    );
}



// ======================================================
// HEUTE
// ======================================================

function zeigeHeute() {

    const container =
        document
            .getElementById(
                "heuteAufgaben"
            );


    const text =
        document
            .getElementById(
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


                const tage =
                    tageBisDeadline(
                        aufgabe.deadline
                    );


                return (
                    tage <= 2
                );

            }
        );


    sortiereAufgaben(
        relevante
    );


    container.innerHTML =
        "";


    if (
        relevante.length ===
        0
    ) {

        text.textContent =
            "🎉 Für heute und die nächsten zwei Tage steht nichts Dringendes an.";


        container.innerHTML = `

            <div class="leer">

                Du kannst dich entspannt auf deine Lernziele konzentrieren. 😌

            </div>

        `;


        return;
    }


    text.textContent =
        `Du hast ${relevante.length} Aufgabe(n), die jetzt oder sehr bald relevant sind.`;


    relevante.forEach(
        aufgabe => {

            container.appendChild(

                erstelleAufgabenKarte(
                    aufgabe,
                    false
                )

            );

        }
    );
}



// ======================================================
// DASHBOARD AUFGABEN
// ======================================================

function zeigeDashboardAufgaben() {

    const container =
        document
            .getElementById(
                "dashboardAufgaben"
            );


    container.innerHTML =
        "";


    const wichtigste =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status !==
                "erledigt"
        );


    sortiereAufgaben(
        wichtigste
    );


    if (
        wichtigste.length ===
        0
    ) {

        container.innerHTML = `

            <div class="leer">

                Alle Aufgaben erledigt. Stark! 🎉

            </div>

        `;


        return;
    }


    wichtigste
        .slice(
            0,
            3
        )
        .forEach(
            aufgabe => {

                container.appendChild(

                    erstelleAufgabenKarte(
                        aufgabe,
                        false
                    )

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
                aufgabe.status !==
                "erledigt"
        ).length;


    document
        .getElementById(
            "dringend"
        )
        .textContent =

        aufgaben.filter(
            aufgabe => {

                const info =
                    berechneDringlichkeit(
                        aufgabe
                    );


                return (
                    info.rang >= 3
                    &&
                    aufgabe.status !==
                    "erledigt"
                );

            }
        ).length;
}



// ======================================================
// WOCHENSTATISTIK
// ======================================================

function aktualisiereWochenstatistik() {

    const gesamtGelernt =
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


    const gesamtZiel =
        faecher.reduce(
            (
                summe,
                fach
            ) =>

                summe
                +
                Number(
                    fach.ziel || 0
                ),

            0
        );


    let prozent =
        0;


    if (
        gesamtZiel > 0
    ) {

        prozent =
            Math.round(

                (
                    gesamtGelernt
                    /
                    gesamtZiel
                )

                *

                100

            );
    }


    const angezeigtesProzent =
        Math.min(
            100,
            prozent
        );


    document
        .getElementById(
            "wochenStunden"
        )
        .textContent =

        `${gesamtGelernt.toFixed(1)} h`;


    document
        .getElementById(
            "wochenProzent"
        )
        .textContent =

        `${prozent} %`;


    const progress =
        document
            .getElementById(
                "wochenProgress"
            );


    progress.style.width =
        `${angezeigtesProzent}%`;


    progress.style.background =
        "linear-gradient(90deg, #94dfbd, #ad9ade)";
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

    allesAktualisieren();
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
                aufgabe.fach ===
                fach.name
        );


    if (
        verwendet
    ) {

        alert(
            "Dieses Fach wird noch bei mindestens einer Aufgabe verwendet."
        );


        return;
    }


    if (
        !confirm(
            `Möchtest du "${fach.name}" wirklich löschen?`
        )
    ) {

        return;
    }


    faecher.splice(
        index,
        1
    );


    speichern();

    allesAktualisieren();
}



// ======================================================
// ZIEL ÄNDERN
// ======================================================

function zielAendern(
    index
) {

    const neuesZiel =
        Number(
            prompt(

                `Neues Wochenziel für ${faecher[index].name}:`,

                faecher[index].ziel

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


    faecher[index].ziel =
        neuesZiel;


    speichern();

    allesAktualisieren();
}



// ======================================================
// LERNZEIT
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

    allesAktualisieren();
}


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

    allesAktualisieren();
}



// ======================================================
// TIMER
// ======================================================

function timerStarten(
    index
) {

    if (
        aktiverTimer !==
        null
    ) {

        alert(
            "Es läuft bereits ein Lerntimer."
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

    allesAktualisieren();
}


function sekundenFormat(
    sekunden
) {

    const stunden =
        Math.floor(
            sekunden / 3600
        );


    const minuten =
        Math.floor(

            (
                sekunden % 3600
            )

            /

            60

        );


    const rest =
        sekunden % 60;


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


            const filterOption =
                document.createElement(
                    "option"
                );


            filterOption.value =
                fach.name;


            filterOption.textContent =
                fach.name;


            fachFilter.appendChild(
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


            const farbe =
                farbeFuerFach(
                    fach.name
                );


            const karte =
                document.createElement(
                    "div"
                );


            karte.className =
                "fach-card";


            karte.style.borderTop =
                `5px solid ${farbe.rand}`;


            const timerLaeuft =
                aktiverTimer ===
                index;


            karte.innerHTML = `

                <h3>

                    ${sichererText(
                        fach.name
                    )}

                </h3>


                <div class="lern-info">

                    Wochenziel:

                    <strong>

                        ${fach.ziel}
                        Stunden

                    </strong>

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
                            ${prozent}%;

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


            const farbe =
                farbeFuerFach(
                    fach.name
                );


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

                    von

                    ${fach.ziel}

                    Stunden

                </p>


                <div class="progress">

                    <div
                        class="progress-inner"

                        style="
                            width:
                            ${prozent}%;

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
// ALLES AKTUALISIEREN
// ======================================================

function allesAktualisieren() {

    aktualisiereFaecher();

    zeigeAufgaben();

    zeigeErledigteAufgaben();

    aktualisiereUebersicht();

    aktualisiereWochenstatistik();

    zeigeDashboardAufgaben();

    zeigeDashboardZiele();

    zeigeHeute();
}



// ======================================================
// DATEN ZURÜCKSETZEN
// ======================================================

function demoDatenZuruecksetzen() {

    if (
        !confirm(
            "Alle Änderungen werden gelöscht und die Daten aus der JSON-Datei wieder geladen. Fortfahren?"
        )
    ) {

        return;
    }


    localStorage.removeItem(
        "studybuddy_faecher"
    );


    localStorage.removeItem(
        "studybuddy_aufgaben"
    );


    location.reload();
}



// ======================================================
// START
// ======================================================

appStarten();