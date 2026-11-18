# Beta-Preis-Kalkulator

Tool für Kundinnen: Kursdauer, Live-Sessions, Outcome, Umfrage-Teilnehmerinnen und Boni rein, empfohlener Beta-Preis plus Umsatz-Prognose (4/6/8 Teilnehmerinnen) raus. Die KI stuft nur ein, ob das Programm B2B oder B2C ist und wie groß die Transformation ist. Der Preis selbst wird fest im Code berechnet (`berechnen()` in `src/App.jsx`).

**Live:** https://beta-preis-kalkulator.netlify.app
**GitHub:** `katharinanahm19/beta-preis-kalkulator` (Netlify baut bei Push auf `main`). Änderungen hier machen und den Ordnerinhalt dorthin pushen.

## Aufbau
- `src/App.jsx`: Formular, Preislogik, Ergebnis (React + Vite)
- `netlify/functions/analyse.mjs`: KI-Einstufung serverseitig, Modell `claude-sonnet-5-5`
- Netlify-Env: `ANTHROPIC_API_KEY` (als Secret, OHNE `VITE_`-Präfix)

## Preislogik (Kurzfassung)
Rohpreis = (60 + Wochen × 6 + Sessions × 10) × Transformation (0,75 / 1,0 / 1,35) × Interesse (Umfrage unter 10 = 0,6, bis 30 = 1,0, darüber 1,3) × Länge × B2B 1,4. Gerundet auf 97 … 497 €, Deckel nach Interesse (B2C 97/197/297, B2B 247/347/497). Nur 1:1 in den Boni darf den Deckel überschreiten (max. B2C 397, B2B 497).

## Fix 18.11.2026
Die KI-Abfrage lief direkt aus dem Browser mit einem Key im öffentlichen JavaScript (`VITE_ANTHROPIC_API_KEY`) und mit dem abgeschalteten Modell `claude-sonnet-4-20250514`. Die API gab 404, der Code schluckte den Fehler und rechnete mit leeren Werten weiter: immer B2C, Transformation „undefined“, leere Begründungen, zu niedriger Preis. Jetzt läuft die Abfrage über die Netlify Function, Fehler werden angezeigt statt still weitergerechnet.

## Lokal testen
`npm install && npx vite` zeigt nur die Oberfläche. Die KI-Funktion braucht `netlify dev` mit `ANTHROPIC_API_KEY`.
