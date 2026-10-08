# StudyBuddy

StudyBuddy ist eine Lernplanungs-App für Studierende.

## Funktionen

- Aufgaben hinzufügen, bearbeiten und löschen
- Dringlichkeit von Aufgaben automatisch berechnen
- Aufgaben automatisch nach Wichtigkeit sortieren
- automatisches Wochenziel berechnen
- automatischen Tageslernplan erstellen
- Lernzeit erfassen
- Lerntimer verwenden
- Kalender mit Deadlines
- Aufgaben im Kalender anklicken und Details anzeigen
- Fächer durch unterschiedliche Farben darstellen
- Dark Mode


## Algorithmen

### 1. Dringlichkeitsalgorithmus

Der Algorithmus berechnet, wie dringend eine Aufgabe ist.

Berücksichtigt werden:

- Deadline
- Priorität
- geschätzter Aufwand
- bereits investierte Zeit
- Restaufwand
- benötigte Lernzeit pro Tag

Restaufwand:

Zeitaufwand - investierte Zeit

Die Aufgabe wird danach eingestuft als:

- Sehr dringend
- Dringend
- Bald einplanen
- Noch genug Zeit
- Erledigt


### 2. Sortieralgorithmus

Die offenen Aufgaben werden automatisch sortiert.

Reihenfolge:

1. höchste Dringlichkeit
2. höchste benötigte Lernzeit pro Tag
3. früheste Deadline


### 3. Wochenzielalgorithmus

Das Wochenziel wird automatisch aus den offenen Aufgaben berechnet.

Zuerst wird der Restaufwand berechnet:

Restaufwand = Zeitaufwand - investierte Zeit

Anschließend wird der Restaufwand auf die verbleibenden Tage bis zur Deadline verteilt.

Für das aktuelle Wochenziel wird nur die Lernzeit berücksichtigt, die bis Sonntag dieser Woche notwendig ist.


### 4. Tageslernplan-Algorithmus

StudyBuddy berechnet, wie viel Zeit heute für jede Aufgabe eingeplant werden sollte.

Dabei werden berücksichtigt:

- Restaufwand
- Deadline
- täglicher Lernbedarf
- Dringlichkeit
- Priorität

Für die Priorität werden Faktoren verwendet:

- hoch = 1,5
- mittel = 1,0
- niedrig = 0,7

Der Planungswert wird vereinfacht so berechnet:

Planungswert =
täglicher Bedarf × Dringlichkeitsrang × Prioritätsfaktor

Aufgaben mit einem höheren Planungswert bekommen einen größeren Anteil der empfohlenen Lernzeit für heute.

Die maximal empfohlene Lernzeit pro Tag beträgt derzeit 4 Stunden.


## Weitere Berechnungen

- Tage bis zur Deadline
- Restaufwand einer Aufgabe
- automatische Erledigung, wenn investierte Zeit den Aufwand erreicht
- Umrechnung von Dezimalstunden in Stunden und Minuten
- Fortschritt des Wochenziels in Prozent
- Timerzeit wird zur Wochenlernzeit hinzugefügt
- bei Auswahl einer Aufgabe wird die Timerzeit zusätzlich als investierte Aufgabenzeit gespeichert

## Dateien

- `studybuddy.html` = Aufbau und Benutzeroberfläche
- `studybuddy.css` = Design, Farben, Dark Mode und Layout
- `studybuddy.js` = Funktionen, Berechnungen und Algorithmen
- `studybuddy_tasks.json` = Ausgangsdaten für Fächer und Aufgaben