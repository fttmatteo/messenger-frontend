param (
    [Parameter(Mandatory=$true)]
    [string]$NewVersion
)

Write-Host "Actualizando package.json a la version $NewVersion..." -ForegroundColor Cyan
& npm version --no-git-tag-version $NewVersion
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al actualizar la version en package.json."
    exit $LASTEXITCODE
}

Write-Host "Actualizando archivos de documentacion..." -ForegroundColor Cyan

$DocsToUpdate = @("README.md", "README.en.md")

foreach ($File in $DocsToUpdate) {
    if (Test-Path $File) {
        $Content = Get-Content $File
        $NewContent = $Content | ForEach-Object {
            if ($_ -match "<img src=`".*Version-([\d\.]+(-SNAPSHOT)?)-blue\.svg`".*alt=`"Version`".*>") {
                $_ -replace "Version-[\d\.]+(-SNAPSHOT)?", "Version-$NewVersion"
            }
            else {
                $_
            }
        }
        $NewContent | Set-Content $File
    }
}

Write-Host "Version actualizada con exito a $NewVersion en package.json y READMEs." -ForegroundColor Green
Write-Host "Nota: La version en la interfaz se actualizara automaticamente en la proxima compilacion/HMR." -ForegroundColor Yellow
