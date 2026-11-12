const fs = require("fs");
const path = require("path");

const folder = process.argv[2];
const shouldMove = process.argv.includes("--move");

const categories = {
  Images: [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"],
  PDFs: [".pdf"],
  Videos: [".mp4", ".mkv", ".avi", ".mov"],
  Documents: [".doc", ".docx", ".txt", ".pptx", ".xlsx"],
  Archives: [".zip", ".rar", ".7z"],
  Programs: [".exe", ".msi"],
};

function getCategory(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  for (const category in categories) {
    if (categories[category].includes(ext)) {
      return category;
    }
  }
  return "Others";
}

const entries = fs.readdirSync(folder, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile());

console.log("Files found: " + files.length);

let moved = 0;
let skipped = 0;
const counts = {};

for (const file of files) {
  const category = getCategory(file.name);
  console.log(file.name + "  ->  " + category);
  counts[category] = (counts[category] || 0) + 1;

  if (shouldMove) {
    const targetFolder = path.join(folder, category);
    fs.mkdirSync(targetFolder, { recursive: true });

    const oldPath = path.join(folder, file.name);
    const newPath = path.join(targetFolder, file.name);

    if (fs.existsSync(newPath)) {
      console.log("  Skipped (a file with this name already exists)");
      skipped++;
    } else {
      fs.renameSync(oldPath, newPath);
      moved++;
    }
  }
}

console.log("");
console.log("Before: " + files.length + " loose files in one folder");
console.log("After: " + Object.keys(counts).length + " organized folders");
for (const category in counts) {
  console.log("  " + category + ": " + counts[category] + " files");
}

if (shouldMove) {
  console.log("Done. Moved " + moved + " files, skipped " + skipped + ".");
} else {
  console.log("Nothing moved. Add --move to organize the files.");
}