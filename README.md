# GHPhotoEdit

<p align="center"><img src="branding/logo.svg" alt="GHPhotoEdit folded-ribbons logo" width="140"></p>

A local-first photo editor for Android and the web. Version 0.3.0 is an early preview, not a replacement for Lightroom.

**Open the web app:** https://gokalphizmetleri.github.io/GHPhotoEdit/

## Features

- Open photos without modifying the original file
- Exposure, contrast, highlights, shadows, whites and blacks
- Temperature, tint, vibrance, saturation, clarity and vignette
- Seven looks, free/aspect-ratio crop, 90-degree rotation and straightening
- Reference-photo color and tone matching with adjustable strength
- Undo/redo and press-and-hold comparison of color adjustments
- JPEG/PNG export with JPEG quality and 1080/2048/4000px maximum-side choices
- Explicit device-local saved drafts containing the photo and edit settings
- Named custom presets for use on other photos
- Split before/after slider and eight-range HSL controls
- Soft brush/eraser for a single local exposure/temperature/tint mask
- PWA manifest and offline app-shell caching after the first online visit

- Automatic photo face alignment with a bundled local MediaPipe model (up to3 faces)
- Face-aware skin smoothing and spot softening, lip/blush/eye color
- Automatically aligned sunglasses, cat ears/whiskers, heart eyes and star crown

## Privacy and processing

Photo processing runs on the device. The app does not upload image pixels or require an account, API key or paid service. Face effects use a bundled on-device ML model, not a cloud AI service. Reference matching uses per-channel color statistics. It approximates a look; it cannot recover the original editing settings from another photo. Scene differences affect the result.

The Android package requests internet permission only to check a fixed same-project HTTPS update manifest when the app opens. No image data is sent with that check. The web host receives normal page/asset requests, including the bundled model/runtime on first load. Face engine scripts and connections are restricted to their own origin; Android intercepts its face-engine HTTPS origin and serves bundled files, while blocking other external WebView requests. The upstream runtime notice mentions API metrics; this build blocks off-origin requests and tests recorded only local asset requests. Selected photos stay on the device. Use Library > Save draft before closing to retain a photo and settings. Drafts and custom presets use local IndexedDB storage. They are not uploaded or synced; browser cleanup or uninstalling can remove them. Export important photos separately.

## Getting started

### Web / PWA

Serve the contents of `web/` from one directory on an HTTPS static host. Localhost also works for development. The manifest and service worker must be served from the app's origin. Open the page and use the browser's installation menu when available. Offline use requires a completed first load and service-worker activation.

The GitHub Pages HTTPS deployment, service-worker scope, offline reload/import and browser installability checks have been verified. Physical-device PWA installation has not been tested.

### Android

The preview supports Android 10 or later and uses the installed Android System WebView. Open a photo through the system file picker. Export writes a new JPEG or PNG to `Pictures/GHPhotoEdit`. The preview is debug-signed and requires permission to install from its download source. The Android preview does not include direct camera capture.

The APK builds and its signature verifies. It has not been run on a physical Android device. Emulator testing was blocked by the build environment's CPU capacity, so startup, file-picker integration and gallery saving still need device testing.

## Android update notice

Starting with 0.1.1, opening the app checks `android-update.json` on this project's GitHub Pages site. If a higher compatible versionCode is available, an English "Update available" dialog offers to open the official GitHub release in your browser. It never downloads or installs silently, never sends photos, and does not run while the app is closed. Offline errors and five-second timeouts are ignored so editing can continue.

Existing 0.1.0 installations must be manually updated once to 0.1.1 or later to gain this checker. The package ID and signing certificate match the published 0.1.0 preview. The dialog has not been visually tested on Android; version/URL policy tests and the APK build pass.

## Face tools

Open a photo and choose Faces. Detection runs automatically when that panel is first opened; Find faces retries it. Adjust smoothing, spot softening or makeup strength, and scroll to the playful-effect selector. Effects follow detected source-image landmarks through crop/rotation and exports. Drafts save the landmarks/settings; custom presets do not include face effects. No identity recognition is performed. Existing drafts without face fields remain supported.

Runtime/model assets add about26MB to the first offline cache/download. Allow the first online load and service worker activation to finish before going offline. A failed scan leaves other tools usable. Android file-origin storage is unchanged to preserve existing drafts. The face engine is isolated at an intercepted local-asset HTTPS origin, without granting universal file access. Actual Android WebView/WASM execution remains untested.

Third-party runtime/model licenses and source links are in `web/vendor/THIRD-PARTY-NOTICES.txt` and `web/vendor/LICENSE`. Test portrait images are not redistributed.

## Build Android

Requirements: JDK 17, Gradle 8.7, Android SDK platform 34 and build-tools 34.0.0. The project uses Android Gradle Plugin 8.5.2.

1. Set `sdk.dir` in a local `android/local.properties` file to your Android SDK path.
2. Copy the current web files into `android/app/src/main/assets/` if changing the editor.
3. Run:

```sh
cd android
gradle assembleDebug
```

Output: `app/build/outputs/apk/debug/app-debug.apk`. Gradle creates a local development signing key. No private signing key is included in the source package.

## Current limitations

- No RAW development, multiple masks, healing brush, curves, catalog or cloud sync
- Face effects work on opened photos, not live camera/video. Detection can fail on obscured, very small, side-facing or poorly lit faces. Spot softening is texture reduction, not content-aware healing.
- Exports remove EXIF/GPS metadata. PNG preserves transparency; JPEG flattens it against black
- Export is capped at the device's WebGL limits or 4000 pixels, whichever is smaller
- Large input images may exceed available memory
- Straightening may leave empty corners; crop them out manually
- Hold-to-compare disables color adjustments, not crop/rotation
- Color matching is statistical, not AI and not exact preset extraction
- Draft saving is manual, not autosave. Drafts are separate snapshots and remain device-local; no portable project format or background export
- Custom presets exclude crop and mask geometry; their brush strength only affects an existing painted mask
- Brush mask is a fixed 512x512 soft mask in source-image coordinates; it is not an edge-aware selection

## Verification

Chromium tests passed for file import, sliders, undo/redo, looks, square cropping, JPEG download, offline reload/import, reference import, matching strength and effect removal. The earlier preview reproduced source RGB exactly in a 1600x1000 baseline test. New browser tests cover saved draft/preset reload, selective HSL pixels, brush undo/redo, rotated/cropped brush persistence, brush-result pixel alignment at all four 90-degree rotations with 13-degree straightening, and transparent PNG/JPEG exports. Layouts were visually checked at 320, 390 and 1280 pixels. These browser checks do not establish Android device compatibility.

## Branding and publication

The folded-ribbons logo was approved for GHPhotoEdit. The web app is published on GitHub Pages. No trademark clearance has been performed. No license for third-party reuse of the application source has been selected yet.

### Re-run browser checks

Install Node.js, Playwright (`npm install playwright`) and Chromium/Google Chrome. From `web/`, run `node ../tests/test-six.cjs`, `node ../tests/test-six-deep.cjs` and `node ../tests/test-final.cjs`. Scripts use `/usr/bin/google-chrome` and write diagnostic screenshots/exports to `/downloads` and `/tmp`; adjust those paths for your machine. The final test checks brush alignment and PNG/JPEG alpha behavior. These are browser tests, not Android device tests.

Face browser tests in `tests/test-faces*.cjs` additionally need a local (not distributed) `web/testdata/portrait.jpg` portrait fixture. They cover automatic landmark inference, two faces, no face, save/reload, offline fresh inference, compare pixels, old drafts, four crop/rotation/straightening transforms, alpha and missing-model fallback. Origin-split simulation is a Chromium approximation, not an Android device test.
