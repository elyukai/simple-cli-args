import type { Arguments, CommandConfigs, Option, OptionConfigs } from "./options.ts"
import type { ParsedArguments, ParsedLevel } from "./parsedOptions.ts"

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

const parseMultipleOption = (
  values: unknown[],
  optionConfigs: OptionConfigs,
  commandConfigs: CommandConfigs,
  optionSettings: Option<unknown, boolean>,
  args: string[],
  arg: string,
  currentIndex: number,
): void => {
  if (!findOption(optionConfigs, arg) && !findCommand(commandConfigs, arg)) {
    const optionArg = optionSettings.type?.(arg) ?? arg
    values.push(optionArg)

    const nextIndex = currentIndex + 1
    const nextArg = args[nextIndex]
    if (nextArg !== undefined) {
      parseMultipleOption(
        values,
        optionConfigs,
        commandConfigs,
        optionSettings,
        args,
        nextArg,
        nextIndex,
      )
    }
  }
}

const parseLevel = (
  parsed: ParsedLevel<OptionConfigs, CommandConfigs>,
  optionConfigs: OptionConfigs,
  commandConfigs: CommandConfigs,
  args: string[],
  arg: string,
  currentIndex: number,
): number => {
  const option = findOption(optionConfigs, arg)

  if (option) {
    const [optionKey, optionSettings] = option

    parsed.options ??= {}

    if (optionSettings.type === Boolean) {
      ;(parsed.options[optionKey] as unknown as boolean) = !arg.startsWith("--no-")
      return 0
    } else {
      const nextArg = args[currentIndex + 1]
      if (nextArg === undefined) {
        throw new SyntaxError(`missing argument for option "${arg}"`)
      }

      if (optionSettings.multiple === true) {
        const values: unknown[] = ((parsed.options[optionKey] as unknown as unknown[]) = [])
        parseMultipleOption(
          values,
          optionConfigs,
          commandConfigs,
          optionSettings,
          args,
          nextArg,
          currentIndex + 1,
        )
        return values.length
      } else {
        const optionArg = optionSettings.type?.(nextArg) ?? nextArg
        ;(parsed.options[optionKey] as unknown as typeof optionArg) = optionArg
        return 1
      }
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

export const parse = <A extends Arguments>(argsConfig: A, rawArgs: string[]) => {
  const args = splitArgs(rawArgs)
  const parsedArguments: ParsedArguments<A> = {}

  let currentParsed: ParsedLevel<OptionConfigs, CommandConfigs> = parsedArguments
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
