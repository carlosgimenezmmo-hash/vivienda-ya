const sharp = require("sharp");
const fs = require("fs");

const svg = fs.readFileSync("./public/icon.svg");

sharp(svg).resize(192, 192).png().toFile("./public/icon-192.png", (err) => {
  if (err) console.error("Error 192:", err);
  else console.log("icon-192.png creado");
});

sharp(svg).resize(512, 512).png().toFile("./public/icon-512.png", (err) => {
  if (err) console.error("Error 512:", err);
  else console.log("icon-512.png creado");
});

sharp(svg).resize(180, 180).png().toFile("./public/apple-icon.png", (err) => {
  if (err) console.error("Error apple:", err);
  else console.log("apple-icon.png creado");
});
