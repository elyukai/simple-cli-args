export type Option<T, M extends boolean> = {
  name: string
  alias?: string
  type?: (value: string) => T
  defaultValue?: T
  multiple?: M
}

export type OptionConfigs = Record<string, Option<unknown, boolean>>

export type Command = {
  name: string
  options?: OptionConfigs
  commands?: CommandConfigs
}

export type CommandConfigs = Record<string, Command>

export type Arguments = {
  options?: OptionConfigs
  commands?: CommandConfigs
}
