---
name: shadcn-ui
description: "Shadcn/UI: паттерны, styling rules, формы, иконки."
---

# Shadcn/UI Patterns

## Styling Rules

### Semantic Colors — NEVER Raw Values

```tsx
// ❌ WRONG: raw hex/Tailwind color
<div className="bg-zinc-900 text-white border-zinc-700">

// ✅ RIGHT: semantic tokens
<div className="bg-background text-foreground border-border">

// ❌ WRONG: hardcoded for dark mode
<div className="bg-white dark:bg-zinc-950">

// ✅ RIGHT: semantic handles both themes
<div className="bg-card text-card-foreground">
```

Semantic color tokens: `background`, `foreground`, `card`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`.

### CSS Patterns

```tsx
// ❌ WRONG: space-x causes issues with wrapped elements
<div className="flex space-x-4">

// ✅ RIGHT: gap works with wrapping
<div className="flex gap-4">

// ❌ WRONG: separate width/height
<div className="w-8 h-8">

// ✅ RIGHT: size shorthand
<div className="size-8">

// ❌ WRONG: manual text overflow
<p className="overflow-hidden text-ellipsis whitespace-nowrap">

// ✅ RIGHT: truncate utility
<p className="truncate">
```

### Variant-First, className for Layout Only

```tsx
// ❌ WRONG: custom styles for what variants cover
<Button className="bg-red-500 text-white hover:bg-red-600">Delete</Button>

// ✅ RIGHT: use built-in variant
<Button variant="destructive">Delete</Button>

// ✅ className only for layout concerns (margin, position, grid placement)
<Button variant="outline" className="mt-4 w-full">Save</Button>
```

### Use `cn()` for Conditional Classes

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "rounded-lg border p-4",
  isActive && "border-primary bg-primary/5",
  isDisabled && "opacity-50 pointer-events-none"
)} />
```

### No Manual z-index on Overlays

Shadcn overlay components (Dialog, Sheet, Dropdown, Popover, Tooltip) manage their own z-index. Never add `z-*` classes to them.

---

## Form Composition

### Form Field Pattern

```tsx
// ❌ WRONG: no label, inline error styling
<div>
  <input />
  <span style={{color: 'red'}}>Error</span>
</div>

// ✅ RIGHT: Label + Input + semantic error
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    aria-invalid={!!error}
    aria-describedby={error ? "email-error" : undefined}
  />
  {error && (
    <p id="email-error" className="text-sm text-destructive">{error}</p>
  )}
</div>
```

### ToggleGroup for Option Sets (2-7 items)

```tsx
// ❌ WRONG: custom radio buttons
<div className="flex gap-2">
  {options.map(opt => <button key={opt} onClick={...}>{opt}</button>)}
</div>

// ✅ RIGHT: ToggleGroup
<ToggleGroup type="single" value={selected} onValueChange={setSelected}>
  <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
  <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
  <ToggleGroupItem value="yearly">Yearly</ToggleGroupItem>
</ToggleGroup>
```

### Validation States

```tsx
// Validation via data attributes + aria
<Input
  data-invalid={!!error}
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" className="text-sm text-destructive">{error}</p>}

// Disabled via data attribute + native
<Input data-disabled={isDisabled} disabled={isDisabled} />
```

### Form UX Rules

- **Visible labels** — never placeholder-only
- **Error placement** — below the related field, not at top of form
- **Inline validation** — on blur, not on every keystroke
- **Focus management** — after submit error, auto-focus first invalid field
- **Progressive disclosure** — don't overwhelm upfront, reveal complex options gradually
- **Autosave for long forms** — prevent data loss on accidental navigation
- **Confirm before dismiss** — if sheet/modal has unsaved changes
- **Required indicators** — asterisk on required fields
- **Input types** — semantic `type` (email, tel, number) for correct mobile keyboard

---

## Component Composition

### Items Inside Groups

```tsx
// Select items must be in SelectGroup
<SelectGroup>
  <SelectLabel>Fruits</SelectLabel>
  <SelectItem value="apple">Apple</SelectItem>
  <SelectItem value="banana">Banana</SelectItem>
</SelectGroup>

// Tabs trigger inside TabsList
<TabsList>
  <TabsTrigger value="edit">Edit</TabsTrigger>
  <TabsTrigger value="preview">Preview</TabsTrigger>
</TabsList>
```

### Overlays — Which to Use

| Need | Component |
|------|-----------|
| Confirm destructive action | AlertDialog |
| Complex form/content | Dialog |
| Side panel (settings, details) | Sheet |
| Mobile bottom panel | Drawer |
| Quick actions list | DropdownMenu |
| Contextual info | Popover |
| Brief hint | Tooltip |

Dialog, Sheet, Drawer **require** Title (for accessibility).

### Component Patterns

```tsx
// ✅ Card composition
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>

// ✅ Button with loading state
<Button disabled={isLoading}>
  {isLoading && <Spinner className="animate-spin" data-icon="inline-start" />}
  Save
</Button>

// ✅ Avatar with fallback
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name[0]}</AvatarFallback>
</Avatar>

// ✅ Empty states
<Empty>
  <EmptyIcon><FileIcon /></EmptyIcon>
  <EmptyTitle>No documents</EmptyTitle>
  <EmptyDescription>Create your first document to get started.</EmptyDescription>
  <EmptyAction><Button>Create Document</Button></EmptyAction>
</Empty>

// ✅ Toasts via sonner
import { toast } from "sonner"
toast.success("Document saved")
toast.error("Failed to save")
```

### Use Built-in Components, Don't Reinvent

| Need | Use | NOT |
|------|-----|-----|
| Callout/banner | `Alert` | Custom div with border |
| Empty content | `Empty` | Custom placeholder |
| Toast notifications | `sonner` | Custom toast |
| Visual separator | `Separator` | `<hr>` or border div |
| Loading placeholder | `Skeleton` | Custom shimmer div |
| Status indicator | `Badge` | Colored span |

---

## Icon Rules

### data-icon Attribute (Inside Components)

```tsx
// ✅ Icons in Button use data-icon
<Button>
  <PlusIcon data-icon="inline-start" />
  Add Document
</Button>

<Button>
  Settings
  <ChevronRightIcon data-icon="inline-end" />
</Button>

// ❌ NEVER add sizing classes to icons inside components
<Button>
  <PlusIcon className="h-4 w-4" /> {/* Wrong — component handles sizing */}
  Add
</Button>
```

### Icon Library

Use project's configured icon library (Lucide). Pass icons as component objects, never as string keys.

```tsx
// ✅ Component reference
<Button icon={PlusIcon}>Add</Button>

// ❌ String key
<Button icon="plus">Add</Button>
```

---

## Component Selection Guide

| Category | Components |
|----------|-----------|
| **Actions** | Button, Toggle, DropdownMenu |
| **Form inputs** | Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, DatePicker |
| **Form structure** | Label, Input, Textarea, Select, Checkbox, RadioGroup, Switch |
| **Data display** | Table, DataTable, Card, Badge, Avatar |
| **Navigation** | Tabs, Breadcrumb, Pagination, NavigationMenu |
| **Overlays** | Dialog, Sheet, Drawer, AlertDialog, Popover, Tooltip |
| **Feedback** | Alert, sonner (toast), Skeleton, Progress, Spinner |
| **Layout** | Separator, ScrollArea, Collapsible, Accordion, ResizablePanel |
