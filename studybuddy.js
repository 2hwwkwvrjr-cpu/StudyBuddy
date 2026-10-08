let faecher = [];
let aufgaben = [];

let aktiverTimer = null;
let timerStart = null;
let timerInterval = null;
let timerAufgabeId = null;

let kalenderDatum = new Date();

const MAX_LERNZEIT_PRO_TAG = 4;



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



function formatiereLernzeit(stunden) {

    const minutenGesamt =
        Math.round(
            Number(stunden || 0)
            *
            60
        );


    const stundenGanz =
        Math.floor(
            minutenGesamt / 60
        );


    const minuten =
        minutenGesamt % 60;


    let text = "";


    if (
        stundenGanz === 1
    ) {

        text =
            "1 Stunde";

    } else if (
        stundenGanz > 1
    ) {

        text =
            `${stundenGanz} Stunden`;
    }


    if (
        minuten > 0
    ) {

        if (
            text !== ""
        ) {

            text += " ";
        }


        if (
            minuten === 1
        ) {

            text +=
                "1 Minute";

        } else {

            text +=
                `${minuten} Minuten`;
        }
    }


    if (
        text === ""
    ) {

        text =
            "0 Minuten";
    }


    return text;
}



function farbeFuerFach(fachName) {

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
        index
        %
        fachFarben.length
    ];
}



function darkModeLaden() {

    const gespeichert =
        localStorage.getItem(
            "studybuddy_darkmode"
        );


    if (
        gespeichert === "true"
    ) {

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


    if (
        !icon
        ||
        !text
    ) {

        return;
    }


    const aktiv =
        document.body
            .classList
            .contains(
                "dark-mode"
            );


    if (
        aktiv
    ) {

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
                    "studybuddy_tasks.json"
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
                "JSON konnte nicht geladen werden:",
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
                        fach.gelernt
                        ||
                        0
                    )

            })
        );


    wochenwechselPruefen();

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



function aktuelleWochenKennung() {

    const heute =
        new Date();


    const tag =
        heute.getDay();


    const differenz =
        tag === 0
            ?
            -6
            :
            1 - tag;


    const montag =
        new Date(
            heute
        );


    montag.setDate(
        heute.getDate()
        +
        differenz
    );


    return [
        montag.getFullYear(),

        String(
            montag.getMonth()
            +
            1
        ).padStart(
            2,
            "0"
        ),

        String(
            montag.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");
}



function wochenwechselPruefen() {

    const aktuelleWoche =
        aktuelleWochenKennung();


    const gespeicherteWoche =
        localStorage.getItem(
            "studybuddy_wochen_key"
        );


    if (
        !gespeicherteWoche
    ) {

        localStorage.setItem(
            "studybuddy_wochen_key",
            aktuelleWoche
        );

        return;
    }


    if (
        gespeicherteWoche
        !==
        aktuelleWoche
    ) {

        faecher.forEach(
            fach => {

                fach.gelernt =
                    0;

            }
        );


        localStorage.setItem(
            "studybuddy_wochen_key",
            aktuelleWoche
        );
    }
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
            nav =>

                nav
                    .classList
                    .remove(
                        "active"
                    )
        );


    if (
        button
    ) {

        button
            .classList
            .add(
                "active"
            );
    }


    if (
        seitenId ===
        "kalender"
    ) {

        zeigeKalender();
    }


    if (
        seitenId ===
        "heute"
    ) {

        zeigeHeute();
    }


    if (
        seitenId ===
        "faecher"
    ) {

        aktualisiereFaecher();
    }
}



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
            +
            "T00:00:00"
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



function deutschesDatum(
    datum
) {

    if (
        !datum
    ) {

        return "";
    }


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



function restaufwandVon(
    aufgabe
) {

    return Math.max(

        0,

        Number(
            aufgabe.zeitaufwand
            ||
            0
        )

        -

        Number(
            aufgabe.investierteZeit
            ||
            0
        )

    );
}



function pruefeAutomatischErledigteAufgaben() {

    aufgaben.forEach(
        aufgabe => {


            const aufwand =
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


    const restaufwand =
        restaufwandVon(
            aufgabe
        );


    let stundenProTag;


    if (
        tage > 0
    ) {

        stundenProTag =
            restaufwand
            /
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
// WOCHENZIELALGORITHMUS
// ======================================================

function wochenAnteilAufgabe(
    aufgabe
) {

    if (
        aufgabe.status ===
        "erledigt"
    ) {

        return 0;
    }


    const rest =
        restaufwandVon(
            aufgabe
        );


    if (
        rest <= 0
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

        return rest;
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


    const proTag =
        rest
        /
        tageGesamt;


    return (
        proTag
        *
        tageDieseWoche
    );
}



function wochenzielFuerFach(
    fachName
) {

    return aufgaben

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
// SORTIERALGORITHMUS
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
                bInfo.rang
                !==
                aInfo.rang
            ) {

                return (
                    bInfo.rang
                    -
                    aInfo.rang
                );
            }


            if (
                bInfo.stundenProTag
                !==
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
// TAGESLERNPLAN-ALGORITHMUS
// ======================================================

function prioritaetsFaktor(
    prioritaet
) {

    if (
        prioritaet ===
        "hoch"
    ) {

        return 1.5;
    }


    if (
        prioritaet ===
        "niedrig"
    ) {

        return 0.7;
    }


    return 1;
}



function taeglicherBedarf(
    aufgabe
) {

    const rest =
        restaufwandVon(
            aufgabe
        );


    if (
        rest <= 0
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

        return rest;
    }


    return (
        rest
        /
        (tage + 1)
    );
}



function planungswertBerechnen(
    aufgabe
) {

    const info =
        berechneDringlichkeit(
            aufgabe
        );


    return (

        taeglicherBedarf(
            aufgabe
        )

        *

        info.rang

        *

        prioritaetsFaktor(
            aufgabe.prioritaet
        )

    );
}



function erstelleTageslernplan() {

    const offen =
        aufgaben.filter(
            aufgabe =>

                aufgabe.status !==
                    "erledigt"

                &&

                restaufwandVon(
                    aufgabe
                ) > 0
        );


    if (
        offen.length === 0
    ) {

        return [];
    }


    const gesamtbedarf =
        offen.reduce(
            (
                summe,
                aufgabe
            ) =>

                summe
                +
                taeglicherBedarf(
                    aufgabe
                ),

            0
        );


    const verfuegbar =
        Math.min(
            MAX_LERNZEIT_PRO_TAG,
            gesamtbedarf
        );


    const daten =
        offen.map(
            aufgabe => ({

                aufgabe:
                    aufgabe,

                wert:
                    planungswertBerechnen(
                        aufgabe
                    )

            })
        );


    const gesamtwert =
        daten.reduce(
            (
                summe,
                eintrag
            ) =>

                summe
                +
                eintrag.wert,

            0
        );


    if (
        gesamtwert <= 0
    ) {

        return [];
    }


    return daten

        .map(
            eintrag => {


                let stunden =
                    verfuegbar
                    *
                    (
                        eintrag.wert
                        /
                        gesamtwert
                    );


                stunden =
                    Math.min(
                        stunden,
                        restaufwandVon(
                            eintrag.aufgabe
                        )
                    );


                return {

                    aufgabe:
                        eintrag.aufgabe,

                    stunden:
                        stunden

                };

            }
        )

        .filter(
            eintrag =>
                eintrag.stunden > 0
        )

        .sort(
            (
                a,
                b
            ) =>
                b.stunden
                -
                a.stunden
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


    if (
        !aufgabe
    ) {

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
    }


    aufgabe[feld] =
        wert;


    pruefeAutomatischErledigteAufgaben();

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


    const deadline =
        document
            .getElementById(
                "deadline"
            )
            .value;


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


    const aufwand =
        Number(
            document
                .getElementById(
                    "zeitaufwand"
                )
                .value
        );


    const investiert =
        Number(
            document
                .getElementById(
                    "investierteZeit"
                )
                .value
        );


    let status =
        document
            .getElementById(
                "status"
            )
            .value;


    if (
        aufwand > 0
        &&
        investiert >= aufwand
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
            document
                .getElementById(
                    "typ"
                )
                .value,

        deadline:
            deadline,

        prioritaet:
            document
                .getElementById(
                    "prioritaet"
                )
                .value,

        status:
            status,

        zeitaufwand:
            aufwand || 0,

        investierteZeit:
            investiert || 0,

        notiz:
            document
                .getElementById(
                    "notiz"
                )
                .value
                .trim()

    });


    document.getElementById(
        "aufgabeName"
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


        if (
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
                aufgabe.id !== id
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
        "<",
        "&lt;"
    )

    .replaceAll(
        ">",
        "&gt;"
    )

    .replaceAll(
        "\"",
        "&quot;"
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


    const rest =
        restaufwandVon(
            aufgabe
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
                    📅 Deadline
                </label>

                <input
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

                <label>
                    ⏱ Aufwand
                </label>

                <input
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

                Noch benötigt:

                <strong>

                    ${formatiereLernzeit(
                        rest
                    )}

                </strong>

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


            <div class="aktionen">

                <button
                    class="btn-erledigt"

                    onclick="
                        erledigtUmschalten(
                            ${aufgabe.id}
                        )
                    "
                >
                    ✓ Erledigt
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

                ${formatiereLernzeit(
                    rest
                )}

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



function zeigeAufgaben() {

    const container =
        document.getElementById(
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


    let liste =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status !==
                "erledigt"
        );


    if (
        suche !== ""
    ) {

        liste =
            liste.filter(
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

        liste =
            liste.filter(
                aufgabe =>
                    aufgabe.fach ===
                    fach
            );
    }


    if (
        status !==
        "alle"
    ) {

        liste =
            liste.filter(
                aufgabe =>
                    aufgabe.status ===
                    status
            );
    }


    if (
        typ !==
        "alle"
    ) {

        liste =
            liste.filter(
                aufgabe =>
                    aufgabe.typ ===
                    typ
            );
    }


    sortiereAufgaben(
        liste
    );


    container.innerHTML =
        "";


    if (
        liste.length === 0
    ) {

        container.innerHTML = `

            <div class="leer">
                Keine offenen Aufgaben gefunden.
            </div>

        `;

        return;
    }


    liste.forEach(
        aufgabe =>

            container.appendChild(

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


    const erledigt =
        aufgaben.filter(
            aufgabe =>
                aufgabe.status ===
                "erledigt"
        );


    container.innerHTML =
        "";


    if (
        erledigt.length === 0
    ) {

        container.innerHTML = `

            <div class="leer">
                Noch keine erledigten Aufgaben.
            </div>

        `;

        return;
    }


    erledigt.forEach(
        aufgabe => {


            const karte =
                erstelleAufgabenKarte(
                    aufgabe,
                    false
                );


            karte.innerHTML += `

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

                </div>

            `;


            container.appendChild(
                karte
            );

        }
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


    const gesamtAnzeige =
        document.getElementById(
            "heuteGesamtStunden"
        );


    const plan =
        erstelleTageslernplan();


    container.innerHTML =
        "";


    if (
        plan.length === 0
    ) {

        text.textContent =
            "Für heute ist aktuell keine Lernzeit notwendig.";


        gesamtAnzeige.textContent =
            "0 Minuten";


        return;
    }


    const gesamt =
        plan.reduce(
            (
                summe,
                eintrag
            ) =>

                summe
                +
                eintrag.stunden,

            0
        );


    text.textContent =
        `StudyBuddy empfiehlt dir heute ungefähr ${formatiereLernzeit(gesamt)} Lernzeit.`;


    gesamtAnzeige.textContent =
        formatiereLernzeit(
            gesamt
        );


    plan.forEach(
        eintrag => {


            const karte =
                erstelleAufgabenKarte(
                    eintrag.aufgabe,
                    false
                );


            const empfehlung =
                document.createElement(
                    "div"
                );


            empfehlung.className =
                "tages-empfehlung";


            empfehlung.textContent =
                `⏱ Heute empfohlen: ${formatiereLernzeit(eintrag.stunden)}`;


            karte.insertBefore(
                empfehlung,
                karte.firstChild
            );


            container.appendChild(
                karte
            );

        }
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


    container.innerHTML =
        "";


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
                    fach.gelernt
                    ||
                    0
                ),

            0
        );


    const ziel =
        gesamtesWochenziel();


    let prozent =
        0;


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
        formatiereLernzeit(
            gelernt
        );


    document.getElementById(
        "wochenZiel"
    ).textContent =
        formatiereLernzeit(
            ziel
        );


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
    ).value =
        "";


    speichern();

    allesAktualisieren();
}



function lernzeitAendern(
    index,
    stunden
) {

    faecher[index].gelernt =
        Math.max(

            0,

            Number(
                faecher[index].gelernt
                ||
                0
            )

            +

            stunden

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


    const select =
        document.getElementById(
            `timer-aufgabe-${index}`
        );


    timerAufgabeId =
        select
        &&
        select.value !== ""
            ?
            Number(
                select.value
            )
            :
            null;


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


    faecher[index].gelernt +=
        stunden;


    if (
        timerAufgabeId !==
        null
    ) {

        const aufgabe =
            aufgaben.find(
                aufgabe =>
                    aufgabe.id ===
                    timerAufgabeId
            );


        if (
            aufgabe
        ) {

            aufgabe.investierteZeit =
                Number(
                    aufgabe.investierteZeit
                    ||
                    0
                )

                +

                stunden;
        }
    }


    clearInterval(
        timerInterval
    );


    aktiverTimer =
        null;


    timerStart =
        null;


    timerInterval =
        null;


    timerAufgabeId =
        null;


    pruefeAutomatischErledigteAufgaben();

    speichern();

    allesAktualisieren();
}



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


    const rest =
        sekunden
        %
        60;


    return (

        String(
            stunden
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            minuten
        ).padStart(
            2,
            "0"
        )

        +

        ":"

        +

        String(
            rest
        ).padStart(
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


            const filter =
                option.cloneNode(
                    true
                );


            fachFilter.appendChild(
                filter
            );


            const ziel =
                wochenzielFuerFach(
                    fach.name
                );


            const gelernt =
                Number(
                    fach.gelernt
                    ||
                    0
                );


            const prozent =
                ziel > 0
                    ?
                    Math.round(
                        gelernt
                        /
                        ziel
                        *
                        100
                    )
                    :
                    0;


            const farbe =
                farbeFuerFach(
                    fach.name
                );


            const fachAufgaben =
                aufgaben.filter(
                    aufgabe =>

                        aufgabe.fach ===
                            fach.name

                        &&

                        aufgabe.status !==
                            "erledigt"
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

                    ${formatiereLernzeit(
                        ziel
                    )}

                </div>


                <div class="progress-info">

                    <span>

                        ${formatiereLernzeit(
                            gelernt
                        )}
                        gelernt

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


                <div class="lernzeit-box">


                    <div class="lernzeit-kopf">


                        <div class="titel-mit-info">

                            <strong>
                                ⏱ Lernzeit erfassen
                            </strong>


                            <div class="info-wrap">

                                <span class="info-icon">
                                    i
                                </span>


                                <div class="info-tooltip">

                                    Die Zeit wird zu deinen
                                    Wochenstunden hinzugefügt.

                                    Wenn du eine Aufgabe auswählst,
                                    wird die Timerzeit zusätzlich
                                    zur investierten Zeit dieser
                                    Aufgabe gerechnet.

                                </div>

                            </div>

                        </div>


                        <div class="lernzeit-wert">

                            ${formatiereLernzeit(
                                gelernt
                            )}

                        </div>


                    </div>


                    <div class="lernzeit-hinweis">

                        Wochenziel:

                        ${formatiereLernzeit(
                            ziel
                        )}

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

                    </div>


                    <div class="timer-aufgabe">

                        <label>
                            Aufgabe für Timer
                            (optional)
                        </label>


                        <select
                            id="timer-aufgabe-${index}"
                        >

                            <option value="">

                                Nur Lernzeit fürs Fach

                            </option>


                            ${fachAufgaben.map(
                                aufgabe => `

                                    <option
                                        value="${aufgabe.id}"
                                    >

                                        ${sichererText(
                                            aufgabe.aufgabe
                                        )}

                                    </option>

                                `
                            ).join("")}

                        </select>

                    </div>


                    <div class="timer-modern">

                        <div>

                            <div
                                id="timer-${index}"
                                class="timer-uhr"
                            >
                                00:00:00
                            </div>


                            <div class="timer-status">

                                ${
                                    timerLaeuft
                                        ?
                                        "Timer läuft …"
                                        :
                                        "Bereit zum Lernen"
                                }

                            </div>

                        </div>


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
                                ▶ Start
                            </button>

                            `
                        }

                    </div>


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


    container.innerHTML =
        "";


    faecher.forEach(
        fach => {


            const ziel =
                wochenzielFuerFach(
                    fach.name
                );


            const gelernt =
                Number(
                    fach.gelernt
                    ||
                    0
                );


            const prozent =
                ziel > 0
                    ?
                    Math.round(
                        gelernt
                        /
                        ziel
                        *
                        100
                    )
                    :
                    0;


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

                    ${formatiereLernzeit(
                        gelernt
                    )}
                    gelernt

                </p>


                <p>

                    🎯 Empfehlung:

                    ${formatiereLernzeit(
                        ziel
                    )}

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
// KALENDER
// ======================================================

function zeigeKalender() {

    const grid =
        document.getElementById(
            "kalenderGrid"
        );


    const titel =
        document.getElementById(
            "kalenderTitel"
        );


    const jahr =
        kalenderDatum.getFullYear();


    const monat =
        kalenderDatum.getMonth();


    titel.textContent =
        new Date(
            jahr,
            monat,
            1
        ).toLocaleDateString(
            "de-DE",
            {
                month:
                    "long",

                year:
                    "numeric"
            }
        );


    grid.innerHTML =
        "";


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


    let start =
        ersterTag.getDay();


    if (
        start === 0
    ) {

        start =
            7;
    }


    start--;


    for (
        let i = 0;
        i < start;
        i++
    ) {

        const leer =
            document.createElement(
                "div"
            );


        leer.className =
            "kalender-tag";


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
                jahr,

                String(
                    monat + 1
                ).padStart(
                    2,
                    "0"
                ),

                String(
                    tag
                ).padStart(
                    2,
                    "0"
                )

            ].join("-");


        const box =
            document.createElement(
                "div"
            );


        box.className =
            "kalender-tag";


        if (
            datum.toDateString()
            ===
            heute.toDateString()
        ) {

            box.classList.add(
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


        box.appendChild(
            nummer
        );


        const tasks =
            aufgaben.filter(
                aufgabe =>
                    aufgabe.deadline ===
                    datumString
            );


        tasks.forEach(
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


                event.textContent =
                    aufgabe.aufgabe;


                event.onclick =
                    () =>
                        aufgabenModalOeffnen(
                            aufgabe.id
                        );


                box.appendChild(
                    event
                );

            }
        );


        grid.appendChild(
            box
        );
    }
}



function kalenderMonatAendern(
    richtung
) {

    kalenderDatum =
        new Date(

            kalenderDatum.getFullYear(),

            kalenderDatum.getMonth()
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



// ======================================================
// KALENDER-POPUP
// ======================================================

function aufgabenModalOeffnen(
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


    const modal =
        document.getElementById(
            "aufgabenModal"
        );


    const modalKarte =
        document.getElementById(
            "modalKarte"
        );


    const inhalt =
        document.getElementById(
            "modalInhalt"
        );


    const farbe =
        farbeFuerFach(
            aufgabe.fach
        );


    const info =
        berechneDringlichkeit(
            aufgabe
        );


    const rest =
        restaufwandVon(
            aufgabe
        );


    modalKarte.style.borderTop =
        `7px solid ${farbe.rand}`;


    inhalt.innerHTML = `

        <h2 class="modal-titel">

            ${sichererText(
                aufgabe.aufgabe
            )}

        </h2>


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


        <div class="modal-zeile">

            📅 <strong>Deadline:</strong>

            ${deutschesDatum(
                aufgabe.deadline
            )}

        </div>


        <div class="modal-zeile">

            🚦 <strong>Priorität:</strong>

            ${sichererText(
                aufgabe.prioritaet
            )}

        </div>


        <div class="modal-zeile">

            ⏱ <strong>Gesamtaufwand:</strong>

            ${formatiereLernzeit(
                aufgabe.zeitaufwand
            )}

        </div>


        <div class="modal-zeile">

            ✅ <strong>Bereits investiert:</strong>

            ${formatiereLernzeit(
                aufgabe.investierteZeit
            )}

        </div>


        <div class="modal-zeile">

            ⌛ <strong>Noch benötigt:</strong>

            ${formatiereLernzeit(
                rest
            )}

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


        ${
            aufgabe.notiz
            ?
            `

            <div class="modal-notiz">

                <strong>📝 Notiz</strong>

                <br><br>

                ${sichererText(
                    aufgabe.notiz
                )}

            </div>

            `
            :
            ""
        }

    `;


    modal.classList.add(
        "offen"
    );
}



function aufgabenModalSchliessen() {

    document
        .getElementById(
            "aufgabenModal"
        )
        .classList
        .remove(
            "offen"
        );
}



function modalHintergrundKlick(
    event
) {

    if (
        event.target.id ===
        "aufgabenModal"
    ) {

        aufgabenModalSchliessen();
    }
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