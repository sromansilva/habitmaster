const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Patrón para encontrar importaciones con versiones
    // Ejemplos: 'sonner@2.0.3', "@radix-ui/react-tooltip@1.1.8"
    content = content.replace(/(['"])([^'"]+)@[\d.]+\1/g, '$1$2$1');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Corregido: ${filePath}`);
        return true;
    }
    return false;
}

console.log('Corrigiendo importaciones con versiones...\n');

const srcPath = path.join(__dirname, 'src');
const files = getAllFiles(srcPath);

let fixedCount = 0;
files.forEach(file => {
    if (fixImports(file)) {
        fixedCount++;
    }
});

console.log(`\n¡Listo! Se corrigieron ${fixedCount} archivos.`);
