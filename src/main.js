const core = require("@actions/core");
const oidcAuth = require("./oidc-auth");
const { installCli } = require("./download-cli");
const { createConfigFile } = require("./create-config-file");
const axios = require("axios");
const fs = require("fs");

async function validateSubscription() {
  let repoPrivate;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath && fs.existsSync(eventPath)) {
    const payload = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    repoPrivate = payload?.repository?.private;
  }

  const upstream = 'cloudsmith-io/cloudsmith-cli-action';
  const action = process.env.GITHUB_ACTION_REPOSITORY;
  const docsUrl = 'https://docs.stepsecurity.io/actions/stepsecurity-maintained-actions';
  core.info('');
  core.info('\u001b[1;36mStepSecurity Maintained Action\u001b[0m');
  core.info(`Secure drop-in replacement for ${upstream}`);
  if (repoPrivate === false) core.info('\u001b[32m\u2713 Free for public repositories\u001b[0m');
  core.info(`\u001b[36mLearn more:\u001b[0m ${docsUrl}`);
  core.info('');
  if (repoPrivate === false) return;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const body = { action: action || '' };
  if (serverUrl !== 'https://github.com') body.ghes_server = serverUrl;
  try {
    await axios.post(
      `https://agent.api.stepsecurity.io/v1/github/${process.env.GITHUB_REPOSITORY}/actions/maintained-actions-subscription`,
      body, { timeout: 3000 }
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      core.error(`\u001b[1;31mThis action requires a StepSecurity subscription for private repositories.\u001b[0m`);
      core.error(`\u001b[31mLearn how to enable a subscription: ${docsUrl}\u001b[0m`);
      process.exit(1);
    }
    core.info('Timeout or API not reachable. Continuing to next step.');
  }
}

async function run() {
  try {
    await validateSubscription();
    // Get inputs from GitHub Actions workflow
    const orgName = core.getInput("oidc-namespace");
    const serviceAccountSlug = core.getInput("oidc-service-slug");
    const apiKey = core.getInput("api-key");
    const oidcAuthRetry = Math.min(
      Math.max(parseInt(core.getInput("oidc-auth-retry") || "3", 10), 0),
      10,
    );
    const oidcTokenValidate = core.getBooleanInput("oidc-token-validate");
  const oidcAudienceInput = core.getInput("oidc-audience");
  const oidcAudience = oidcAudienceInput || `https://github.com/${process.env.GITHUB_REPOSITORY_OWNER || ''}`;

    // Cloudsmith CLI optional inputs
    const apiHost = core.getInput("api-host");
    const apiProxy = core.getInput("api-proxy");
    const apiSslVerify = core.getInput("api-ssl-verify");
    const apiUserAgent = core.getInput("api-user-agent");

    // Create config file for Cloudsmith CLI only if any of the optional inputs are provided
    if (apiHost || apiProxy || apiSslVerify || apiUserAgent) {
      createConfigFile(apiHost, apiProxy, apiSslVerify, apiUserAgent);
    }

    // Authenticate based on the provided inputs
    if (apiKey) {
      core.setSecret(apiKey);
      core.exportVariable("CLOUDSMITH_API_KEY", apiKey);
      core.info("Using provided API key for authentication.");
    } else if (orgName && serviceAccountSlug) {
      if (!process.env.ACTIONS_ID_TOKEN_REQUEST_URL) {
        throw new Error(
          "Environment variable ACTIONS_ID_TOKEN_REQUEST_URL is not set. Did you add the permission 'id-token: write' to your workflow?",
        );
      }

      await oidcAuth.authenticate(
        orgName,
        serviceAccountSlug,
        apiHost,
        oidcAuthRetry,
        oidcTokenValidate,
        oidcAudience,
      );
    } else {
      throw new Error(
        "Either API key or OIDC inputs (namespace and service account slug) must be provided for authentication.",
      );
    }

    // Install the CLI only if oidc-auth-only is false
    const oidcAuthOnly = core.getBooleanInput("oidc-auth-only");
    if (!oidcAuthOnly) {
      await installCli();
    }
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
}

run();
