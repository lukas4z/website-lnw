# BRIEF: premium-scroll (scroll-craft)

Self-authored under explicit creative delegation. Lukas schrieb: „keins davon … dann einfach modern, catchy, premium, vllt bisschen neumodische Glas-Elemente“ und wollte die Seite scroll-gesteuert. Aussagen unten sind meine Entscheidungen, außer wo „Lukas:“ davorsteht.

1. **Vibe:** Nachtschicht, flüssiges Glas, Prismenlicht, präzise, verspielt.
2. **Reise:** Lukas: Bot arbeitet sichtbar Aufgaben ab, dann Leistungen, Ablauf, Für wen, Über mich, Kontakt.
3. **Energie:** laut im ersten Akt, ruhig beim Lesen in der Mitte, groß und still am Schluss.
4. **Gefühl und der eine Moment:** Erleichterung. Der Moment: Beim Scrollen leert sich der Stapel, bis „6 von 6 erledigt“ dasteht.
5. **Was keine andere Seite tut:** Das eigene Scrollen ist die Automation: jede Raddrehung gibt dem Roboter die nächste Aufgabe.
6. **Abstand zu premium-minimal:** premium, aber mit Farbe aus dem Licht und einem elektrischen Grün; kein Dunkelblau/Weiß (Lukas).
7. **Eine Welt oder Szenen:** eine Welt (ein durchgehender dunkler Raum, das Licht dreht sich mit dem Scrollen), aber getrennte Akte.
8. **Vorhandenes Material:** Lukas' Porträt; der Roboter und die Oberflächen sind in der Seite gebaut. Keine generierten Bilder (kein kie.ai-Schlüssel).

## Sag-es-weiter-Satz

„Es ist die Seite, auf der dein Scrollen den Posteingang leerräumt.“

## Gefühlskurve und Partitur

| Akt | Gefühl | Gerät | Was es auslöst |
|---|---|---|---|
| 1 Schreibtisch | Wiedererkennen, dann Erleichterung (Höhepunkt) | `pin` + eigener Scroll-Ablauf | Sechs Aufgaben fliegen beim Scrollen in den Roboter, die Liste hakt ab |
| 2 Satz | Ruhe | Wörter füllen sich beim Scrollen | Ein Satz, groß |
| 3 Leistungen | Neugier | `pan` + `tilt` | Vier Glaskarten ziehen seitlich vorbei, jede spielt ihren Ablauf |
| 4 Für wen | Zugehörigkeit | `flow` + Umschalter | Drei Zielgruppen, je drei Beispiele |
| 5 Ablauf | Zuversicht | `pin`, Linie über `--sc-p` | Vier Schritte, die Linie wächst mit dem Scrollen |
| 6 Über mich | Vertrauen | `flow` + `reveal` | Porträt wischt auf |
| 7 Schluss | Einladung | `pin` + `kinetic` + `magnet` | Große Zeile, E-Mail, der Roboter fragt, Footer im Bild |

## Signatur

Der Scroll-Stapel in Akt 1: sechs Glas-Chips, deren Flugbahn, Zähler und Abhaken allein aus dem Scroll-Fortschritt berechnet werden (CSS über `--sc-p`, kleines Skript für Zähler und Roboter).

## Nicht eingehalten oder nicht geprüft

- Keine fotografischen Ebenen im Hero (kein Material, kein Generator-Schlüssel); Tiefe entsteht aus Licht, Glas-Chips und Roboter.
- Der scroll-craft-Prüflauf (`shoot.mjs`) und ein echtes Handy sind nicht gelaufen; geprüft wurde mit eigenen Screenshots in Chromium.
