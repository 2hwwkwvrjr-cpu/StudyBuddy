const fs = require("fs");
const path = require("path");

function zeigeAufgaben(dateiname = "studybuddy_tasks.json") {

    const dateipfad = path.join(__dirname, dateiname);

    const dateiinhalt = fs.readFileSync(dateipfad, "utf8");

    const aufgaben = JSON.parse(dateiinhalt);

    if (!Array.isArray(aufgaben)) {
        throw new Error("Die JSON-Datei muss eine Liste von Aufgaben enthalten.");
    }

    function prioritaetsWert(prioritaet) {

        if (prioritaet === "hoch") {
            return 3;
        }

        if (prioritaet === "mittel") {
            return 2;
        }

        return 1;
    }

    aufgaben.sort((a, b) => {

        const deadlineA = new Date(a.deadline);
        const deadlineB = new Date(b.deadline);

        if (deadlineA < deadlineB) {
            return -1;
        }

        if (deadlineA > deadlineB) {
            return 1;
        }

        return prioritaetsWert(b.prioritaet)
             - prioritaetsWert(a.prioritaet);
    });

    console.log("\nStudyBuddy - Lernaufgaben\n");

    aufgaben.forEach((aufgabe, index) => {

        console.log(`Aufgabe ${index + 1}:`);
        console.log(`Aufgabe: ${aufgabe.aufgabe}`);
        console.log(`Fach: ${aufgabe.fach}`);
        console.log(`Deadline: ${aufgabe.deadline}`);
        console.log(`Priorität: ${aufgabe.prioritaet}`);
        console.log(`Status: ${aufgabe.status}`);
        console.log("--------------------------------");
    });
}

try {

    zeigeAufgaben();

} catch (fehler) {

    console.error("Die Aufgaben konnten nicht angezeigt werden.");
    console.error(fehler.message);
}
