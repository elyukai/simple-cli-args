import type { Arguments, CommandConfigs, OptionConfigs } from "./options.ts"
import type { ParsedArguments } from "./parsedOptions.ts"

const testEqualsOption = /^(--[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)=(.+)/

const splitArgs = (rawArgs: string[]) =>
  rawArgs.flatMap(arg => {
    const equalsRes = testEqualsOption.exec(arg)
    if (equalsRes == null) {
      return [arg]
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return [equalsRes[1]!, equalsRes[2]!]
  })

const findOption = (optionConfigs: OptionConfigs, arg: string) =>
  Object.entries(optionConfigs).find(
    ([_, optionConfig]) =>
      arg === `--${optionConfig.name}` ||
      (optionConfig.alias !== undefined && arg === `-${optionConfig.alias}`) ||
      (optionConfig.type === Boolean && arg === `--no-${optionConfig.name}`),
  )

const findCommand = (commandConfigs: CommandConfigs, arg: string) =>
  Object.entries(commandConfigs).find(([_, commandConfig]) => arg === commandConfig.name)

// const isArgOptionOrCommand = (
//   optionConfigs: OptionConfigs,
//   commandConfigs: CommandConfigs,
//   arg: string,
// ) => findOption(optionConfigs, arg) !== undefined || findCommand(commandConfigs, arg) !== undefined

const parseLevel = (
  parsed: ParsedArguments,
  optionConfigs: OptionConfigs,
  commandConfigs: CommandConfigs,
  args: string[],
  arg: string,
  currentIndex: number,
): number => {
  const option = findOption(optionConfigs, arg)

  if (option) {
    const [optionKey, optionSettings] = option

    if (optionSettings.type === Boolean) {
      ;(parsed.options ??= {})[optionKey] = !arg.startsWith("--no-")
      return 0
    } else {
      if (currentIndex === args.length - 1) {
        throw new SyntaxError(`missing argument for option "${arg}"`)
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const consumedNextArg = args[currentIndex + 1]!
      const optionArg = optionSettings.type?.(consumedNextArg) ?? consumedNextArg
      ;(parsed.options ??= {})[optionKey] = optionArg
      return 1
    }
  }

  const command = findCommand(commandConfigs, arg)

  if (command) {
    parsed.command = {
      name: command[0],
    }
    return 0
  }

  throw new SyntaxError(`unknown argument "${arg}"`)
}

export const parse = (argsConfig: Arguments, rawArgs: string[]) => {
  const args = splitArgs(rawArgs)
  const parsedArguments: ParsedArguments = {}

  let currentParsed = parsedArguments
  let currentOptionConfigs = argsConfig.options ?? {}
  let currentCommandConfigs = argsConfig.commands ?? {}

  for (let i = 0; i < args.length; i++) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const arg = args[i]!
    const skipIndices = parseLevel(
      currentParsed,
      currentOptionConfigs,
      currentCommandConfigs,
      args,
      arg,
      i,
    )
    i += skipIndices

    if (currentParsed.command !== undefined) {
      currentOptionConfigs = currentCommandConfigs[currentParsed.command.name]?.options ?? {}
      currentCommandConfigs = currentCommandConfigs[currentParsed.command.name]?.commands ?? {}
      currentParsed = currentParsed.command
    }
  }

  return parsedArguments
}
