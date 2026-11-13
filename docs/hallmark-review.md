# Hallmark-Durchsicht (unabhängiger Prüfer), 13.11.2026

Urteil: **fix**. Die Idee trägt (der Roboter, der echte Aufgaben abarbeitet), das Design dahinter ist zu schlicht.

## Befunde, nach Gewicht

1. Der Hero ist dunkelblau, das Theme „Refract“ wäre heller Putz im Sonnenlicht. Die Seite liest sich als blaue Tech-Seite.
2. Zwischen Hero und Kontakt gibt es rund 3.600 px ohne Licht und fast ohne Fläche. Die Kacheln sind flach, die Animationen füllen nur etwa 15 % ihrer Kachel.
3. Der Ablauf hat keine Masse, und dieselbe Figur (Chip, Linie, Chip) kommt fünfmal vor.
4. Unschärfe-Glas an Navigation, Knoten und Bildschirm; die Navigation wirkt über Dunkelblau grau.
5. Im Kontakt läuft das Farbband unter Überschrift und Text.
6. Bei 1280 px werden Notizen in den Ziel-Knoten abgeschnitten.
7. In „Für wen“ ist die Unterüberschrift größer als die Abschnittsüberschrift.
8. Das Porträt ist nur 400 × 400 px und wirkt wie ein Passfoto.

Texte: Mehrere Überschriften würden unverändert auf jede andere Seite passen.

## Drei Änderungen von „sauber“ zu „merkbar“

1. Grund und Palette wechseln: kein Dunkelblau, das Spektrum als einzige Farbe.
2. Den Roboter groß machen (etwa 420 px) und auf der Seite wiederkehren lassen.
3. Eine Leitkachel im Raster, jede Animation füllt mindestens die halbe Kachel.

Nicht verwässern: der Roboter am Monitor, der benannte Aufgaben von der Quelle zum Ziel bringt.

## Was in diesem Branch umgesetzt ist

- Punkt 6: kürzere Notizen in den Ziel-Knoten.
- Punkt 7: Unterüberschrift in „Für wen“ kleiner als die Abschnittsüberschrift.

Die großen Punkte (Palette, Roboter, Kacheln, Ablauf, Texte) gehen in den neuen Versuch im Branch `premium-scroll`.
