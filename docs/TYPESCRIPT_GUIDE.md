# TypeScript Guide

Practical TypeScript patterns for React and Node projects. Focus on the cases you will hit every day.

## interface vs type

Use `interface` for object shapes. Use `type` for unions and aliases.

```ts
// object shape → interface
interface User {
  id: string;
  name: string;
  email: string;
}

// union → type
type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;
```

## Props

Always define props with an interface. Mark optional props with `?`.

```tsx
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

## useState

TypeScript usually infers the type from the initial value. Only annotate when needed.

```ts
const [count, setCount] = useState(0);           // inferred: number
const [name, setName] = useState('');            // inferred: string
const [user, setUser] = useState<User | null>(null); // needs annotation
```

## Event handlers

```tsx
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
  setValue(e.target.value);
}

function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
}
```

## async functions and API responses

Type what comes back from the API so the rest of the code knows what to expect.

```ts
interface Task {
  id: string;
  title: string;
  done: boolean;
}

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch('/api/tasks');
  const data = await res.json();
  return data;
}
```

## Avoid any

`any` turns off type checking. Use `unknown` instead and narrow it before use.

```ts
// bad
function parse(input: any) {
  return input.value; // no safety
}

// better
function parse(input: unknown) {
  if (typeof input === 'object' && input !== null && 'value' in input) {
    return (input as { value: string }).value;
  }
}
```

If you are not sure of the type yet, use `unknown` and come back to it. Do not use `any` as a shortcut.

## Null and undefined

Handle them explicitly rather than ignoring the error.

```ts
const user = getUser(); // User | null

// bad — TypeScript error
console.log(user.name);

// good
if (user) {
  console.log(user.name);
}

// also fine for simple cases
console.log(user?.name);
```

## Useful built-in types

A few that come up often:

```ts
Partial<User>        // all fields optional
Required<User>       // all fields required
Pick<User, 'id' | 'name'>   // only those fields
Omit<User, 'email'>         // everything except those fields
```

## When not to type everything

Do not annotate everything upfront. Start with the parts that are shared, complex, or reused. Add annotations where TypeScript complains or where a teammate would have to guess what the shape is.

Good places to start:

- component props
- API response shapes
- function return values that are used in many places
