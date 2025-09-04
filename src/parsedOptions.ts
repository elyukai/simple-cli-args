import type { Arguments, CommandConfigs, OptionConfigs } from "./options.ts"

export type ParsedOptions<A extends OptionConfigs> = {
  [Name in keyof A]:
    | (A[Name]["multiple"] extends true
        ? Array<A[Name]["type"] extends (arg: string) => infer R ? R : string>
        : A[Name]["type"] extends (arg: string) => infer R
          ? R
          : string)
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    | (A[Name]["defaultValue"] extends {} ? A[Name]["defaultValue"] : undefined)
}

export type ParsedCommand<A extends CommandConfigs> = {
  [Name in keyof A]: {
    name: Name
  } & ParsedLevel<A[Name]["options"], A[Name]["commands"]>
}[keyof A]

export type ParsedArguments<A extends Arguments> = ParsedLevel<A["options"], A["commands"]>

export type ParsedLevel<
  O extends OptionConfigs | undefined,
  C extends CommandConfigs | undefined,
> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  options?: O extends {} ? ParsedOptions<O> : never
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  command?: C extends {} ? ParsedCommand<C> : never
}
