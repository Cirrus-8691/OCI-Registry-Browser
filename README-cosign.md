# cosign

## Install cosign

https://edu.chainguard.dev/open-source/sigstore/cosign/how-to-install-cosign/

### Using Alpine Linux

Add Cosign with apk:

```bash
apk add cosign
```
see: https://github.com/sigstore/cosign/releases/download/v2.6.1/cosign_2.6.1_x86_64.apk

### For Ubuntu and Debian distributions, 

Check the releases page and download the latest .deb package. At the time of this writing, this would be version 2.5.0. To install the .deb file, run:

https://github.com/sigstore/cosign/releases

```bash
wget "https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64"
chmod +x cosign-linux-amd64
sudo mv cosign-linux-amd64 /usr/local/bin/cosign
# Test with
cosign version
```

## 🔑 Verify an image

```bash
cosign verify localhost:32000/node:24-alpine
```

Erreur: 
```
Error: --certificate-identity or --certificate-identity-regexp is required for verification in keyless mode
error during command execution: --certificate-identity or --certificate-identity-regexp is required for verification in keyless mode
```
### ✅ Comment vérifier une image Cosign

1. Trouver l'identité du signataire

```bash
# Cette commande va afficher l'identité (subject) et l'émetteur (issuer) du certificat
cosign verify --insecure-ignore-tlog localhost:32000/node:24-alpine
```

ou bien: 
```bash
Error: localhost:32000/node:24-alpine: no signatures associated
error during command execution: localhost:32000/node:24-alpine: no signatures associated
```

2. Exécuter la vérification avec l'identité

```bash
cosign verify \
    --certificate-identity "signer@example.com" \
    --certificate-oidc-issuer "https://issuer.com" \
    localhost:32000/node:24-alpine
```
