import { execSync } from "child_process"
import fs from "fs"

try {
    const manifest = JSON.parse(fs.readFileSync("./public/system.json", "utf8"))

    for (const pack of manifest.packs) {
        const sourceDir = `./packs/${pack.name}`
        const targetDest = `./dist/packs`

        if (!fs.existsSync(sourceDir)) continue
        console.info(`Packing: ${sourceDir} >>> ${targetDest}`)

        execSync(`pnpm exec fvtt package pack --type=System --id=vagabond-app --in="${sourceDir}" --out="${targetDest}" ${pack.name}`, { stdio: "inherit" })
    }
}
catch (err) {
    console.error("Failed to compile compendiums into dist folder:", err)
}