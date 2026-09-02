import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

function sanitizeCss(rawCss: string): string {
  return rawCss
    .replace(/\/\*[\s\S]*?\*\//g, '') // Comments
    .replace(/\s+/g, ' ')             // Spaces (after the first), newlines
    .trim()
}

// replaces any .css?inline requests with inlined versions
export function inlineCssPlugin() {
  return {
    name: 'inline-css-plugin',
    enforce: 'post', // this tells our plugin to run after vite and tailwind's plugins have transformed things

    // takes any files that vite/tailwind would normally create a new typescript file for and inlines them instead
    transform(code: any, id: string) {
      if (id.includes('.css?inline') || id.includes('.css?')) {
        let compiledCss = ''

        try {
          const ast = (this as any).parse(code)

          // adds our css from each ast "chunk" that tailwind / vite already generated
          if (ast && ast.body) {
            for (const node of ast.body) {
              if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'Literal') {
                compiledCss += String(node.declaration.value)
              }
              else if (node.type === 'VariableDeclaration') {
                for (const decl of node.declarations) {
                  if (decl.init && decl.init.type === 'Literal') {
                    compiledCss += String(decl.init.value)
                  }
                }
              }
            }
          }
        } catch (e) {
          // not sure if we ever actually hit this block
          const stringLiteralRegex = /"([\s\S]*?)"|'([\s\S]*?)'|`([\s\S]*?)`/g
          let match
          while ((match = stringLiteralRegex.exec(code)) !== null) {
            compiledCss += match[1] || match[2] || match[3] || ''
          }
        }

        if (!compiledCss) return null

        const sanitizedCss = sanitizeCss(compiledCss)
        const moduleContent = `export const injectedCss = ${JSON.stringify(sanitizedCss)}`

        return {
          code: moduleContent,
          map: null
        }
      }
      return null
    }
  }
}

export default defineConfig(({ mode }) => {
  return {
    base: "/systems/vagabond-lite/",
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      port: 30001,
      open: "/",
      proxy: {
        "^(?!/systems/vagabond-lite)": "http://localhost:30000/",
        "/socket.io": {
          target: "ws://localhost:30000",
          ws: true,
          changeOrigin: true,
          secure: false
        },
      },
      watch: {
        ignored: [
          "**/src/rules/util/ItemsCache.ts",
        ]
      }
    },
    publicDir: "public",
    build: {
      outDir: "dist",
      emptyOutDir: false,
      sourcemap: true,
      cssCodeSplit: false,
      minify: false,
      lib: {
        name: "vagabond-lite",
        entry: "src/vagabond-lite.tsx",
        formats: ["es"],
        fileName: "vagabond-lite"
      },
      rollupOptions: {
        treeshake: false,
        output: {
          exports: "named"
        }
      }
    },
    plugins: [
      react(),
      tailwindcss(),
      svgr({
        svgrOptions: {
          replaceAttrValues: {
            '#000': 'currentColor',
            '#000000': 'currentColor'
          },
        },
      }),
      inlineCssPlugin()
    ],
  }
})
