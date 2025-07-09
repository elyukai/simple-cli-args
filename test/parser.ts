import { deepEqual, throws } from "node:assert/strict"
import { describe, it } from "node:test"
import { parse } from "../src/parser.ts"

describe("parse", () => {
  it("parses a list of simple options", () => {
    deepEqual(
      parse(
        {
          options: {
            bool: {
              name: "bool",
              type: Boolean,
            },
            str: {
              name: "str",
              type: String,
            },
            num: {
              name: "num",
              type: Number.parseFloat,
            },
          },
        },
        ["--bool", "--str", "test", "--num", "0"],
      ),
      {
        options: {
          bool: true,
          str: "test",
          num: 0,
        },
      },
    )
  })

  it("throws if a parameter of an option is missing", () => {
    throws(() =>
      parse(
        {
          options: {
            bool: {
              name: "bool",
              type: Boolean,
            },
            str: {
              name: "str",
              type: String,
            },
            num: {
              name: "num",
              type: Number.parseFloat,
            },
          },
        },
        ["--bool", "--str", "--num", "0"],
      ),
    )
  })

  it("parses a command", () => {
    deepEqual(
      parse(
        {
          commands: {
            a: {
              name: "aa",
            },
            b: {
              name: "bb",
            },
          },
        },
        ["aa"],
      ),
      {
        command: {
          name: "a",
        },
      },
    )
  })

  it("parses a list of simple options and a command with options", () => {
    deepEqual(
      parse(
        {
          options: {
            bool: {
              name: "bool",
              type: Boolean,
            },
            str: {
              name: "str",
              type: String,
            },
            num: {
              name: "num",
              type: Number.parseFloat,
            },
          },
          commands: {
            a: {
              name: "aa",
              options: {
                opta: {
                  name: "opta",
                  type: Boolean,
                },
              },
            },
            b: {
              name: "bb",
              options: {
                opta: {
                  name: "optb",
                  type: Number.parseFloat,
                },
              },
            },
          },
        },
        ["--bool", "--str", "test", "--num", "0", "aa", "--opta"],
      ),
      {
        options: {
          bool: true,
          str: "test",
          num: 0,
        },
        command: {
          name: "a",
          options: {
            opta: true,
          },
        },
      },
    )
  })

  it("throws if an option is passed after a subcommand and that subcommand does not have that option", () => {
    throws(() =>
      parse(
        {
          options: {
            bool: {
              name: "bool",
              type: Boolean,
            },
            str: {
              name: "str",
              type: String,
            },
            num: {
              name: "num",
              type: Number.parseFloat,
            },
          },
          commands: {
            a: {
              name: "aa",
              options: {
                opta: {
                  name: "opta",
                  type: Boolean,
                },
              },
            },
            b: {
              name: "bb",
              options: {
                opta: {
                  name: "optb",
                  type: Number.parseFloat,
                },
              },
            },
          },
        },
        ["--bool", "--str", "test", "aa", "--opta", "--num", "0"],
      ),
    )
  })
})
