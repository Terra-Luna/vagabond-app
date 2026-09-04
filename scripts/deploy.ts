import AdmZip from "adm-zip"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"

const args = process.argv.slice(2)

if (args.includes("--help") || args.includes("--usage")) {
    console.log("Usage: pnpm deploy {version number} {destination}")
    console.log("Version number defaults to v0.0.1, Destination defaults to releases/vagabond-app-${releaseVersion}.zip")
    process.exit(0)
}

const version = (args[0] || 'v0.0.1')
const zipName = `vagabond-app-${version}.zip`
const destination = (args[1] || `./releases/${zipName}`)

const targetDir = path.dirname(destination)
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
}

// Update the manifest with the correct repository path
const manifestPath = "./public/system.json"
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
manifest.version = version
manifest.download = `https://github.com/Terra-Luna/vagabond-app/releases/download/${version}/${zipName}`
fs.writeFileSync("./public/system.json", JSON.stringify(manifest, null, 2), "utf-8")

// Build the ZIP
const zip = new AdmZip()
zip.addLocalFolder("./dist")
zip.addLocalFolder("./lang", "lang")
zip.writeZip(destination)

console.log(`\nRelease zip created at ${destination}`)

// Release to GitHub
console.log(`Creating GitHub release for ${version}...`)
try {
    execSync(
        `gh release create ${version} "${destination}" "${manifestPath}" --title "Release ${version}" --notes "Automated release for version ${version}"`,
        { stdio: "inherit" }
    )
    console.log("GitHub release created, ZIP and system.json uploaded successfully!");
}
catch (error) {
    console.error(`Failed to create GitHub release. Make sure GitHub CLI (gh) is installed and authenticated. ${error}`)
    process.exit(1)
}

process.exit(0)