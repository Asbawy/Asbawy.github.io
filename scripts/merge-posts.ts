import fs from "fs";
import path from "path";

const dir = "src/data/posts";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".content.ts"));

for (const file of files) {
  const contentFile = path.join(dir, file);
  const tsFile = path.join(dir, file.replace(".content.ts", ".ts"));

  if (!fs.existsSync(tsFile)) continue;

  let md = fs.readFileSync(contentFile, "utf-8");
  md = md.replace(/^export default `/, "").replace(/`;\n*$/, "");

  let ts = fs.readFileSync(tsFile, "utf-8");

  ts = ts.replace(
    /export const post: Post = \{\s*\.\.\.meta,?\s*\};?/m,
    `export const post: Post = {\n  ...meta,\n  content: \`${md}\`\n};`,
  );

  fs.writeFileSync(tsFile, ts);
  fs.unlinkSync(contentFile);
  console.log(`Merged ${file} back into ${tsFile}`);
}
