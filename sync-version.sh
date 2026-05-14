#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Uso: $0 <version>"
  exit 1
fi

VER="$1"

echo "Actualizando package.json a la version ${VER}..."
npm version --no-git-tag-version "${VER}"
if [ $? -ne 0 ]; then
  echo "Error al actualizar la version en package.json." >&2
  exit 1
fi

echo "Actualizando archivos de documentacion..."

DocsToUpdate=("README.md" "README.en.md")

for File in "${DocsToUpdate[@]}"; do
  if [ -f "$File" ]; then
    # Reemplaza Version-x.y.z o Version-x.y.z-SNAPSHOT solo en las lineas que contienen alt="Version"
    sed -E "/alt=[\"']Version[\"']/{s/Version-[0-9]+(\.[0-9]+)*(-SNAPSHOT)?/Version-${VER}/g}" "$File" > "$File.tmp" && mv "$File.tmp" "$File"
    echo "$File actualizado."
  fi
done

echo "Version actualizada con exito a ${VER} en package.json y READMEs."
echo "Nota: La version en la interfaz se actualizara automaticamente en la proxima compilacion/HMR."
