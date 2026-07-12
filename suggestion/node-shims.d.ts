/**
 * Minimal ambient declarations for the node builtins the suggestion tests use.
 * The repo does not install @types/node (its own tests run through tsx, which
 * strips types without checking them); these shims exist only so
 * `npx tsc -p suggestion --noEmit` can check this folder standalone. Delete
 * this file when porting the tests into tests/.
 */
declare module 'node:test' {
  const test: (name: string, fn: () => void | Promise<void>) => void
  export default test
}

declare module 'node:assert/strict' {
  interface Assert {
    (value: unknown, message?: string): asserts value
    equal(actual: unknown, expected: unknown, message?: string): void
    deepEqual(actual: unknown, expected: unknown, message?: string): void
    ok(value: unknown, message?: string): asserts value
    match(value: string, pattern: RegExp, message?: string): void
    doesNotMatch(value: string, pattern: RegExp, message?: string): void
  }
  const assert: Assert
  export default assert
}
