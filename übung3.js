function sortiereFahrraeder(fahrraeder) {
    const verfuegbareFahrraeder = fahrraeder.filter(fahrrad =>
        fahrrad.verfuegbar === true
    );

    verfuegbareFahrraeder.sort((a, b) => {
        if (a.entfernung !== b.entfernung) {
            return a.entfernung - b.entfernung;
        }

        return b.akku - a.akku;
    });

    return verfuegbareFahrraeder;
}

const ergebnis = sortiereFahrraeder([
    { name: "Fahrrad A", entfernung: 5, akku: 80, verfuegbar: true },
    { name: "Fahrrad B", entfernung: 3, akku: 60, verfuegbar: false },
    { name: "Fahrrad C", entfernung: 2, akku: 90, verfuegbar: true }
]);

console.log(ergebnis);