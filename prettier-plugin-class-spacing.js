import * as braceStylePlugin from "prettier-plugin-brace-style"
import ts from "typescript"

const parserNames = ["babel", "babel-ts", "typescript"]

function parse(text, scriptKind = ts.ScriptKind.TSX) {
  return ts.createSourceFile(
    "formatted.tsx",
    text,
    ts.ScriptTarget.Latest,
    true,
    scriptKind,
  )
}

/** Prettier wraps long imports; keep each import declaration on a single line. */
function joinImports(formattedText) {
  const sourceFile = parse(formattedText)
  const edits = []

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const original = statement.getText(sourceFile)
    if (!/\r?\n/.test(original) || /\/\/|\/\*/.test(original)) continue
    const joined = original
      .replace(/\s*\r?\n\s*/g, " ")
      .replace(/,\s*}/, " }")
      .replace(/{\s+/, "{ ")
      .replace(/\s+}/, " }")
    edits.push({
      start: statement.getStart(sourceFile),
      end: statement.end,
      text: joined,
    })
  }

  for (const { start, end, text } of edits.sort((a, b) => b.start - a.start)) {
    formattedText =
      formattedText.slice(0, start) + text + formattedText.slice(end)
  }
  return formattedText
}

function addClassPadding(formattedText) {
  const sourceFile = parse(formattedText)
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
            ast.body = addClassPadding(joinImports(ast.body))
          }
          return ast
        },
      },
    ]
  }),
)
