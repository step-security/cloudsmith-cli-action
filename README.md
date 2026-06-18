[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# Cloudsmith CLI Install Action

This GitHub Action installs the Cloudsmith CLI and pre-authenticates it using OIDC or API Key. 🚀

> **⚠️ Notice:** If you are running on self-hosted runners, Python version 3.9 or higher is required. Please ensure your runner meets this requirement to avoid any issues. We recommend using [setup-python](https://github.com/actions/setup-python) action for installing Python. 🐍


## Inputs

### Authentication & Installation

| Input                  | Description | Required | Default |
|------------------------|-------------|----------|---------|
| `cli-version` | Specific version of the Cloudsmith CLI to install | No | Latest |
| `api-key` | API Key for Cloudsmith authentication | No | - |
| `oidc-namespace` | Cloudsmith organisation/namespace for OIDC | No | - |
| `oidc-service-slug` | Cloudsmith service account slug for OIDC | No | - |
| `oidc-auth-only` | Only perform OIDC authentication without installing the CLI | No | `false` |
| `oidc-auth-retry` | Number of retry attempts for OIDC authentication (0-10), 5 seconds delay between retries | No | `3` |
| `oidc-audience` | Audience to request when retrieving the GitHub OIDC token. Defaults to `https://github.com/{org-name}` using GITHUB_REPOSITORY_OWNER. You can override with a custom value like `api://AzureADTokenExchange` if needed. | No | `https://github.com/{org-name}` (dynamic) |
| `pip-install` | Install the Cloudsmith CLI via pip | No | - |
| `executable-path` | Path to the Cloudsmith CLI executable | No | `GITHUB_WORKSPACE/bin/` |

### CLI Configuration

See [CLI configuration documentation](https://github.com/cloudsmith-io/cloudsmith-cli?tab=readme-ov-file#non-credentials-configini) for more details.

| Input                  | Description | Required | Default |
|------------------------|-------------|----------|---------|
| `api-host` | API Host for Cloudsmith | No | - |
| `api-proxy` | API Proxy for Cloudsmith | No | - |
| `api-ssl-verify` | Verify SSL certificates for Cloudsmith API | No | - |
| `api-user-agent` | User Agent for Cloudsmith API | No | - | 

## Example Usage with OIDC

Cloudsmith OIDC [documentation](https://docs.cloudsmith.com/authentication/openid-connect)

```yaml
uses: step-security/cloudsmith-cli-action@v2
with:
  oidc-namespace: 'your-oidc-namespace'
  oidc-service-slug: 'your-service-account-slug'
```

## Example Usage with API Key

Personal API Key can be found [here](https://cloudsmith.io/user/settings/api/). For CI-CD deployments we recommend using [Service Accounts](https://docs.cloudsmith.com/accounts-and-teams/service-accounts).

```yaml
uses: step-security/cloudsmith-cli-action@v2
with:
  api-key: 'your-api-key'
```

## Example Usage with OIDC Authentication Only

If you only need to authenticate with Cloudsmith's API without installing the CLI:

```yaml
uses: step-security/cloudsmith-cli-action@v2
with:
  oidc-namespace: 'your-oidc-namespace'
  oidc-service-slug: 'your-service-account-slug'
  oidc-auth-only: 'true'
```

This will:
- Perform OIDC authentication
- Set the OIDC token as `CLOUDSMITH_API_KEY` environment variable
- Skip CLI installation

## Cloudsmith CLI Commands

Full CLI feature list can be found [here](https://github.com/cloudsmith-io/cloudsmith-cli?tab=readme-ov-file#features)


### Publish a package

For all supported package formats and upload commands please visit our [Supported Formats](https://docs.cloudsmith.com/formats) page.

```yaml
name: Publish Python Package

on:
  push:
    branches:
      - main
permissions:
  id-token: write
  contents: read
jobs:
  publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v6

      - name: Install Cloudsmith CLI
        uses: step-security/cloudsmith-cli-action@v2
        with:
          oidc-namespace: 'your-oidc-namespace'
          oidc-service-slug: 'your-service-account-slug'

      - name: Push package to Cloudsmith
        run: |
          cloudsmith push python your-namespace/your-repository dist/*.tar.gz
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 📄
