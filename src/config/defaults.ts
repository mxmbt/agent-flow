export interface AgentFlowConfig {
  project: {
    name: string;
    taskPrefix: string;
    taskIdPattern: string;
  };
  artifacts: {
    statusFile: string;
    roadmapFile: string;
    productFile: string;
    architectureFile: string;
    userIsolationArchitectureFile: string;
    schedulingArchitectureFile: string;
    phaseRoot: string;
    walkthroughRoot: string;
  };
  git: {
    remoteName: string;
    repository: string | null;
    integrationBranch: string;
    releaseBranch: string | null;
    branchPrefixes: string[];
    worktreeParking: boolean;
  };
  checks: {
    default: string[];
    optional: Record<string, string>;
    changed: Record<string, string[]>;
  };
  dev: {
    start: {
      command: string | null;
      url: string | null;
    };
  };
  runtime: {
    appRoot: string;
    deploymentImpactSurfaces: string[];
  };
  quality: {
    experts: string[];
    domainExpert: string | null;
    invariants: string[];
  };
  packs: string[];
  mcp: {
    mode: "recommended" | "strict" | "off";
    servers: Record<string, { enabled: boolean; required: boolean }>;
  };
  features: {
    claude: boolean;
    codex: boolean;
    codeReviewGraph: "optional" | "required" | "off";
    releaseSync: boolean;
  };
}

export function createDefaultConfig(projectName = "Example Project"): AgentFlowConfig {
  return {
    project: {
      name: projectName,
      taskPrefix: "APP",
      taskIdPattern: "APP-[A-Z0-9]+-T[0-9]+"
    },
    artifacts: {
      statusFile: "PROJECT_STATUS.md",
      roadmapFile: "docs/ROADMAP.md",
      productFile: "docs/PRODUCT.md",
      architectureFile: "docs/ARCHITECTURE.md",
      userIsolationArchitectureFile: "docs/ARCHITECTURE_MULTI_USER.md",
      schedulingArchitectureFile: "docs/ARCHITECTURE_SCHEDULING.md",
      phaseRoot: "docs/phases",
      walkthroughRoot: "docs/walkthroughs/agents"
    },
    git: {
      remoteName: "origin",
      repository: null,
      integrationBranch: "main",
      releaseBranch: null,
      branchPrefixes: ["feature", "bugfix", "hotfix", "infra"],
      worktreeParking: false
    },
    checks: {
      default: ["npm test"],
      optional: {},
      changed: {}
    },
    dev: {
      start: {
        command: null,
        url: null
      }
    },
    runtime: {
      appRoot: ".",
      deploymentImpactSurfaces: []
    },
    quality: {
      experts: ["paranoid-architect", "performance-expert", "ux-expert"],
      domainExpert: null,
      invariants: []
    },
    packs: [],
    mcp: {
      mode: "recommended",
      servers: {}
    },
    features: {
      claude: true,
      codex: true,
      codeReviewGraph: "optional",
      releaseSync: false
    }
  };
}
