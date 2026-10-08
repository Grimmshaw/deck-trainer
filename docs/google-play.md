# Lanterna på Google Play – checklista och texter

Allt som behövs i Play Console, i den ordning du gör det. Texterna för butiken står på engelska, så att de kan klistras in direkt.

---

## 1. Egen adress: app.lanternakonsult.se

**Netlify**
1. Gå till ditt projekt → **Domain management** → **Add a domain**.
2. Skriv `app.lanternakonsult.se` och bekräfta.
3. Netlify föreslår att du flyttar DNS till Netlify. Välj i stället att behålla DNS hos Loopia ("external DNS").

**Loopia**
1. Gå till DNS-editorn för lanternakonsult.se och lägg till subdomänen `app`.
2. Lägg till en post av typen **CNAME** för `app` med värdet `deck-trainer-demo.netlify.app.` (punkten på slutet ska vara med).
3. Vänta tills Netlify visar en grön bock och "HTTPS certificate" är klart. Det brukar ta 5–60 minuter.

Den gamla adressen deck-trainer-demo.netlify.app fortsätter att fungera.

---

## 2. Skapa appen i Play Console

**Create app**
- App name: Lanterna
- Default language: English (United Kingdom)
- App or game: App
- Free or paid: **Free** (köpet görs inne i appen)

### Store listing (Grow → Store presence → Main store listing)

**App name** (max 30 tecken)
```
Lanterna – COLREG, IALA, Morse
```

**Short description** (max 80 tecken)
```
Study COLREGs, lights, buoyage, Morse and signals for your deck officer exams.
```

**Full description**
```
Lanterna is a study app made by a serving chief officer for deck officer cadets and anyone preparing for a watchkeeping certificate.

Instead of reading the rules over and over, you practise them the way you will use them on the bridge: real-looking pictures of vessels, buoys and lights, by day and by night, in varied scenery – never the same picture twice.

WHAT YOU CAN STUDY
• Morse code – read and send, as with signals by light (free)
• Lights & shapes – identify vessels by their lights at night and their shapes by day (COLREG Rules 21–31)
• COLREGs – "what do you do?" situations, crossing, head-on, overtaking and restricted visibility on radar
• IALA buoyage – lateral, cardinal and other marks in Region A and B, and light characters you time with a stopwatch
• Sound signals – manoeuvring, warning and fog signals, with sound or as pictures
• Flags & signals – the single-letter signals of the International Code
• Distress signals – COLREG Annex IV and GMDSS basics
• Chart symbols – wrecks, rocks, lights and abbreviations from INT 1
• Final exam – everything mixed, on time

HOW YOU STUDY
• Learn with flashcards, practise with explanations after every answer, or take a timed test
• "My mistakes" brings back what you got wrong until you know it
• Match pairs for quick repetition
• Works offline – study at sea without a connection
• Light and dark theme that follows your phone
• Choose your region (IALA A or B)

ONE PAYMENT, NO SUBSCRIPTION
Morse code is free. Everything else is unlocked with a single in-app purchase – no subscription, no ads, no account and no tracking.

Every question comes with the rule it is based on. Found something that looks wrong? Report it straight from the question.
```

**Graphics**
- App icon: `icon-512.png` (från projektmappen, public/)
- Feature graphic: `play-feature-graphic.png` (1024 × 500)
- Phone screenshots: `play-1.png` … `play-6.png` (1080 × 1920)

**Kategori och kontakt** (Store settings)
- Category: **Education**
- Tags: Education, Reference
- Email: robin_rantala@lanternakonsult.se
- Website: https://app.lanternakonsult.se

---

## 3. App content (Policy → App content)

| Formulär | Svar |
|---|---|
| **Privacy policy** | https://app.lanternakonsult.se/privacy.html |
| **Ads** | No, my app does not contain ads |
| **App access** | All functionality is available without special access |
| **Content rating** | Category: Reference, News, or Educational. Svara **No** på våld, sex, svordomar, droger, spel om pengar, kontakt mellan användare och delning av plats. Svara **Yes** på köp av digitala varor. Det ger troligen PEGI 3 / Everyone. |
| **Target audience** | 16–17 och 18+ (inte barn). Appen riktar sig inte till barn. |
| **News app** | No |
| **Government app** | No |
| **Financial features** | None |
| **Health** | None |

### Data safety (förslag – kontrollera mot formuläret)

- **Does your app collect or share any of the required user data types?** Yes, eftersom problemrapporter kan skickas.
- **Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS).
- **Do you provide a way for users to request that their data is deleted?** Yes, via mejl till robin_rantala@lanternakonsult.se.

**Data types:**
- *App activity → Other user-generated content* (texten i en problemrapport)
  - Collected: Yes. Shared: No.
  - Optional: Yes (användaren väljer själv att skicka).
  - Purpose: App functionality.
- *Purchase history:* Google Play sköter köpet. Vår server kontrollerar bara köpet mot Google och sparar ingenting, så det räknas som tillfällig behandling och behöver normalt inte deklareras.

Inga andra datatyper: ingen plats, inga kontakter, inga identifierare och ingen analys.

---

## 4. Engångsköpet

1. **Monetise → Payments profile**: koppla en betalprofil till Lanterna Konsult AB (bankkonto och moms).
2. **Monetise → Products → In-app products → Create product**:
   - Product ID: `lanterna_full` (exakt så, det står i koden)
   - Name: Lanterna – full version
   - Description: Unlocks all categories and the final exam. One payment, no subscription.
   - Default price: **9.90 EUR**. Låt Google räkna fram de andra länderna och justera sedan, till exempel SEK 99, USD 9.99 och PHP lägre.
   - Activate.

### Servern som kontrollerar köpen (görs en gång)

Google återbetalar köp som inte bekräftas inom tre dagar. Därför finns funktionen `netlify/functions/verify-purchase.mts`, som kontrollerar och bekräftar köpet hos Google. Den behöver en nyckel:

1. Skapa ett projekt i **Google Cloud Console** (console.cloud.google.com), till exempel "lanterna".
2. Aktivera **Google Play Android Developer API**.
3. Gå till **IAM → Service accounts → Create**, till exempel med namnet "lanterna-billing".
4. Öppna kontot → **Keys → Add key → JSON**. En fil laddas ner. Spara den säkert och dela den aldrig.
5. Gå till **Play Console → Users and permissions → Invite new users**:
   - Lägg in service-kontots e-postadress.
   - Ge appen behörigheten "View financial data" och "Manage orders and subscriptions".
6. Gå till **Netlify → Project configuration → Environment variables** och lägg till:
   - `GOOGLE_SERVICE_ACCOUNT`: hela innehållet i JSON-filen. Markera den som secret.
   - `PLAY_PACKAGE_NAME`: `se.lanternakonsult.lanterna`

---

## 5. Paketera och ladda upp (PWABuilder)

1. Gå till https://www.pwabuilder.com och skriv `https://app.lanternakonsult.se`.
2. Välj **Package for stores → Android → Generate**, med dessa inställningar:
   - Package ID: `se.lanternakonsult.lanterna`
   - App name: Lanterna. Short name: Lanterna.
   - Version: 1.0.0 (version code 1)
   - Signing key: **Create new**. Spara den nerladdade zip-filen på minst två säkra ställen. Utan signeringsnyckeln kan du aldrig uppdatera appen.
   - Under **All settings**, slå på **Google Play Billing**.
3. Zip-filen innehåller en `.aab`-fil och `assetlinks.json`.
4. I Play Console: **Testing → Internal testing → Create release** och ladda upp `.aab`-filen. Låt Google sköta signeringen (Play App Signing).
5. Under **Setup → App signing** finns ett fingeravtryck (SHA-256). Skicka det till mig, så lägger jag in det i `public/.well-known/assetlinks.json`. Det gör att appen öppnas utan adressfält.
6. Lägg till dig själv och några kollegor som testare med deras Gmail-adresser och öppna testlänken på mobilen.

**När du är nöjd:** Production → Create release → samma `.aab` → Send for review. Organisationskonton behöver inte köra den slutna testperioden på 14 dagar.

**Promokoder** (gratis upplåsning för granskare och betatestare): Monetise → Promo codes.

---

## 6. Slå på betalväggen vid lansering

I `src/store/entitlement.ts` ändras `PAYWALL_ON = false` till `true` när appen ligger ute på Google Play. Fram till dess är allt öppet för betatestarna, både på webben och i appen.
