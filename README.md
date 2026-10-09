# StudyBuddy

StudyBuddy ist eine Lernplanungs-App für Studierende.

## Funktionen

- Aufgaben hinzufügen, bearbeiten und löschen
- Dringlichkeit von Aufgaben automatisch berechnen
- Aufgaben automatisch nach Wichtigkeit sortieren
- Aufgaben nach Fach, Deadline und Bearbeitungsstatus filtern
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

Der Dringlichkeitsalgorithmus berechnet, wie dringend eine Aufgabe ist.

Berücksichtigt werden:

- Deadline
- Priorität
- geschätzter Zeitaufwand
- bereits investierte Zeit
- Restaufwand
- benötigte Lernzeit pro Tag

Der Restaufwand wird so berechnet:

Restaufwand = Zeitaufwand - investierte Zeit

Anschließend wird berechnet, wie viel Zeit pro Tag ungefähr notwendig wäre.

Die Einstufung erfolgt nach folgenden Regeln:

- Sehr dringend:
  höchstens 1 Tag bis zur Deadline
  ODER mindestens 2,5 benötigte Stunden pro Tag

- Dringend:
  höchstens 3 Tage bis zur Deadline
  ODER mindestens 1,5 benötigte Stunden pro Tag
  ODER hohe Priorität und höchstens 5 Tage bis zur Deadline

- Bald einplanen:
  höchstens 7 Tage bis zur Deadline
  ODER mindestens 0,75 benötigte Stunden pro Tag
  ODER hohe Priorität

- Noch genug Zeit:
  wenn keine der vorherigen Bedingungen erfüllt ist

- Erledigt:
  wenn die Aufgabe abgeschlossen wurde


### 2. Sortieralgorithmus

Die offenen Aufgaben werden automatisch sortiert.

Reihenfolge:

1. höchste Dringlichkeit
2. höchste benötigte Lernzeit pro Tag
3. früheste Deadline

Dadurch werden Aufgaben, die zeitlich kritischer sind, weiter oben angezeigt.


### 3. Wochenzielalgorithmus

Das Wochenziel wird automatisch aus den offenen Aufgaben berechnet.

Zuerst wird der Restaufwand berechnet:

Restaufwand = Zeitaufwand - investierte Zeit

Danach wird der Restaufwand auf die verbleibenden Tage bis zur Deadline verteilt.

Für das aktuelle Wochenziel wird nur der Anteil berücksichtigt, der bis Sonntag dieser Woche notwendig ist.

Dadurch wird bei einer Aufgabe, die erst in mehreren Wochen fällig ist, nicht der komplette Aufwand sofort in das aktuelle Wochenziel aufgenommen.


### 4. Tageslernplan-Algorithmus

StudyBuddy berechnet, wie viel Zeit heute für jede offene Aufgabe eingeplant werden sollte.

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

Der tägliche Bedarf wird aus dem Restaufwand und den verbleibenden Tagen bis zur Deadline berechnet.

Danach wird ein Planungswert berechnet:

Planungswert =
täglicher Bedarf × Dringlichkeitsrang × Prioritätsfaktor

Aufgaben mit einem höheren Planungswert erhalten einen größeren Anteil der empfohlenen Lernzeit für heute.

Die maximal empfohlene Lernzeit pro Tag beträgt derzeit 4 Stunden.


## Weitere Berechnungen und Funktionen

- Tage bis zur Deadline berechnen
- Restaufwand einer Aufgabe berechnen
- automatische Erledigung, wenn die investierte Zeit den geschätzten Aufwand erreicht
- Umrechnung von Dezimalstunden in Stunden und Minuten
- Fortschritt des Wochenziels in Prozent berechnen
- automatische Erkennung eines Wochenwechsels
- Zurücksetzen der erfassten Wochenlernzeit bei einer neuen Woche
- Timerzeit zur Wochenlernzeit hinzufügen
- bei Auswahl einer Aufgabe wird die Timerzeit zusätzlich als investierte Aufgabenzeit gespeichert
- Aufgaben im Kalender mit der jeweiligen Fachfarbe anzeigen
- beim Anklicken einer Kalenderaufgabe werden nur die Details dieser Aufgabe angezeigt


## Datenspeicherung

Die Datei `studybuddy_tasks.json` enthält die Ausgangsdaten der Anwendung.

Beim ersten Start versucht StudyBuddy, die Fächer und Aufgaben aus dieser JSON-Datei zu laden.

Danach werden Änderungen, die der Benutzer auf der Website vornimmt, im LocalStorage des Browsers gespeichert.

Das bedeutet:

- neue Aufgaben werden im LocalStorage gespeichert
- Änderungen an Aufgaben werden im LocalStorage gespeichert
- Lernzeiten werden im LocalStorage gespeichert
- die Dark-Mode-Einstellung wird im LocalStorage gespeichert

Die JSON-Datei wird durch Änderungen auf der Website nicht automatisch verändert.

Wenn bereits Daten im LocalStorage vorhanden sind, werden diese verwendet und nicht erneut die Ausgangsdaten aus der JSON-Datei geladen.

Zusätzlich speichert StudyBuddy eine Kennung für die aktuelle Woche.

Wenn eine neue Woche beginnt, wird die erfasste Wochenlernzeit der Fächer wieder auf 0 gesetzt.


## Aufbau der Daten

### Fächer

Ein Fach besitzt:

- name
- gelernteStunden

Die empfohlenen Wochenziele werden nicht fix gespeichert, sondern automatisch aus den offenen Aufgaben berechnet.


### Aufgaben

Eine Aufgabe besitzt:

- id
- aufgabe
- fach
- typ
- deadline
- prioritaet
- status
- zeitaufwand
- investierteZeit
- notiz


## Dateien

- `studybuddy.html` = Aufbau und Benutzeroberfläche
- `studybuddy.css` = Design, Farben, Dark Mode und Layout
- `studybuddy.js` = Funktionen, Berechnungen und Algorithmen
- `studybuddy_tasks.json` = Ausgangsdaten für Fächer und Aufgaben