import AdmZip from "adm-zip"

const args = process.argv.slice(2)

if (args.includes("--help") || args.includes("--usage")) {
    console.log("Usage: pnpm deploy {version number} {destination}")
    console.log("Version number defaults to v0.0.1, Destination defaults to dist/vagabond-app-${releaseVersion}.zip")
    process.exit(0)
}

const releaseVersion = (args[0] || 'v0.0.1')
const destination = (args[1] || `./dist/vagabond-app-${releaseVersion}.zip`)
const zip = new AdmZip()
zip.addLocalFolder("./dist")
// include lang as it's not in "public"
zip.addLocalFolder("./lang", "lang")
zip.writeZip(destination)

console.log(`\nRelease zip created at ${destination}`)

process.exit(0)