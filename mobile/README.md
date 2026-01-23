# Momentum Mobile (React Native)

This is the native iOS + Android client for Momentum.

## Dev prerequisites (Windows)

- Node.js LTS
- Android Studio (for Android emulator) or a physical Android device
- Expo CLI is used via `npx expo` (no global install required)

## Configure API base URL

Edit `app.json` → `expo.extra.apiBaseUrl`.

Common values:

- Android emulator → `http://10.0.2.2:8080`
- Physical device on same Wi‑Fi → `http://<YOUR_PC_LAN_IP>:8080`

## Run

From this folder:

- `npm install`
- `npm run start`
- Press `a` to open Android

## iOS on Windows

You can’t run the iOS simulator on Windows.

Options:

- Use Expo Go on a real iPhone for development
- Use EAS Build (cloud) to generate iOS builds

## Next parity work

- Replace placeholder fields in screens with real response types
- Add screens for Settings, Edit Workout, Avatar upload
- Add charting parity for Dashboard
