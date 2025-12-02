# Script para corregir las importaciones con versiones en los archivos TypeScript/TSX
Write-Host "Corrigiendo importaciones con versiones..." -ForegroundColor Green

# Obtener todos los archivos .ts y .tsx en src
$files = Get-ChildItem -Path "src" -Recurse -Include *.ts,*.tsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Reemplazar todas las importaciones con versiones
    # Patrón: from "package@version" -> from "package"
    $content = $content -replace 'from\s+[''"]([^''"@]+)@[\d\.]+[''"]', 'from "$1"'
    $content = $content -replace 'import\s+\*\s+as\s+(\w+)\s+from\s+[''"]([^''"@]+)@[\d\.]+[''"]', 'import * as $1 from "$2"'
    
    # Solo escribir si hubo cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "✓ Corregido: $($file.FullName)" -ForegroundColor Cyan
    }
}

Write-Host "`n¡Listo! Todas las importaciones han sido corregidas." -ForegroundColor Green
