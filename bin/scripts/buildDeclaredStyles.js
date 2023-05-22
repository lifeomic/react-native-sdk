const path = require('path');
const fs = require('fs');

function getFilesRecursively(dir) {
  try {
    return fs.readdirSync(dir).flatMap((file) => {
      const absolute = path.join(dir, file);

      if (fs.statSync(absolute).isDirectory()) {
        return getFilesRecursively(absolute);
      }

      return absolute;
    });
  } catch {
    return []; // directory does not exist
  }
}

try {
  const distDir = path.join(__dirname, '../../dist');
  const styleTypeFile = path.resolve(
    distDir,
    'src/components/BrandConfigProvider/styles/types.d.ts',
  );
  const distFiles = getFilesRecursively(distDir);

  const filesWithDeclaredStyle = distFiles.filter(
    (file) =>
      file.endsWith('.d.ts') &&
      fs.readFileSync(file).toString().includes("declare module '@styles'"),
  );

  if (filesWithDeclaredStyle.length) {
    filesWithDeclaredStyle.forEach((file) => {
      const relPath = path
        .relative(file, styleTypeFile)
        .replace('.d.ts', '')
        .replace('../', './');
      const fileContents = fs.readFileSync(file).toString();
      fs.writeFileSync(
        file,
        fileContents.replace(
          "declare module '@styles'",
          `declare module '${relPath}'`,
        ),
      );
    });

    const fileImports = filesWithDeclaredStyle
      .map(
        (file) =>
          `import './${path.relative(distDir, file).replace('.d.ts', '')}';`,
      )
      .join('\n');

    fs.appendFileSync(
      path.resolve(distDir, 'index.d.ts'),
      `\n// Components with declared style\n${fileImports}\n`,
    );
  }

  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
