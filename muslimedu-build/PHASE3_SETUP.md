# MuslimEdu — Phase 3, Build via GitHub Actions (No Emulator)

This zip is your whole repo content. GitHub builds the app for you in the cloud —
you never run `react-native run-android` locally.

## Step 1 — Push this to a fresh GitHub repo

If you don't already have a clean repo for this:

```bash
mkdir -p /workspaces/MuslimEduBuild
cd /workspaces/MuslimEduBuild
git init
git remote add origin YOUR_GITHUB_REPO_URL_HERE
```

Extract this zip's contents (App.tsx, src/, .github/) directly into that folder,
then:

```bash
git add .
git commit -m "Phase 3: login screen"
git push -u origin main
```

If you already have a repo from before, just copy `App.tsx`, `src/`, and
`.github/workflows/build-apk.yml` into it (overwriting old versions), commit,
and push the same way.

## Step 2 — Let GitHub Actions build it

Go to your repo on GitHub → the **Actions** tab. You'll see "Build MuslimEdu APK"
running automatically after the push. It:

1. Creates a fresh, correctly-scaffolded React Native project
2. Copies in your login screen, auth logic, and icon
3. Installs all needed packages
4. Builds a real Android APK
5. Uploads it as a downloadable file

This takes a few minutes. No local Android SDK, no emulator, no `run-android`.

## Step 3 — Download and install the APK

Once the run finishes (green checkmark), open that workflow run, scroll to
**Artifacts**, and download `muslimedu-debug-apk`. It's a zip containing
`app-debug.apk` — download that to your phone and open it to install
(you may need to allow "install unknown apps" for your browser/files app once).

## What to check on your phone

- Login screen renders: white background, green icon, emerald "Sign In" button
- Log in with a real account → placeholder screen showing your name + role
- Wrong password → red error text
- Close and reopen the app → still logged in
- "Log out" → back to login screen

If the Actions run fails (red X), open it, copy the error text from the failed
step, and send it here — I'll fix it.
