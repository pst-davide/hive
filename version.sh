#!/bin/bash

# Ottieni l'ultimo tag (versione)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)

# Ottieni il numero di commit dall'ultimo tag (per la parte patch)
COMMITS_SINCE_TAG=$(git rev-list --count ${LAST_TAG}..HEAD)

# Ottieni il numero totale di commit
TOTAL_COMMITS=$(git rev-list --count HEAD)

# Se non ci sono tag, usa una versione di default
if [ -z "$LAST_TAG" ]; then
  VERSION="0.0.0"
else
  VERSION=$LAST_TAG
fi

# Divide la versione in MAJOR, MINOR e PATCH
IFS='.' read -r -a VERSION_PARTS <<< "$VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Aggiungi il numero di commit alla patch (se presente)
if [ -z "$PATCH" ]; then
  PATCH=$COMMITS_SINCE_TAG
else
  PATCH=$(($PATCH + $COMMITS_SINCE_TAG))
fi

# Versione finale in formato semantico
SEMANTIC_VERSION="$MAJOR.$MINOR.$PATCH"

# Ottieni l'ultimo commit
GIT_COMMIT=$(git rev-parse --short HEAD)

# Ottieni la data dell'ultimo commit
GIT_DATE=$(git log -1 --format=%cd --date=short)

# Crea il file version.json
echo "{ \"version\": \"$SEMANTIC_VERSION\", \"commit\": \"$GIT_COMMIT\", \"date\": \"$GIT_DATE\", \"totalCommits\": \"$TOTAL_COMMITS\" }" > public/assets/version.json
