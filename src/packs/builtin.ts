import type { PackManifest } from "./manifest.js";

export const builtinPacks: PackManifest[] = [
  {
    name: "finance",
    version: 1,
    description: "Financial correctness rules and review surfaces.",
    contributes: {
      agents: ["math-genius"],
      validators: ["finance-invariants"],
      quality: {
        domainExpert: "math-genius",
        invariants: ["fixed-point money", "no look-ahead", "explicit timezone handling"]
      }
    }
  },
  {
    name: "cloudflare-worker",
    version: 1,
    description: "Cloudflare Worker runtime and deployment surfaces.",
    contributes: {
      validators: ["cloudflare-bindings"],
      checks: {
        changed: {
          schema: ["npm run generate", "npm run migrate:local"]
        }
      },
      deploymentImpactSurfaces: ["worker bindings", "D1 migrations", "R2 buckets", "KV namespaces"],
      mcpServers: {
        playwright: {
          enabled: true,
          required: false
        }
      }
    }
  },
  {
    name: "telegram",
    version: 1,
    description: "Telegram QA and user-facing copy constraints.",
    contributes: {
      validators: ["telegram-copy"],
      deploymentImpactSurfaces: ["Telegram webhook", "bot secrets"],
      quality: {
        invariants: ["chat-first UX", "concise user-facing copy"]
      }
    }
  },
  {
    name: "webapp",
    version: 1,
    description: "Browser QA, accessibility, and common frontend checks.",
    contributes: {
      validators: ["browser-qa", "accessibility"],
      checks: {
        optional: {
          build: "npm run build"
        }
      },
      mcpServers: {
        playwright: {
          enabled: true,
          required: false
        }
      }
    }
  }
];
