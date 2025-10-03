// JS object equivalent of generic-onboarding.blueprint.toml
// This mirrors how TOML is parsed by smol-toml into plain JS values.

export const blueprint = {
  schema_version: "1.0",
  version: "1.0.0",
  name: "Generic Product Onboarding",
  provider: "example-provider",
  description:
    "Guided onboarding to capture identifiers, set redirects, and install SDK or generate an AI integration prompt.",
  preview: {
    enabled: true,
    title: "Onboard to Your Product",
    estimated_time: "10-15 minutes",
    steps: [
      "Create account or login",
      "Capture identifiers and API credentials",
      "Configure redirect/callback",
      "Install SDK or generate integration prompt",
    ],
  },
  auth: {
    login_url: "https://auth.example.com/login",
    signup_url: "https://auth.example.com/signup",
    callback_path: "/auth/callback",
  },
  variables: {
    environment_id: {
      description: "Environment identifier from dashboard (e.g., env_123456)",
      required: true,
      sensitive: false,
      validation: "^env_[0-9]+$",
    },
    environment_url: {
      description: "Environment base URL (from API settings)",
      required: true,
      sensitive: false,
    },
    client_id: {
      description: "Client ID from API credentials",
      required: true,
      sensitive: false,
    },
    client_secret: {
      description: "Client Secret from API credentials",
      required: true,
      sensitive: true,
    },
  },
  output: {
    storage_path: "~/.config/hacksmith",
    config_filename: "onboarding.config.json",
    credentials_filename: "credentials.secrets.json",
    mission_brief_filename: "mission-brief.txt",
    contextifact_filename: "contextifact.txt",
  },
  security: {
    encrypt_credentials: false,
    credential_expiry_days: 0,
    require_confirmation_for_sensitive: true,
  },
  context: {
    documentation: {
      primary_docs: "https://docs.example.com",
      quickstart_guide: "https://docs.example.com/quickstart",
      api_reference: "https://docs.example.com/api",
      sso_guide: "https://docs.example.com/sso",
    },
    community: {
      discord: "https://discord.gg/example",
      support_email: "support@example.com",
    },
    github_samples: {
      main_repo: "https://github.com/example/product",
      examples_repo: "https://github.com/example/examples",
      sample_apps: ["https://github.com/example/sample-app-1"],
    },
    swagger_spec: {
      api_spec_url: "https://api.example.com/openapi.json",
      interactive_docs: "https://api.example.com/docs",
      postman_collection: "https://api.example.com/postman.json",
    },
  },
  sdk: {
    preferred_language: "node",
    package_manager: "npm",
    framework_hints: ["node", "python", "go", "nextjs"],
  },
  slugs: {
    base_url: "https://app.example.com",
    dynamic: {
      dashboard: "/ws/environments/{{ environment_id }}/quick-start",
      api_credentials: "/ws/environments/{{ environment_id }}/settings/api-credentials",
      auth_redirects: "/ws/environments/{{ environment_id }}/authentication/redirects",
    },
  },
  contextifact: {
    prompt_template: `
You are helping integrate the Example product without a prebuilt SDK.
Inputs:
- Environment ID: {{ environment_id }}
- Environment URL: {{ environment_url }}
- Client ID: {{ client_id }}
- Client Secret: {{ client_secret }}
Goal: Outline the exact code changes and API calls needed to authenticate
and fetch a minimal resource, with curl and language-agnostic examples.
Include redirect config for {{ auth.callback_path }} if relevant.
`,
  },
  flows: [
    {
      id: "onboarding",
      title: "Generic Product Onboarding",
      steps: [
        {
          id: "welcome",
          type: "info",
          title: "Welcome",
          markdown: `
Follow these steps to capture identifiers and set up the SDK.
If you already have credentials, you can skip ahead.
`,
        },
        {
          id: "auth-info",
          type: "info",
          title: "Create an account or login",
          markdown: `
- Login — {{ auth.login_url }}
- Sign up — {{ auth.signup_url }}
Complete email/OTP/magic link/OAuth and ensure you can access the dashboard.
`,
        },
        {
          id: "open-login",
          type: "navigate",
          title: "Open login page",
          url: "{{ auth.login_url }}",
          instructions: [
            "Enter your email",
            "Complete OTP/magic link/OAuth",
            "Open the dashboard once authenticated",
          ],
        },
        {
          id: "open-dashboard",
          type: "navigate",
          title: "Open dashboard",
          url: "{{ slugs.base_url }}{{ slugs.dynamic.dashboard }}",
          instructions: [
            "Locate your Environment ID on the dashboard (e.g., env_123...)",
          ],
        },
        {
          id: "capture-env-id",
          type: "input",
          title: "Paste Environment ID",
          save_to: "environment_id",
          validate: {
            pattern: "^env_[0-9]+$",
            message: "Must look like env_123456...",
          },
        },
        {
          id: "open-api-creds",
          type: "navigate",
          title: "Open API credentials",
          url: "{{ slugs.base_url }}{{ slugs.dynamic.api_credentials }}",
          instructions: [
            "Copy Client ID, Client Secret, and Environment URL",
          ],
        },
        {
          id: "capture-creds",
          type: "input",
          title: "Paste API credentials",
          inputs: [
            { name: "client_id", sensitive: false },
            { name: "client_secret", sensitive: true },
            { name: "environment_url", sensitive: false },
          ],
        },
        {
          id: "open-redirects",
          type: "navigate",
          title: "Open Authentication Redirects",
          url: "{{ slugs.base_url }}{{ slugs.dynamic.auth_redirects }}",
          instructions: [
            "Enter the chosen redirect URL for your app (e.g., http://localhost:3000{{ auth.callback_path }})",
            "Click Add to register it",
          ],
        },
        {
          id: "choose-stack",
          type: "choice",
          title: "Pick your stack",
          save_to: "sdk.language",
          options: ["node", "python", "go", "nextjs", "no_sdk"],
        },
        {
          id: "node-install",
          type: "show_commands",
          when: "sdk.language == 'node'",
          commands: ["npm i @vendor/sdk", "npx vendor init"],
        },
        {
          id: "python-install",
          type: "show_commands",
          when: "sdk.language == 'python'",
          commands: ["pip install vendor-sdk"],
        },
        {
          id: "go-install",
          type: "show_commands",
          when: "sdk.language == 'go'",
          commands: ["go get github.com/vendor/sdk"],
        },
        {
          id: "nextjs-install",
          type: "show_commands",
          when: "sdk.language == 'nextjs'",
          commands: ["npm i @vendor/sdk", "npx vendor init --framework nextjs"],
        },
        {
          id: "no-sdk-prompt",
          type: "ai_prompt",
          when: "sdk.language == 'no_sdk'",
          provider: "claude",
          model: "claude-3-7-sonnet",
          prompt_template: `
Using:
- Env ID: {{ environment_id }}
- Env URL: {{ environment_url }}
- Client ID: {{ client_id }}
- Client Secret: {{ client_secret }}
Describe minimal API calls and code changes to authenticate and fetch a resource.
Include curl and a language-agnostic outline. Mask secrets in output.
`,
        },
      ],
    },
  ],
};

export default blueprint;
