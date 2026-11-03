import * as braceStylePlugin from "prettier-plugin-brace-style"
import ts from "typescript"

const parserNames = ["babel", "babel-ts", "typescript"]

function addClassPadding(formattedText) {
  const sourceFile = ts.createSourceFile(
    "formatted.tsx",
    formattedText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const insertionPoints = []

  function visit(node) {
    if (
      (ts.isClassDeclaration(node) || ts.isClassExpression(node)) &&
      node.members.length > 0
    ) {
      const position = node.members.pos
      const nextMemberStart = node.members[0].getStart(sourceFile)
      const between = formattedText.slice(position, nextMemberStart)
      if (!/^\r?\n[ \t]*\r?\n/.test(between)) {
        insertionPoints.push(position)
      }

      const closeBracePosition = node.end - 1
      const closeBraceLineStart =
        formattedText.lastIndexOf("\n", closeBracePosition - 1) + 1
      const previousLineStart =
        formattedText.lastIndexOf("\n", closeBraceLineStart - 2) + 1
      const beforeCloseBrace = formattedText.slice(
        previousLineStart,
        closeBraceLineStart,
      )
      if (!/^[ \t]*\r?\n$/.test(beforeCloseBrace)) {
        insertionPoints.push(closeBraceLineStart)
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  const newline = formattedText.includes("\r\n") ? "\r\n" : "\n"
  for (const position of insertionPoints.sort((a, b) => b - a)) {
    formattedText =
      formattedText.slice(0, position) + newline + formattedText.slice(position)
  }

  return formattedText
}

export const parsers = Object.fromEntries(
  parserNames.map((name) => {
    const parser = braceStylePlugin.parsers[name]
    return [
      name,
      {
        ...parser,
        async parse(text, options) {
          const ast = await parser.parse(text, options)
          const isJsonFile = /\.(?:json|jsonc|json5)$/i.test(
            options.filepath ?? "",
          )
          if (ast.type === "FormattedText" && !isJsonFile) {
            ast.body = addClassPadding(ast.body)
          }
          return ast
        },
      },
    ]
  }),
)
