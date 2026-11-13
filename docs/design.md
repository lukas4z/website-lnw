# LNW Automation & AI Solutions: Landing Page, Konzept und Plan

Stand: 13.11.2026

## Ziel

Eine Landing Page, die Interessenten zeigt, was Lukas anbietet, und sie dazu bringt, ihm eine E-Mail zu schreiben. Sie soll wie von Hand gestaltet wirken, nicht wie eine typische KI-Seite. Kern der Seite ist eine Animation, in der ein Bot sichtbar Aufgaben abarbeitet.

## Was feststeht (von Lukas)

- Firmenname: LNW Automation & AI Solutions, Inhaber Lukas Wiesemöller, Vitusstraße 10, Borchen
- Kontakt nur per E-Mail: kontakt@lnw-automations-solutions.de
- Deutsch, per Du, keine Preise, keine Referenzen
- Zielgruppe: Startups, Gaming- und Discord-Communities, alle mit wiederkehrenden Abläufen
- Leistungen: Prozessautomation, KI-Bots und Assistenten, Websites, Prozessoptimierung
- Clean, mit Glas-Elementen; Navigation oben, die zu den Abschnitten springt
- Leistungskarten spielen beim Hovern oder Antippen eine kleine Animation
- Über mich allgemein: langjährige IT- und Security-Erfahrung, Foto-Platzhalter
- Impressum und Datenschutz (Datenschutz als Platzhalter)

## Entscheidungen (Stand nach Lukas' Feedback)

- **Look:** Hallmark-Theme „Refract“, Variante Glas. Hero und Kontakt sind dunkle Glasflächen mit Prisma-Licht, der Rest ist hell. Ein Umschalter in der Navigation stellt die ganze Seite auf dunkel. Schriften Funnel Display und Funnel Sans, lokal eingebunden.
- **Bot:** eigene kleine Roboter-Figur, die an einem Glas-Monitor tippt. Aufgaben wandern als beschriftete Chips von den Eingängen zum Roboter und als Ergebnis zu den Zielen.
- **Ablauf:** vier Schritte auf einer Linie, die sich beim Scrollen zeichnet, jeder mit kleiner Zeichnung.
- **Erstgespräch:** kostenlos und unverbindlich (von Lukas bestätigt).
- **Impressum und Datenschutz:** eigene Unterseiten, im Footer verlinkt.
- **Technik:** statische Seite aus HTML, CSS und JavaScript, ohne Framework und ohne Build-Schritt. Keine Cookies, keine Tracker, keine fremden Server.

## Verworfene Wege

- **Komplett dunkel als einziger Look (Theme „Lumen“):** hat keine Glasflächen; stattdessen gibt es den dunklen Modus per Umschalter.
- **Framework (Next.js o. ä.):** für eine einzelne Seite unnötig schwer.

## Seitenaufbau

1. **Navigation:** schwebende Glas-Leiste: LNW, Leistungen, Ablauf, Für wen, Über mich, Knopf „Projekt anfragen“. Aktiver Abschnitt markiert, mobil als Menü.
2. **Hero:** oben breit die Bot-Animation: links drei Eingänge (E-Mail, Discord, Formular), in der Mitte das Bot-Panel, rechts drei Ziele (Antworten, Datenbank, Kalender). Aufgaben wandern als Punkt über die Verbindungslinien, der Bot hakt drei Schritte ab und tippt das Ergebnis. Mit Pause-Knopf. Darunter Überschrift, ein Satz, zwei Knöpfe.
3. **Leistungen:** vier Kacheln in unterschiedlichen Breiten, jede mit eigener Mini-Animation.
4. **Ablauf:** vier nummerierte Zeilen von Kennenlernen bis Betrieb.
5. **Für wen:** Umschalter mit drei Zielgruppen, je drei Beispiele.
6. **Über mich:** Text neben Foto-Platzhalter.
7. **Kontakt:** große Glasfläche im Licht mit E-Mail-Knopf und Adresse zum Kopieren.
8. **Footer:** Gruß, Anschrift, Links zu Impressum und Datenschutz.

## Plan

1. Gerüst: Tokens, Schriften, Icons
2. Navigation und Hero mit Bot-Animation, im Browser prüfen
3. Übrige Abschnitte und Footer
4. Unterseiten Impressum und Datenschutz
5. Hallmark-Prüfung (sloplint), Screenshots Desktop und Mobil, Fehler beheben
6. Dunkler Modus mit Umschalter (umgesetzt)

## Offen für Lukas

- Texte sind Entwürfe und sollten gegengelesen werden
- Foto für „Über mich“ als Datei in ausreichender Größe (das LinkedIn-Vorschaubild ist zu klein)
- Impressum: Telefonnummer und ggf. Umsatzsteuer-Angabe
- Datenschutzerklärung: Text passend zum späteren Hoster
- Logo als eigener Schritt
