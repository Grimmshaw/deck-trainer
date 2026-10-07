# Deck Trainer (arbetsnamn)

Pluggapp för befälselever: morse, prickning (IALA), lanternor och dagersignaler, COLREGs, ljudsignaler, flaggor och nödsignaler (React + Vite + TypeScript, PWA).

## Kom igång (första gången)

Öppna PowerShell och kör:

```
cd C:\Users\robin\projekt\morse-app
npm install
npm run dev
```

Öppna sedan adressen som visas (oftast http://localhost:5173) i webbläsaren.
Stoppa servern med `Ctrl + C`.

## Testa på mobilen

`npm run dev` visar även en **Network**-adress (t.ex. http://192.168.1.23:5173).
Öppna den i mobilens webbläsare. Datorn och mobilen måste vara på samma wifi.

## Kommandon

| Kommando            | Vad det gör                                     |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Startar appen för utveckling                    |
| `npm run build`     | Bygger färdig app till mappen `dist`            |
| `npm run preview`   | Visar den byggda appen (testa PWA/offline här)  |
| `npm run typecheck` | Kontrollerar koden efter typfel                 |
| `npm test`          | Kör testerna som kontrollerar reglerna (facit)   |

## Publicera (GitHub + Netlify)

Första gången:

1. Skapa ett **privat** repo på github.com som heter `deck-trainer`. Kryssa **inte** i README eller .gitignore.
2. Kör i PowerShell:

```
cd C:\Users\robin\projekt\morse-app
git config --global user.name "Lanterna"
git config --global user.email "din-github-epost"
git init
git add .
git commit -m "Första versionen"
git branch -M main
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/deck-trainer.git
git push -u origin main
```

3. På netlify.com: **Add new site → Import an existing project → GitHub** och välj `deck-trainer`.
   Inställningarna läses från `netlify.toml`, så tryck bara **Deploy**.

Efter det räcker det med att köra:

```
git add .
git commit -m "Vad du ändrade"
git push
```

Netlify bygger och publicerar automatiskt efter varje push.

## Integritetspolicy

`public/privacy.html` är ett utkast. Fyll i det som står inom [hakparenteser] innan appen publiceras.
Sidan ligger på `/privacy.html`, och den adressen anges i Google Play Console.

## Var finns vad?

- `src/morse.ts`, `src/words.ts` – morsetabellen och ordlistorna
- `src/buoyage/` – IALA-märken som data och ritmotorn för bojar
- `src/lights/` – fartygens lanternor och dagersignaler (Rule 21–30) och ritmotorn
- `src/colregs/` – "vad gör du?"-logiken (Rule 13–18)
- `src/sound/` – ljudsignaler (Rule 32–35) och ljudspelaren
- `src/flags/` – ICS-flaggorna
- `src/content/` – skrivna teorifrågor och nödsignaler
- `src/study/` – pluggmotorn: frågegeneratorer, framsteg och spaced repetition
- `src/components/` – skärmarna
- `src/tests/` – tester som kontrollerar reglerna
- `public/` – ikoner
