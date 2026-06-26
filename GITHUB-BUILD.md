# Push to GitHub and download the VSIX

Use this guide if `npm install` fails on your work PC due to SSL/certificate issues.

## Step 1: Create a GitHub repository

1. Sign in to [https://github.com](https://github.com)
2. Click **+** → **New repository**
3. Name it e.g. `ado-ai-testcase-generator`
4. Choose **Private** (recommended — contains your extension source)
5. Do **not** add README, .gitignore, or license (project already has them)
6. Click **Create repository**

## Step 2: Push this project from PowerShell

Run these commands one at a time:

```powershell
cd "C:\Users\JayasreeK\OneDrive - Slavic401k\Desktop\ado-ai-testcase-generator"

git add .
git commit -m "Initial commit: AI Test Case Generator extension"

git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ado-ai-testcase-generator.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your GitHub username.

If prompted to sign in, use a **Personal Access Token** (not your password):
- GitHub → **Settings** → **Developer settings** → **Personal access tokens** → generate token with `repo` scope

## Step 3: Run the GitHub Actions build

1. Open your repo on GitHub
2. Go to the **Actions** tab
3. Click **Build ADO Extension VSIX** in the left sidebar
4. Click **Run workflow** → **Run workflow** (green button)

Wait 2–3 minutes for the job to complete (green checkmark).

## Step 4: Download the `.vsix` file

1. Open the completed workflow run
2. Scroll to **Artifacts**
3. Download **GoGym-ai-testcase-generator-vsix**
4. Unzip the download — inside you'll find:

   `GoGym.ai-testcase-generator-0.1.0.vsix`

## Step 5: Upload to Marketplace

1. Go to [https://marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
2. Select publisher **GoGym**
3. **Extensions** → **+ New extension** → **Azure DevOps**
4. Upload `GoGym.ai-testcase-generator-0.1.0.vsix`

## Step 6: Install in your Azure DevOps org

After upload, share/install the extension to your organization from the Marketplace manage page, or:

**Organization Settings** → **Extensions** → find **AI Test Case Generator** → **Get it free** / **Install**

---

## Rebuild after code changes

1. Edit code locally
2. `git add .` → `git commit -m "your message"` → `git push`
3. The workflow runs automatically on push to `main`, or run it manually from **Actions**

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Workflow not visible | Ensure `.github/workflows/build-extension.yml` was pushed |
| Build fails on icon | Confirm `extension/images/icon.png` exists in the repo |
| `git push` rejected | Check remote URL and GitHub token permissions |
| VSIX version unchanged | Bump `"version"` in `extension/vss-extension.json` before rebuilding |
