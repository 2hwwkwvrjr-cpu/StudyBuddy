const fs = require("fs");
const path = require("path");

function zeigeDatensatz(dateiname = "fastrent_bikes.json") {
  const dateipfad = path.join(__dirname, dateiname);
  const dateiinhalt = fs.readFileSync(dateipfad, "utf8");
  const datensatz = JSON.parse(dateiinhalt);

  if (!Array.isArray(datensatz)) {
    throw new Error("Der Datensatz muss eine Liste von Objekten sein.");
  }

  console.log(`\n${datensatz.length} Datensätze geladen.\n`);

  datensatz.forEach((objekt, index) => {
    console.log(`Datensatz ${index + 1}:`);
    console.log(objekt);
    console.log("----------------------------------------");
  });
}

try {
  zeigeDatensatz();
} catch (fehler) {
  console.error("Der Datensatz konnte nicht angezeigt werden:");
  console.error(fehler.message);
  process.exitCode = 1;
}
// mei commit von Emrullah

//mei commit von xxxxxx