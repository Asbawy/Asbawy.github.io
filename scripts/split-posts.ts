import fs from "fs";
import path from "path";

const dir = "src/data/posts";
const files = fs.readdirSync(dir).filter(f => f.endsWith(".ts") && !f.endsWith(".content.ts") && f !== "_template.ts");

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, "utf-8");
  
  const match = content.match(/content:\s*`([\s\S]*?)`\s*,?\s*(};?|\];?)\s*$/);
  if (match) {
    const md = match[1];
    const out = path.join(dir, file.replace(".ts", ".content.ts"));
    fs.writeFileSync(out, `export default \`${md}\`;\n`);
    
    content = content.replace(/content:\s*`[\s\S]*?`\s*,?\s*(};?|\];?)\s*$/, "$1\n");
    fs.writeFileSync(p, content);
    console.log(`Split ${file}`);
  } else {
    console.log(`Could not match content in ${file}`);
  }
}
