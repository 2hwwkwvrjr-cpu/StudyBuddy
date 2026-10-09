console.log("===== StudyBuddy Tests =====");


// ======================================================
// TEST 1
// Restaufwand normal berechnen
// ======================================================

// ARRANGE
const testAufgabe1 = {
    zeitaufwand: 5,
    investierteZeit: 2
};

const erwartet1 = 3;


// ACT
const ergebnis1 =
    restaufwandVon(
        testAufgabe1
    );


// ASSERT
console.assert(
    ergebnis1 === erwartet1,
    "Test 1 fehlgeschlagen: Restaufwand sollte 3 Stunden sein."
);

console.log(
    "Test 1 bestanden:",
    ergebnis1 === erwartet1
);


// ======================================================
// TEST 2
// Restaufwand darf nicht negativ werden
// ======================================================

// ARRANGE
const testAufgabe2 = {
    zeitaufwand: 5,
    investierteZeit: 7
};

const erwartet2 = 0;


// ACT
const ergebnis2 =
    restaufwandVon(
        testAufgabe2
    );


// ASSERT
console.assert(
    ergebnis2 === erwartet2,
    "Test 2 fehlgeschlagen: Restaufwand sollte 0 sein."
);

console.log(
    "Test 2 bestanden:",
    ergebnis2 === erwartet2
);


// ======================================================
// TEST 3
// Erledigte Aufgabe muss Dringlichkeit 0 haben
// ======================================================

// ARRANGE
const testAufgabe3 = {
    zeitaufwand: 5,
    investierteZeit: 5,
    deadline: "2026-10-20",
    prioritaet: "hoch",
    status: "erledigt"
};

const erwartet3 = 0;


// ACT
const ergebnis3 =
    berechneDringlichkeit(
        testAufgabe3
    );


// ASSERT
console.assert(
    ergebnis3.rang === erwartet3,
    "Test 3 fehlgeschlagen: Erledigte Aufgabe sollte Rang 0 haben."
);

console.log(
    "Test 3 bestanden:",
    ergebnis3.rang === erwartet3
);


// ======================================================
// TEST 4
// Prioritätsfaktor prüfen
// ======================================================

// ARRANGE
const prioritaet4 =
    "hoch";

const erwartet4 =
    1.5;


// ACT
const ergebnis4 =
    prioritaetsFaktor(
        prioritaet4
    );


// ASSERT
console.assert(
    ergebnis4 === erwartet4,
    "Test 4 fehlgeschlagen: Hohe Priorität sollte Faktor 1.5 haben."
);

console.log(
    "Test 4 bestanden:",
    ergebnis4 === erwartet4
);


console.log("===== Tests beendet =====");
