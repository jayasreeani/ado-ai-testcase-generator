# Deploy AI Backend to Azure App Service

This guide deploys the Node.js API to **Azure App Service** using **GitHub Actions**.

## Architecture

```
Azure DevOps Extension  →  https://YOUR-APP.azurewebsites.net  →  Azure OpenAI
```

---

## Part 1: Create Azure resources (Portal)

### 1. Create Azure OpenAI (if you don't have one)

1. [Azure Portal](https://portal.azure.com) → **Create a resource**
2. Search **Azure OpenAI** → **Create**
3. After deploy: **Keys and Endpoint** → copy **Endpoint** and **Key**
4. **Model deployments** → deploy model **gpt-4o** (note deployment name)

### 2. Create App Service

1. **Create a resource** → **Web App**
2. Settings:
   - **Name:** e.g. `gogym-ai-testcase-api` (must be globally unique)
   - **Publish:** Code
   - **Runtime:** Node 22 LTS
   - **OS:** Linux (recommended) or Windows
   - **Region:** same as OpenAI if possible
3. **Create**

Your API URL will be:

`https://gogym-ai-testcase-api.azurewebsites.net`

---

## Part 2: Configure App Service environment variables

1. Open your Web App → **Settings** → **Environment variables**
2. Add **Application settings**:

| Name | Value |
|------|--------|
| `AI_PROVIDER` | `azure-openai` |
| `AZURE_OPENAI_ENDPOINT` | `https://YOUR-RESOURCE.openai.azure.com` |
| `AZURE_OPENAI_API_KEY` | your Azure OpenAI key |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` (your deployment name) |
| `ALLOWED_ORIGINS` | `https://dev.azure.com` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `false` |

3. **Save** → allow restart

---

## Part 3: Connect GitHub Actions

### 1. Download publish profile

1. Web App → **Overview** → **Download publish profile**
2. Open the `.PublishSettings` file in a text editor → copy all XML

### 2. Add GitHub secrets

Repo: `https://github.com/jayasreeani/ado-ai-testcase-generator`

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret name | Value |
|-------------|--------|
| `AZURE_WEBAPP_NAME` | `gogym-ai-testcase-api` (your app name) |
| `AZURE_WEBAPP_PUBLISH_PROFILE` | entire publish profile XML |

---

## Part 4: Deploy

### Automatic

Push changes under `backend/` to `main` — workflow **Deploy AI Backend to Azure** runs.

### Manual

1. GitHub → **Actions** → **Deploy AI Backend to Azure**
2. **Run workflow**

---

## Part 5: Verify

Open in browser:

```
https://gogym-ai-testcase-api.azurewebsites.net/health
```

Expected:

```json
{ "status": "ok", "provider": "azure-openai" }
```

---

## Part 6: Use in the extension

In Azure DevOps User Story → **AI Test Cases** tab:

**AI backend API URL:**

```
https://gogym-ai-testcase-api.azurewebsites.net
```

(No trailing slash)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| 500 on generate | Check Azure OpenAI env vars in App Service |
| CORS error in extension | Set `ALLOWED_ORIGINS` to `https://dev.azure.com` |
| Deploy fails | Verify `AZURE_WEBAPP_NAME` and publish profile secret |
| App won't start | App Service → **Log stream** → check for errors |
| Corporate network | GitHub Actions deploys in cloud — no local npm needed |

---

## Optional: OpenAI instead of Azure OpenAI

Set in App Service:

| Name | Value |
|------|--------|
| `AI_PROVIDER` | `openai` |
| `OPENAI_API_KEY` | your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o` |

Remove or leave unused Azure OpenAI vars.
