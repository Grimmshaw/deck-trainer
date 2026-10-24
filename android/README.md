# Lanterna – Android-appen

Det här är Android-skalet till Lanterna. Det är en Trusted Web Activity som öppnar app.lanternakonsult.se med Play Billing. Skalet gjordes förut med PWABuilder. Sedan 24 okt 2026 (version code 3) byggs det med Bubblewrap härifrån, eftersom vi har lagt till egen Android-kod:

- **ReviewActivity** (`app/src/main/java/se/lanternakonsult/lanterna/ReviewActivity.java`) är en osynlig skärm som öppnar Google Plays egen betygsruta (In-App Review API) och sedan stänger sig. Webbappen öppnar den med länken `intent://review#Intent;scheme=lanterna;package=se.lanternakonsult.lanterna;end`. Reglerna för när det sker står i `src/store/review.ts`.
- **Startadressen är `/?twa=3`.** Så vet webbappen att skalet har ReviewActivity. Äldre appversioner skickar inte `twa=3` och får därför aldrig länken.

Inställningarna (package `se.lanternakonsult.lanterna`, färger, porträttläge, aviseringar, Play Billing) är tagna från version code 2. Den enda skillnaden är att namnet under ikonen nu är "Lanterna" i stället för det avkortade "Lanterna – deck officer traine".

## Bygga en ny .aab (Windows, PowerShell)

Första gången:

1. Installera Bubblewrap: `npm i -g @bubblewrap/cli`
2. `signing.keystore` ska ligga i den här mappen (`C:\Users\robin\projekt\morse-app\android\signing.keystore`). Den lades dit 24 okt 2026. Saknas den, kopierar du den från PWABuilder-zip:en. Filen kommer aldrig med i git (se `.gitignore`).

Varje gång:

```
cd C:\Users\robin\projekt\morse-app\android
bubblewrap build
```

- Första gången frågar Bubblewrap om den ska installera JDK och Android SDK. Svara **Yes** på båda och godkänn licenserna (`y`). Det tar några minuter.
- Om Bubblewrap frågar om projektet ska uppdateras ("twa-manifest.json has changed … update?") svarar du **No**. En uppdatering skriver över ReviewActivity.
- Lösenorden står i `signing-key-info.txt` i zip:en: först *Key store password*, sedan *Key password*.
- Resultatet blir `app-release-bundle.aab` i den här mappen. Den laddar du upp i Play Console.

**Nästa version:** höj `appVersionCode` (3 → 4) och `appVersion` i `twa-manifest.json`, och samma två värden (`versionCode`, `versionName`) i `app/build.gradle`. Kör sedan `bubblewrap build` och svara **No** på frågan om uppdatering.

## Testa betygsrutan

Betygsrutan syns bara när appen är installerad från Google Play, aldrig när du installerar apk-filen själv.

- Använd spåret **Internal testing** i Play Console. Där finns ingen gräns för hur ofta rutan visas. Ladda upp .aab-filen, lägg in din egen Gmail-adress som testare och installera appen från Play-butiken med det kontot.
- Kontot måste vara det primära kontot i Play-butiken. Använd ett vanligt Gmail-konto, inte ett företagskonto i Google Workspace. Kontot får inte redan ha betygsatt Lanterna. Har det gjort det tar du bort betyget i Play-butiken först.
- Klara ett Test med minst 70 %. Google-rutan ska då komma upp över resultatsidan, ungefär en sekund efter sista frågan.
- Fungerar det, flyttar du samma version till Production (Promote release).
- I den publicerade appen bestämmer Google själv om rutan visas. Ofta händer ingenting, och det är normalt.
