import { argv } from "node:process"
import type { Arguments } from "./options.ts"
import type { ParsedArguments } from "./parsedOptions.ts"
import { parse } from "./parser.ts"

export const parseArguments = <A extends Arguments>(options: A): ParsedArguments<A> =>
  parse(options, argv.slice(2))

export type * from "./options.ts"
export type * from "./parsedOptions.ts"
