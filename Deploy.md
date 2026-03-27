# Deploy oci-registry-browser with Helm

## Settings Files

Create in ./Emoji/networking/values 3 files
- [IP-server].env         => ApiWeb Front ENVIRONMENT SETTINGS
- [IP-server].config.js   => Nextjs config file
- [IP-server].yaml        => Microk8s Ingress settings + ApiWeb Back ENVIRONMENT SETTINGS

## Deploy

```bash
IP_SERVER="192.168.0.30"
BUILD_IMAGE="true"
sudo ./deployImage.sh $IP_SERVER $BUILD_IMAGE

```

- N.B: 
  - IP_SERVER is used to find the right values .yaml file to use to deploy app.
  - We re-build Docker image with fresh NEXT_PUBLIC_ environment settings
    if BUILD_IMAGE="true"

## Deploy on DEV (192.168.0.30)

```bash
./deploy-dev.sh 
```

## Deploy on Inspiron (10.0.0.7)

```bash
./deploy-inspiron.sh 
```
