export type RenderValue = string | number | boolean | null | RenderValue[] | { [key: string]: RenderValue };
export type RenderContext = Record<string, RenderValue>;
export type TemplatePartials = Record<string, string>;

export class TemplateRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TemplateRenderError";
  }
}

export function renderTemplate(template: string, context: RenderContext, partials: TemplatePartials = {}): string {
  const withPartials = template.replace(/\{\{\s*>\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_match, partialName: string) => {
    const partial = partials[partialName];
    if (partial === undefined) {
      throw new TemplateRenderError(`Missing template partial: ${partialName}`);
    }

    return renderTemplate(partial, context, partials);
  });

  return withPartials.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (_match, expression: string) => {
    const value = resolvePath(context, expression);
    return stringifyValue(value, expression);
  });
}

function resolvePath(context: RenderContext, expression: string): RenderValue | undefined {
  const segments = expression.split(".");
  let current: RenderValue | undefined = context;

  for (const segment of segments) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function stringifyValue(value: RenderValue | undefined, expression: string): string {
  if (value === undefined) {
    throw new TemplateRenderError(`Missing template value: ${expression}`);
  }

  if (value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map((item) => stringifyValue(item, expression)).join("\n");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
}
