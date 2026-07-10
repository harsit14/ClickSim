export type UiTextParameter = string | number | boolean | null

export type UiTextResolver = (
  key: string,
  parameters?: Readonly<Record<string, UiTextParameter>>,
) => string

export type DurationFormatter = (milliseconds: number) => string
