import AdmZip from "adm-zip"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const args = process.argv.slice(2)
const manifestPath = "./public/system.json"
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
let version = (args[0] || 'v0.0.1')

if (args.includes("--help") || args.includes("--usage")) {
    console.info("Usage: pnpm deploy {version number} {destination}")
    console.info("Version number defaults to v0.0.1, Destination defaults to releases/vagabond-app-${releaseVersion}.zip")
    console.info("Use 'pnpm deploy patch' to increment the patch.")
    process.exit(0)
}

if (args.includes("patch")) {
    const currentVersion = manifest.version.split('.')
    const patch = Number(currentVersion.pop()) + 1
    version = `v${currentVersion[0]}.${currentVersion[1]}.${patch}`
    console.info(`Deploying patch: v${version}`)
}

const zipName = `vagabond-app-${version}.zip`
const destination = (args[1] || `./releases/${zipName}`)

const targetDir = path.dirname(destination)
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
}

// Update the manifest with the correct repository path
manifest.version = version.replace("v", "")
manifest.download = `https://github.com/Terra-Luna/vagabond-app/releases/download/${version}/${zipName}`
fs.writeFileSync("./public/system.json", JSON.stringify(manifest, null, 2), "utf-8")
console.info("Updated system.json with version and download URL...")

execSync(`pnpm build && pnpm pack:packs`, { stdio: "inherit" })

// Build the ZIP
console.info("Building release ZIP...")
const zip = new AdmZip()
zip.addLocalFolder("./dist")
zip.addLocalFolder("./lang", "lang")
zip.writeZip(destination)
console.info(`\nRelease zip created at ${destination}`)

// Release to GitHub
console.info(`Creating GitHub release for ${version}...`)
try {
    execSync(
        `gh release create ${version} "${destination}" "${manifestPath}" --title "Release ${version}" --notes "Automated release for version ${version}"`,
        { stdio: "inherit" }
    )
    console.info("GitHub release created, ZIP and system.json uploaded successfully!");
}
catch (error) {
    console.error(`Failed to create GitHub release. Make sure GitHub CLI (gh) is installed and authenticated. ${error}`)
    process.exit(1)
}
finally {
    /**
     * The reason for this is to make sure we're always developing in a
     * future release state which will force Foundry to recognize database
     * updates and run the migration scripts after a system update.
     */
    const currentVersion = manifest.version.split('.')
    const patch = Number(currentVersion.pop()) + 1
    version = `${currentVersion[0]}.${currentVersion[1]}.${patch}`
    manifest.version = version
    fs.writeFileSync("./public/system.json", JSON.stringify(manifest, null, 2), "utf-8")
    console.info(`Updating working patch version: ${version}`)
}

process.exit(0)