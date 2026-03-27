# How to build Docker image

# Use script

To build Docker image and push it to microk8s Container Registery.

```bash
IP_SERVER="192.168.0.30"
./buildImage.sh $IP_SERVER
```

```bash
IP_SERVER="10.0.0.7"
./buildImage.sh $IP_SERVER
```

- N.B: IP_SERVER is used to find the right .env file to use to build docker image.

# Manual process

## Build image

```bash
IMAGE_NAME="oci-registry-browser"
IMAGE_VERSION="0.1.0"
docker build --pull --rm -f Dockerfile -t $IMAGE_NAME:$IMAGE_VERSION "."
```

## Check image
```bash
IMAGE_NAME="oci-registry-browser"
IMAGE_VERSION="0.1.0"
docker run -it $IMAGE_NAME:$IMAGE_VERSION sh
# ou
docker run -it $IMAGE_NAME:$IMAGE_VERSION bash
```
In image check files 
```bash
ls -la
# ...

exit
```
