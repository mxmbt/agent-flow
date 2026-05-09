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
  },
  {
    name: "design",
    version: 1,
    description: "UI/UX design intelligence, styling references, and design-system tooling.",
    contributes: {
      guides: ["ui-ux-pro-max-reference"],
      skills: ["ui-ux-pro-max", "ui-styling-uupm", "design-system-uupm"],
      validators: ["design-review"]
    }
  },
  {
    name: "code-review-toolkit",
    version: 1,
    description: "Auxiliary code review and behavior-preserving simplification agents.",
    contributes: {
      agents: [
        "prt-code-reviewer",
        "prt-code-simplifier",
        "prt-comment-analyzer",
        "prt-pr-test-analyzer",
        "prt-silent-failure-hunter",
        "prt-type-design-analyzer"
      ],
      validators: ["code-review-toolkit"]
    }
  },
  {
    name: "code-review-graph",
    version: 1,
    description: "Graph-first code discovery and impact-analysis guidance.",
    contributes: {
      guides: ["code-review-graph-usage"],
      validators: ["code-review-graph"],
      mcpServers: {
        codeReviewGraph: {
          enabled: true,
          required: false
        }
      }
    }
  }
];
