// ----------------------------------------------------
// STARTDATEN / LOCAL STORAGE
// ----------------------------------------------------

const standardFaecher = [
    {
        name: "Wirtschaftsinformatik",
        ziel: 6,
        gelernt: 2.5
    },
    {
        name: "Mathematik",
        ziel: 5,
        gelernt: 3
    },
    {
        name: "BWL",
        ziel: 4,
        gelernt: 1.5
    },
    {
        name: "Rechnungswesen",
        ziel: 5,
        gelernt: 2
    },
    {
        name: "Englisch",
        ziel: 3,
        gelernt: 1
    }
];


const standardAufgaben = [
    {
        id: 1,
        aufgabe: "JavaScript Übung fertigstellen",
        fach: "Wirtschaftsinformatik",
        deadline: "2026-10-07",
        prioritaet: "hoch",
        status: "in Bearbeitung"
    },
    {
        id: 2,
        aufgabe: "Mathematik Kapitel wiederholen",
        fach: "Mathematik",
        deadline: "2026-10-08",
        prioritaet: "hoch",
        status: "offen"
    },
    {
        id: 3,
        aufgabe: "BWL Zusammenfassung lernen",
        fach: "BWL",
        deadline: "2026-10-13",
        prioritaet: "mittel",
        status: "offen"
    },
    {
        id: 4,
        aufgabe: "Bilanz Übungsblatt lösen",
        fach: "Rechnungswesen",
        deadline: "2026-10-10",
        prioritaet: "mittel",
        status: "offen"
    },
    {
        id: 5,
        aufgabe: "Englisch Vokabeln wiederholen",
        fach: "Englisch",
        deadline: "2026-10-17",
        prioritaet: "niedrig",
        status: "offen"
    }
];


let gespeicherteFaecher =
    JSON.parse(
        localStorage.getItem("faecher")
    );


let faecher;


// Alte Version mit einfachen Fachnamen automatisch umwandeln
if (
    Array.isArray(gespeicherteFaecher)
    &&
    gespeicherteFaecher.length > 0
    &&
    typeof gespeicherteFaecher[0] === "string"
) {

    faecher =
        gespeicherteFaecher.map(
            fach => ({
                name: fach,
                ziel: 5,
                gelernt: 0
            })
        );

} else if (
    Array.isArray(gespeicherteFaecher)
    &&
    gespeicherteFaecher.length > 0
) {

    faecher =
        gespeicherteFaecher;

} else {

    faecher =
        standardFaecher;
}


let aufgaben =
    JSON.parse(
        localStorage.getItem("aufgaben")
    )
    ||
    standardAufgaben;


let bearbeitungsId = null;


// Timer
let aktiverTimer = null;
let timerStart = null;
let timerInterval = null;


// ----------------------------------------------------
// SPEICHERN
// ----------------------------------------------------

function speichern() {

    localStorage.setItem(
        "faecher",
        JSON.stringify(faecher)
    );

    localStorage.setItem(
        "aufgaben",
        JSON.stringify(aufgaben)
    );
}


// ----------------------------------------------------
// NAVIGATION
// ----------------------------------------------------

function zeigeSeite(seitenId, button) {

    document
        .querySelectorAll(".seite")
        .forEach(
            seite =>
                seite.classList.remove("active")
        );


    document
        .getElementById(seitenId)
        .classList.add("active");


    document
        .querySelectorAll(".nav-button")
        .forEach(
            btn =>
                btn.classList.remove("active")
        );


    button.classList.add("active");


    if (seitenId === "dashboard") {

        aktualisiereUebersicht();
        zeigeDashboardAufgaben();
        zeigeDashboardZiele();

    }


    if (seitenId === "faecher") {

        aktualisiereFaecher();

    }
}


// ----------------------------------------------------
// FÄCHER
// ----------------------------------------------------

function fachHinzufuegen() {

    const name =
        document
            .getElementById("neuesFach")
            .value
            .trim();


    const ziel =
        Number(
            document
                .getElementById("neuesZiel")
                .value
        );


    if (
        name === ""
        ||
        !ziel
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
                fach.name.toLowerCase()
                ===
                name.toLowerCase()
        );


    if (existiert) {

        alert(
            "Dieses Fach gibt es bereits."
        );

        return;
    }


    faecher.push({
        name: name,
        ziel: ziel,
        gelernt: 0
    });


    document
        .getElementById("neuesFach")
        .value = "";


    document
        .getElementById("neuesZiel")
        .value = "";


    speichern();
    aktualisiereFaecher();
    zeigeDashboardZiele();
}


function fachLoeschen(index) {

    const fach =
        faecher[index];


    const verwendet =
        aufgaben.some(
            aufgabe =>
                aufgabe.fach === fach.name
        );


    if (verwendet) {

        alert(
            "Dieses Fach wird noch bei einer Aufgabe verwendet."
        );

        return;
    }


    const ok =
        confirm(
            `Möchtest du ${fach.name} wirklich löschen?`
        );


    if (!ok) {
        return;
    }


    faecher.splice(index, 1);

    speichern();
    aktualisiereFaecher();
    zeigeDashboardZiele();
}


function zielAendern(index) {

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
        !neuesZiel
        ||
        neuesZiel <= 0
    ) {

        return;
    }


    fach.ziel =
        neuesZiel;


    speichern();
    aktualisiereFaecher();
    zeigeDashboardZiele();
}


// ----------------------------------------------------
// LERNZEIT
// ----------------------------------------------------

function lernzeitAendern(index, stunden) {

    faecher[index].gelernt += stunden;


    if (
        faecher[index].gelernt < 0
    ) {

        faecher[index].gelernt = 0;
    }


    faecher[index].gelernt =
        Math.round(
            faecher[index].gelernt * 100
        ) / 100;


    speichern();

    aktualisiereFaecher();
    zeigeDashboardZiele();
}


function sliderAendern(index, wert) {

    faecher[index].gelernt =
        Number(wert);


    speichern();

    aktualisiereFaecher();
    zeigeDashboardZiele();
}


// ----------------------------------------------------
// TIMER
// ----------------------------------------------------

function timerStarten(index) {

    if (
        aktiverTimer !== null
    ) {

        alert(
            "Es läuft bereits ein Lerntimer. Stoppe ihn zuerst."
        );

        return;
    }


    aktiverTimer = index;

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
        aktiverTimer === null
    ) {
        return;
    }


    const vergangen =
        Math.floor(
            (Date.now() - timerStart)
            / 1000
        );


    const anzeige =
        document.getElementById(
            `timer-${aktiverTimer}`
        );


    if (anzeige) {

        anzeige.textContent =
            sekundenFormat(vergangen);

    }
}


function timerStoppen(index) {

    if (
        aktiverTimer !== index
    ) {

        return;
    }


    const sekunden =
        (Date.now() - timerStart)
        / 1000;


    const stunden =
        sekunden / 3600;


    faecher[index].gelernt +=
        stunden;


    faecher[index].gelernt =
        Math.round(
            faecher[index].gelernt
            * 100
        ) / 100;


    clearInterval(
        timerInterval
    );


    aktiverTimer = null;
    timerStart = null;
    timerInterval = null;


    speichern();

    aktualisiereFaecher();
    zeigeDashboardZiele();
}


function sekundenFormat(sekunden) {

    const stunden =
        Math.floor(
            sekunden / 3600
        );


    const minuten =
        Math.floor(
            (sekunden % 3600)
            / 60
        );


    const restSekunden =
        sekunden % 60;


    return (
        String(stunden)
            .padStart(2, "0")
        +
        ":"
        +
        String(minuten)
            .padStart(2, "0")
        +
        ":"
        +
        String(restSekunden)
            .padStart(2, "0")
    );
}


// ----------------------------------------------------
// FACH-KARTEN
// ----------------------------------------------------

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
        (fach, index) => {


            // Dropdown Aufgabe

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


            // Dropdown Filter

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


            // Fortschritt

            const prozent =
                Math.min(
                    100,
                    Math.round(
                        (
                            fach.gelernt
                            /
                            fach.ziel
                        )
                        * 100
                    )
                );


            const sliderMax =
                Math.max(
                    fach.ziel,
                    fach.gelernt,
                    1
                );


            const karte =
                document.createElement(
                    "div"
                );


            karte.className =
                "fach-card";


            const timerLaeuft =
                aktiverTimer === index;


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
                        ${fach.gelernt.toFixed(2)} h gelernt
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
                        ${
                            timerLaeuft
                            ?
                            "00:00:00"
                            :
                            "00:00:00"
                        }
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
        aktiverTimer !== null
    ) {

        timerAktualisieren();

    }
}


// ----------------------------------------------------
// AUFGABE SPEICHERN
// ----------------------------------------------------

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
        bearbeitungsId !== null
    ) {

        const aufgabe =
            aufgaben.find(
                a =>
                    a.id
                    ===
                    bearbeitungsId
            );


        aufgabe.aufgabe =
            name;

        aufgabe.fach =
            fach;

        aufgabe.deadline =
            deadline;

        aufgabe.prioritaet =
            prioritaet;

        aufgabe.status =
            status;


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

            deadline:
                deadline,

            prioritaet:
                prioritaet,

            status:
                status

        });

    }


    formularLeeren();

    speichern();

    zeigeAufgaben();

    aktualisiereUebersicht();

    zeigeDashboardAufgaben();
}


// ----------------------------------------------------
// FORMULAR LEEREN
// ----------------------------------------------------

function formularLeeren() {

    document
        .getElementById(
            "aufgabeName"
        )
        .value = "";


    document
        .getElementById(
            "aufgabeFach"
        )
        .value = "";


    document
        .getElementById(
            "deadline"
        )
        .value = "";


    document
        .getElementById(
            "prioritaet"
        )
        .value = "hoch";


    document
        .getElementById(
            "status"
        )
        .value = "offen";
}


// ----------------------------------------------------
// AUFGABE BEARBEITEN
// ----------------------------------------------------

function aufgabeBearbeiten(id) {

    const aufgabe =
        aufgaben.find(
            a =>
                a.id === id
        );


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


    bearbeitungsId =
        id;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ----------------------------------------------------
// AUFGABE LÖSCHEN
// ----------------------------------------------------

function aufgabeLoeschen(id) {

    const ok =
        confirm(
            "Möchtest du diese Aufgabe wirklich löschen?"
        );


    if (!ok) {
        return;
    }


    aufgaben =
        aufgaben.filter(
            aufgabe =>
                aufgabe.id !== id
        );


    speichern();

    zeigeAufgaben();

    aktualisiereUebersicht();

    zeigeDashboardAufgaben();
}


// ----------------------------------------------------
// DEADLINE
// ----------------------------------------------------

function tageBisDeadline(
    deadline
) {

    const heute =
        new Date();


    heute.setHours(
        0, 0, 0, 0
    );


    const datum =
        new Date(
            deadline
        );


    datum.setHours(
        0, 0, 0, 0
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


function deadlineText(tage) {

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


// ----------------------------------------------------
// DATUM
// ----------------------------------------------------

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


// ----------------------------------------------------
// PRIORITÄT
// ----------------------------------------------------

function prioritaetsWert(
    prioritaet
) {

    if (
        prioritaet === "hoch"
    ) {
        return 3;
    }


    if (
        prioritaet === "mittel"
    ) {
        return 2;
    }


    return 1;
}


// ----------------------------------------------------
// AUFGABEN ANZEIGEN
// ----------------------------------------------------

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
            );

    }


    if (
        fach !== "alle"
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
        status !== "alle"
    ) {

        gefiltert =
            gefiltert.filter(
                aufgabe =>
                    aufgabe.status
                    ===
                    status
            );

    }


    gefiltert.sort(
        (a, b) => {

            const datumA =
                new Date(
                    a.deadline
                );


            const datumB =
                new Date(
                    b.deadline
                );


            if (
                datumA.getTime()
                !==
                datumB.getTime()
            ) {

                return (
                    datumA
                    -
                    datumB
                );

            }


            return (
                prioritaetsWert(
                    b.prioritaet
                )
                -
                prioritaetsWert(
                    a.prioritaet
                )
            );

        }
    );


    liste.innerHTML = "";


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


// ----------------------------------------------------
// AUFGABENKARTE
// ----------------------------------------------------

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


    const karte =
        document.createElement(
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


        <div class="fach-badge">
            ${aufgabe.fach}
        </div>


        <div class="karten-info">

            📅 Deadline:
            ${deutschesDatum(
                aufgabe.deadline
            )}

        </div>


        <div class="karten-info">

            Status:
            ${aufgabe.status}

        </div>


        <div
            class="
                deadline
                ${deadline.klasse}
            "
        >

            ${deadline.text}

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


// ----------------------------------------------------
// DASHBOARD AUFGABEN
// ----------------------------------------------------

function zeigeDashboardAufgaben() {

    const liste =
        document.getElementById(
            "dashboardAufgaben"
        );


    liste.innerHTML = "";


    const naechste =
        [...aufgaben]

        .filter(
            aufgabe =>
                aufgabe.status
                !==
                "erledigt"
        )

        .sort(
            (a, b) => {

                const datumA =
                    new Date(
                        a.deadline
                    );


                const datumB =
                    new Date(
                        b.deadline
                    );


                if (
                    datumA
                    !==
                    datumB
                ) {

                    return (
                        datumA
                        -
                        datumB
                    );

                }


                return (
                    prioritaetsWert(
                        b.prioritaet
                    )
                    -
                    prioritaetsWert(
                        a.prioritaet
                    )
                );

            }
        )

        .slice(
            0,
            3
        );


    naechste.forEach(
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


// ----------------------------------------------------
// DASHBOARD LERNZIELE
// ----------------------------------------------------

function zeigeDashboardZiele() {

    const container =
        document.getElementById(
            "dashboardZiele"
        );


    container.innerHTML = "";


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
                document.createElement(
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
                    Stunden

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


            container.appendChild(
                box
            );

        }
    );
}


// ----------------------------------------------------
// ÜBERSICHT
// ----------------------------------------------------

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

                const tage =
                    tageBisDeadline(
                        aufgabe.deadline
                    );


                return (
                    aufgabe.status
                    !==
                    "erledigt"
                    &&
                    tage >= 0
                    &&
                    tage <= 3
                );

            }
        ).length;
}


// ----------------------------------------------------
// APP STARTEN
// ----------------------------------------------------

speichern();

aktualisiereFaecher();

zeigeAufgaben();

aktualisiereUebersicht();

zeigeDashboardAufgaben();

zeigeDashboardZiele();
