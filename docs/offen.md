# Offene Punkte

Stand: 13.11.2026

## Vorgemerkt

- **Zwei Repos statt zwei Branches:** Die erste Version (`main`) und die Scroll-Version (`premium-scroll`) sollen später in getrennte Repos, sobald klar ist, ob beide weiterleben. Fürs Zeigen und Vergleichen reicht ein Repo mit zwei Branches.

## Hochladen

- **Nur `dist/` hochladen, nie den ganzen Ordner.** `python3 scripts/build_site.py` baut `dist/` mit genau den Dateien, die die Seite braucht. `.git`, `docs/` und alles andere bleiben draußen.
- **Security-Header liegen in `dist/` bereit:** `_headers` (Netlify, Cloudflare Pages) und `.htaccess` (Apache). Bei einem anderen Hoster die Werte aus `_headers` in dessen Oberfläche eintragen. Die Hashes in der Content-Security-Policy rechnet das Skript bei jedem Lauf neu aus.
- Das Skript bricht mit einem Hinweis ab, solange in den Rechtstexten Platzhalter stehen.

## Vor dem Livegang (braucht Angaben von Lukas)

- **Impressum, Umsatzsteuer:** Kleinunternehmer nach § 19 UStG oder USt-IdNr.
- **Impressum, zweiter Kontaktweg:** Neben der E-Mail ist ein weiterer schneller Weg nötig, üblich ist eine Telefonnummer.
- **Datenschutzerklärung, Hoster:** Name, Anschrift, Speicherdauer der Server-Protokolle, Vertrag zur Auftragsverarbeitung. Der Rest des Textes steht, sollte aber einmal rechtlich gegengelesen werden.
- **Anschrift:** Straße und Postleitzahl stehen nur noch im Impressum und in der Datenschutzerklärung, nicht mehr im Footer und nicht in den strukturierten Daten. Sobald es eine Geschäftsadresse gibt, dort eintragen.
- **Adresse der Seite:** `og:url`, `og:image`, `canonical`, die strukturierten Daten, `robots.txt` und `sitemap.xml` nennen `https://lnw-automations-solutions.de`. Läuft die Seite woanders, dort anpassen.
- **E-Mail:** SPF, DKIM und DMARC für die Domain einrichten.
- **Echtes Handy und Screenreader:** bisher nur im Emulator geprüft.

## Inhalt, Vorschläge aus der Testrunde (noch nicht entschieden)

- Kurzer Absatz „Über mich“ mit der Security-Erfahrung, ohne Foto.
- Abschnitt „Daten & Sicherheit“: wo die Bots laufen, welcher KI-Anbieter, Auftragsverarbeitung.
- Preisorientierung ohne Preisliste, Antwortzeit, genutzte Werkzeuge, ein bis drei Beispielprojekte.
- „Für wen“ um Communities, Creator und Onlineshops erweitern, Discord als zweiter Kontaktweg. Steht im Widerspruch zur Entscheidung, Gaming und Discord wegzulassen und die Seite auf Unternehmen auszurichten.
- Zeile „Lieber Sie? Kein Problem.“ für B2B-Kunden.

## Erledigt in der Testrunde

- Scroll-Version: Hero-Buttons klickbar, Footer verdeckt die Kontakt-Buttons nicht mehr, Roboter überlappt weder Überschrift noch Buttons, Menü-Links springen nach dem Mausrad-Scrollen richtig, niedrige Fenster und starker Zoom schneiden nichts mehr ab, Footer ist ein eigener Bereich, Kontraste angehoben.
- Erste Version: Buttons unter der Mail-Karte springen nicht mehr, Sprechblase wird nicht mehr abgeschnitten, System-Dunkelmodus wird übernommen, Tool-Reste entfernt.
- Beide: Statement für Screenreader lesbar, Tabs behalten den Fokus und haben einen Pause-Knopf, Menü gibt den Fokus zurück, „Kopiert“ wird angesagt, Druckansicht, canonical, strukturierte Daten, `robots.txt`, `sitemap.xml`, Touch-Icon.
