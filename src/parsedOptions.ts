export type ParsedOptions = Record<string, unknown>

export type ParsedCommand = {
  name: string
  options?: ParsedOptions
  command?: ParsedCommand
}

export type ParsedArguments = {
  options?: ParsedOptions
  command?: ParsedCommand
}
