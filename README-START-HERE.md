# CA Tutor: free setup, no coding needed

You need only a Google account, a GitHub account and a Vercel account. All free.

## Step 1: Get a free AI key (2 minutes)
1. Open https://aistudio.google.com and sign in with Google.
2. Click "Get API key", then "Create API key". Copy it and keep it private.

## Step 2: Put the files on GitHub (5 minutes)
1. Unzip this folder on your phone or computer.
2. Sign up at https://github.com. Click "New repository", name it ca-tutor, keep it Public, then Create.
3. Click "uploading an existing file". Drag in ALL files, including the "api" folder, then click "Commit changes".
   (Check that api/chat.js shows up inside an api folder.)

## Step 3: Publish with Vercel (3 minutes)
1. Go to https://vercel.com and sign up with GitHub.
2. Click "Add New", then "Project", and import ca-tutor.
3. Open "Environment Variables". Name: GEMINI_API_KEY. Value: the key from Step 1. Click Add.
4. Click Deploy. You get a link like ca-tutor.vercel.app.

## Step 4: Install it on your phone
Open the link in Chrome, tap the menu (three dots), then "Add to Home screen" or "Install app".
On iPhone use Safari, tap Share, then "Add to Home Screen".

## If something goes wrong
- "Model name not found": in Vercel go to Settings, then Environment Variables, and add GEMINI_MODEL with a current model name from Google AI Studio. Then Redeploy.
- "Free daily limit reached": the free plan has daily limits. Wait and try again.
- Changed a variable? Vercel needs a Redeploy (Deployments, then the three dots, then Redeploy).
- Google's free tier may use submitted text to improve its products. Tell students not to type personal details.
