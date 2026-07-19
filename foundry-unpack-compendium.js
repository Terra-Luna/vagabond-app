import { execSync } from "child_process";
import fs from "fs";

const manifest = JSON.parse(fs.readFileSync("./public/system.json", "utf8"));
const packNames = manifest.packs.map(p => p.name);

console.log(`[Foundry CLI | Unpacking ${packNames.length} compendiums...`);

for (const name of packNames) {
    const outputDirectory = `./packs/${name}`;

    console.log(`Unpacking: "${name}" -> ${outputDirectory}/`);

    try {
        execSync(
            `pnpm exec fvtt package unpack --type=System --id=vagabond-lite --out="${outputDirectory}" ${name}`,
            { stdio: "inherit" }
        );
    } catch (err) {
        console.error(`Failed to unpack compendium ${name}`);
    }
}

console.log("Foundry CLI | All packs extracted successfully into ./packs");