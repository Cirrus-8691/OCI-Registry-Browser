# Docker CLI et Cosign dans OCI-RegistryBrowser

## 📦 Modifications du Dockerfile

Le Dockerfile a été modifié pour inclure **Docker CLI** et **Cosign** dans l'image de production.

### Outils installés

- **Docker CLI** : Client Docker pour interagir avec un daemon Docker externe
- **Cosign** : Outil de signature et vérification d'images de conteneurs

### Installation

Les outils sont installés dans le stage `runner` (image finale) via :

```dockerfile
RUN apk add --no-cache \
    docker-cli \
    curl \
    && curl -o /usr/local/bin/cosign -L https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 \
    && chmod +x /usr/local/bin/cosign \
    && docker --version \
    && cosign version
```

## 🚀 Utilisation

### Construire l'image

```bash
docker build -t oci-registry-browser:latest .
```

### Déployer avec Docker CLI

Pour que le conteneur puisse utiliser Docker CLI, vous devez **monter le socket Docker** :

#### Avec Docker

```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name oci-registry-browser \
  oci-registry-browser:latest
```

#### Avec Docker Compose

```yaml
version: '3.8'
services:
  oci-registry-browser:
    image: oci-registry-browser:latest
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - NODE_ENV=production
```

#### Avec Kubernetes

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: oci-registry-browser
spec:
  containers:
  - name: app
    image: oci-registry-browser:latest
    ports:
    - containerPort: 3000
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
      type: Socket
```

## 🔐 Utilisation de Cosign

### Vérifier une image signée

```bash
# Depuis le conteneur
docker exec oci-registry-browser cosign verify \
  --certificate-identity "signer@example.com" \
  --certificate-oidc-issuer "https://issuer.com" \
  registry.example.com/image:tag
```

### Signer une image (nécessite des clés)

```bash
# Générer une paire de clés
cosign generate-key-pair

# Signer une image
cosign sign --key cosign.key registry.example.com/image:tag
```

## ⚠️ Considérations de sécurité

### Permissions Docker Socket

Monter `/var/run/docker.sock` donne au conteneur un accès **root équivalent** au système hôte. 

**Recommandations** :
- Utilisez cette fonctionnalité uniquement dans des environnements de confiance
- Envisagez d'utiliser Docker-in-Docker ou Podman pour une meilleure isolation
- Limitez les permissions avec des politiques SELinux/AppArmor

### Utilisateur nextjs et permissions Docker

Par défaut, l'application s'exécute sous l'utilisateur `nextjs` (UID 1001). Pour utiliser le socket Docker, vous devez gérer les permissions au runtime.

**Solutions recommandées** :

#### Option 1 : Exécuter en tant que root (déconseillé en production)

```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --user root \
  --name oci-registry-browser \
  oci-registry-browser:latest
```

#### Option 2 : Utilisateur avec GID du groupe docker de l'hôte

Déterminez le GID du groupe docker sur l'hôte :
```bash
# Sur l'hôte
getent group docker
# Sortie : docker:x:999:user
```

Puis spécifiez l'utilisateur avec ce GID :
```bash
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --user 1001:999 \
  --name oci-registry-browser \
  oci-registry-browser:latest
```

#### Option 3 : Docker Compose avec user spécifique

```yaml
version: '3.8'
services:
  oci-registry-browser:
    image: oci-registry-browser:latest
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    user: "1001:999"  # UID:GID (999 = docker group sur la plupart des systèmes)
```

#### Option 4 : Modifier les permissions du socket (moins sécurisé)

```bash
# Sur l'hôte - ATTENTION : cela expose des risques de sécurité
sudo chmod 666 /var/run/docker.sock

# Puis lancer le conteneur normalement
docker run -d \
  -p 3000:3000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name oci-registry-browser \
  oci-registry-browser:latest
```

## 📊 Impact sur la taille de l'image

- **Docker CLI** : ~15 MB
- **Cosign** : ~40 MB
- **curl** : ~2 MB

Total : ~57 MB supplémentaires par rapport à l'image de base.

## 🧪 Tests

### Vérifier Docker CLI

```bash
docker exec oci-registry-browser docker --version
```

### Vérifier Cosign

```bash
docker exec oci-registry-browser cosign version
```

### Liste des images disponibles

```bash
docker exec oci-registry-browser docker images
```

## 📚 Références

- [Docker CLI Documentation](https://docs.docker.com/engine/reference/commandline/cli/)
- [Cosign Documentation](https://docs.sigstore.dev/cosign/overview/)
- [Sigstore Project](https://www.sigstore.dev/)
- [README-cosign.md](./README-cosign.md) - Documentation détaillée sur Cosign

## ⚙️ Variables d'environnement

Le Dockerfile utilise les variables suivantes (définies lors du build) :

- `NEXT_PUBLIC_BASE_PAGES_PATH`
- `NEXT_PUBLIC_BASE_PATH`
- `NEXT_PUBLIC_DEPLOYMENT`
- `NEXT_PUBLIC_VERSION`

Exemple de build avec arguments :

```bash
docker build \
  --build-arg NEXT_PUBLIC_DEPLOYMENT=production \
  --build-arg NEXT_PUBLIC_VERSION=0.2.1 \
  -t oci-registry-browser:0.2.1 \
  .
