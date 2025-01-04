# TicTacToe Multiplayer

TicTacToe Multiplayer er en nettside som lar to spillere spille Tic-Tac-Toe mot hverandre fra forskjellige enheter. Applikasjonen har funksjonalitet for å opprette og bli med i rom, samt å holde oversikt over online spillere.

## Funksjonalitet

- **Opprett rom**: Generer et unikt rom-ID som spillere kan bruke til å bli med.
- **Bli med i rom**: Tast inn rom-ID for å spille mot en annen spiller.
- **Online status**: Hold oversikt over antall spillere som er online.
- **Spill i sanntid**: Oppdateringer i spillet skjer i sanntid ved hjelp av WebSockets.
- **Autentisering**: Logg inn for å få oversikt over brukerdata.

## Teknologier brukt

- **Frontend**: Next.js (TypeScript), Tailwind CSS.
- **Backend**: Express.js, Socket.IO.
- **Database**: Supabase med Postgres database.
- **WebSockets**: Real-time kommunikasjon med Socket.IO.
- **Autentisering**: Støtte for brukerlogin og autentisering.

## Deployments

Frontend og backend er hostet separat på Vercel og Railway:
- **Frontend**: [tic-tac-toe-omega-liart.vercel.app](https://tic-tac-toe-omega-liart.vercel.app/)
- **Backend**: [websocketserver-production-5f0d.up.railway.app](https://websocketserver-production-5f0d.up.railway.app/)