# GHPhotoEdit

<p align="center"><img src="branding/logo.svg" alt="GHPhotoEdit folded-ribbons logo" width="140"></p>

A local-first photo editor for Android and the web. Version 0.1.1 is an early preview, not a replacement for Lightroom.

**Open the web app:** https://gokalphizmetleri.github.io/GHPhotoEdit/

## Features

- Open photos without modifying the original file
- Exposure, contrast, highlights, shadows, whites and blacks
- Temperature, tint, vibrance, saturation, clarity and vignette
- Seven looks, free/aspect-ratio crop, 90-degree rotation and straightening
- Reference-photo color and tone matching with adjustable strength
- Undo/redo and press-and-hold comparison of color adjustments
- JPEG export at 92% quality, up to 4000 pixels on the longest side
- PWA manifest and offline app-shell caching after the first online visit

## Privacy and processing

Photo processing runs on the device. The app does not upload image pixels or require an account, API key, AI model or paid service. Reference matching uses per-channel color statistics. It approximates a look; it cannot recover the original editing settings from another photo. Scene differences affect the result.

The Android package requests internet permission only to check a fixed same-project HTTPS update manifest when the app opens. No image data is sent with that check. The web host receives normal page/asset requests, but the app does not send selected photos to it. Editing sessions are not saved when the page closes.

## Getting started

### Web / PWA

Serve the contents of `web/` from one directory on an HTTPS static host. Localhost also works for development. The manifest and service worker must be served from the app's origin. Open the page and use the browser's installation menu when available. Offline use requires a completed first load and service-worker activation.

The GitHub Pages HTTPS deployment, service-worker scope, offline reload/import and browser installability checks have been verified. Physical-device PWA installation has not been tested.

### Android

The preview supports Android 10 or later and uses the installed Android System WebView. Open a photo through the system file picker. Export writes a new JPEG to `Pictures/GHPhotoEdit`. The preview is debug-signed and requires permission to install from its download source. The Android preview does not include direct camera capture.

The APK builds and its signature verifies. It has not been run on a physical Android device. Emulator testing was blocked by the build environment's CPU capacity, so startup, file-picker integration and gallery saving still need device testing.

## Android update notice

Starting with 0.1.1, opening the app checks `android-update.json` on this project's GitHub Pages site. If a higher compatible versionCode is available, an English "Update available" dialog offers to open the official GitHub release in your browser. It never downloads or installs silently, never sends photos, and does not run while the app is closed. Offline errors and five-second timeouts are ignored so editing can continue.

Existing 0.1.0 installations must be manually updated once to 0.1.1 to gain this checker. The package ID and signing certificate match the published 0.1.0 preview. The dialog has not been visually tested on Android; version/URL policy tests and the APK build pass.

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

- No RAW development, masks, healing brush, curves, catalog or cloud sync
- Face effects are not included in this preview; their intended category is still undecided
- JPEG output removes EXIF/GPS metadata and does not preserve transparency
- Export is capped at the device's WebGL limits or 4000 pixels, whichever is smaller
- Large input images may exceed available memory
- Straightening may leave empty corners; crop them out manually
- Hold-to-compare disables color adjustments, not crop/rotation
- Color matching is statistical, not AI and not exact preset extraction
- No durable editing-project save or background export

## Verification

Chromium tests passed for file import, sliders, undo/redo, looks, square cropping, JPEG download, offline reload/import, reference import, matching strength and effect removal. Default settings reproduce the source's RGB pixels exactly in a 1600x1000 test. Layouts were visually checked at 320, 390 and 1280 pixels. These browser checks do not establish Android device compatibility.

## Branding and publication

The folded-ribbons logo was approved for GHPhotoEdit. The web app is published on GitHub Pages. No trademark clearance has been performed. No license for third-party reuse of the application source has been selected yet.
