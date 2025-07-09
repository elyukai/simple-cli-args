import { argv } from "node:process"
import type { Arguments } from "./options.ts"
import type { ParsedArguments } from "./parsedOptions.ts"
import { parse } from "./parser.ts"

export const parseArguments = (options: Arguments): ParsedArguments => parse(options, argv.slice(2))
