const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const svgPath = path.join(__dirname, "../icons/icon.svg");
const outDir = path.join(__dirname, "../icons");
const sizes = [16, 32, 48, 128];

async function generate() {
  const svg = fs.readFileSync(svgPath);
  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(outDir, `icon${size}.png`));
    console.log(`✓ icon${size}.png`);
  }
}

generate().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
