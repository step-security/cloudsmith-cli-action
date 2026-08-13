[![StepSecurity Maintained Action](https://raw.githubusercontent.com/step-security/maintained-actions-assets/main/assets/maintained-action-banner.png)](https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions)

# Cloudsmith CLI Install Action

This GitHub Action installs the standalone Cloudsmith CLI, configures it on the PATH, and establishes authentication for subsequent workflow steps. No Python or Node.js required. 🚀

## Key Features

The action supports two authentication approaches:

1. **OIDC (Recommended)**: Uses short-lived credentials by exchanging GitHub OIDC tokens. Requires `id-token: write` permission and a Cloudsmith service account configured with an OIDC provider.

2. **API Key**: Accepts stored credentials passed as GitHub Actions secrets, particularly recommended for service accounts rather than personal keys.

## Platform Support

Linux, macOS, and Windows runners on x86-64 and ARM64 (Linux and macOS).

## Inputs

### Authentication & Installation

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `cli-version` | Cloudsmith CLI version to install, e.g. `'1.20.0'`, or `'latest'` | No | `latest` |
| `install-directory` | Root directory for versioned CLI installations | No | `RUNNER_TEMP/cloudsmith-cli` |
| `api-key` | API Key for Cloudsmith authentication | No | - |
| `oidc-namespace` | Cloudsmith organisation/namespace for OIDC | No | - |
| `oidc-service-slug` | Cloudsmith service account slug for OIDC | No | - |
| `oidc-audience` | Audience to request when retrieving the GitHub OIDC token. Defaults to `https://github.com/{org-name}` | No | `https://github.com/{org-name}` (dynamic) |
| `verify-auth` | Run `cloudsmith whoami` after setup to verify authentication | No | `false` |
| `export-auth-token` | Resolve credentials via `cloudsmith credential-helper generic` and export as `CLOUDSMITH_API_KEY` / `CLOUDSMITH_USERNAME`. Requires CLI 1.21.0+. | No | `false` |
| `oidc-auth-only` | Deprecated alias for `export-auth-token` | No | `false` |

### CLI Configuration

See [CLI configuration documentation](https://github.com/cloudsmith-io/cloudsmith-cli?tab=readme-ov-file#non-credentials-configini) for more details.

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `api-host` | API Host for Cloudsmith | No | - |
| `api-proxy` | API Proxy for Cloudsmith | No | - |
| `api-ssl-verify` | Verify SSL certificates for Cloudsmith API: `true`, `false`, or empty | No | - |
| `api-user-agent` | User Agent for Cloudsmith API | No | - |

## Outputs

| Output | Description |
|--------|-------------|
| `cli-version` | Resolved Cloudsmith CLI version |
| `target` | Resolved standalone binary target, e.g. `linux-x86_64-gnu` |
| `cli-path` | Absolute path to the Cloudsmith CLI executable |
| `bin-directory` | Directory added to PATH |
| `oidc-token` | Effective authentication token when `export-auth-token` is enabled (masked) |

## Example Usage with OIDC

Cloudsmith OIDC [documentation](https://docs.cloudsmith.com/authentication/openid-connect)

```yaml
uses: step-security/cloudsmith-cli-action@v3
with:
  oidc-namespace: 'your-oidc-namespace'
  oidc-service-slug: 'your-service-account-slug'
```

## Example Usage with API Key

Personal API Key can be found [here](https://cloudsmith.io/user/settings/api/). For CI-CD deployments we recommend using [Service Accounts](https://docs.cloudsmith.com/accounts-and-teams/service-accounts).

```yaml
uses: step-security/cloudsmith-cli-action@v3
with:
  api-key: 'your-api-key'
```

## Example Usage with export-auth-token

If you need the resolved token exported as an environment variable for downstream steps (e.g. for use with package managers):

```yaml
uses: step-security/cloudsmith-cli-action@v3
with:
  oidc-namespace: 'your-oidc-namespace'
  oidc-service-slug: 'your-service-account-slug'
  export-auth-token: 'true'
```

This will:
- Perform OIDC authentication via the CLI credential-helper
- Set `CLOUDSMITH_API_KEY` and `CLOUDSMITH_USERNAME` environment variables
- Export the resolved token as the `oidc-token` action output

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
        uses: actions/checkout@v4

      - name: Install Cloudsmith CLI
        uses: step-security/cloudsmith-cli-action@v3
        with:
          oidc-namespace: 'your-oidc-namespace'
          oidc-service-slug: 'your-service-account-slug'

      - name: Push package to Cloudsmith
        run: |
          cloudsmith push python your-namespace/your-repository dist/*.tar.gz
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 📄
