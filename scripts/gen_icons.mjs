import sharp from "sharp";
const SRC = "icon-512.png";
// Downscale to the app-icon sizes. 512 stays as the master.
for (const size of [180, 192]) {
  const out = size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await sharp(SRC).resize(size, size, { fit: "cover" }).png().toFile(out);
  console.log("wrote", out, size + "x" + size);
}
// Sample the corner pixel for the brand/theme colour.
const { data } = await sharp(SRC).extract({ left: 4, top: 4, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
const [r, g, b] = data;
const hex = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase();
console.log("theme_color (corner pixel):", hex);
