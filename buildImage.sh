#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
underline=$(tput smul)
red=$(tput setaf 1)
blue=$(tput setaf 4)
white=$(tput setaf 7)
###############################################################
REGISTERY_URI="localhost:32000"
ACCESS_KEY="fred" # Not used by Microk8s container-registery but required by docker
SECRET_KEY="fred" # Not used by Microk8s container-registery but required by docker
## next.config ################################################
IMAGE_NAME="oci-registry-browser"
IMAGE_VERSION=$(jq -r '.version' package.json) # Read version form package.json
###############################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 🐋  Build Docker images in repository"
echo "┠────────────────────────────────────────────"
###############################################################
if ! [ $# -eq 1 ]; then
  echo "$red┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$red┃$white 🔥FATAL ERROR: No arguments supplied for environment ${bold}[ip-server]${normal}"
  echo "$red┠────────────────────────────────────────────"
  echo "$red┃$white $ sudo ./deploy.sh ${bold}192.168.0.30${normal}"
  echo "$red┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ls networking/values
  exit 1
fi
IP_SERVER=$1
echo "┃ 📌🖥️  Expecting server IP: $blue$bold$IP_SERVER$white$normal"
echo "┠────────────────────────────────────────────"
###############################################################
CONFIG_FILE="networking/values/$IP_SERVER.config.js"
if ! [ -f $CONFIG_FILE ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 $CONFIG_FILE doesn'n exist! "
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  ls networking/values/*.config.js
  exit 1
fi
###############################################################
ENV_FILE="networking/values/$IP_SERVER.env"
if ! [ -f $ENV_FILE ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 $ENV_FILE doesn'n exist! "
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  ls networking/values/*.env
  exit 1
fi
echo "┃ 🛃  Check ${yellow}${bold}$ENV_FILE$normal file "
echo "┠────────────────────────────────────────────"
NEXT_PUBLIC_VERSION=$IMAGE_VERSION
echo "┃ ${blue}NEXT_PUBLIC_VERSION=$red${bold}$NEXT_PUBLIC_VERSION$normal"
NEXT_PUBLIC1="false"
NEXT_PUBLIC2="false"
NEXT_PUBLIC3="false"
while IFS= read -r ROW; do
  if [[ "$ROW" == "NEXT_PUBLIC_BASE_PAGES_PATH"* ]]; then
    NEXT_PUBLIC1="true"
    NEXT_PUBLIC_BASE_PAGES_PATH="${ROW:28}"
    echo "┃ ${blue}NEXT_PUBLIC_BASE_PAGES_PATH=$red${bold}$NEXT_PUBLIC_BASE_PAGES_PATH$normal"

  elif [[ "$ROW" == "NEXT_PUBLIC_BASE_PATH"* ]]; then
    NEXT_PUBLIC2="true"
    NEXT_PUBLIC_BASE_PATH="${ROW:22}"
    echo "┃ ${blue}NEXT_PUBLIC_BASE_PATH=$red${bold}$NEXT_PUBLIC_BASE_PATH$normal"

  elif [[ "$ROW" == "NEXT_PUBLIC_DEPLOYMENT"* ]]; then
    NEXT_PUBLIC3="true"
    NEXT_PUBLIC_DEPLOYMENT="${ROW:23}"
    echo "┃ ${blue}NEXT_PUBLIC_DEPLOYMENT=$red${bold}$NEXT_PUBLIC_DEPLOYMENT$normal"

  else
    echo "┃ $white$ROW$normal"
  fi
done < "$ENV_FILE"
echo "┠────────────────────────────────────────────"
if [ "$NEXT_PUBLIC1" == "false" ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 $ENV_FILE without NEXT_PUBLIC_BASE_PAGES_PATH"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
if [ "$NEXT_PUBLIC2" == "false" ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 $ENV_FILE without NEXT_PUBLIC_BASE_PATH"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
if [ "$NEXT_PUBLIC3" == "false" ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 $ENV_FILE without NEXT_PUBLIC_DEPLOYMENT"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
###############################################################
echo "┃ 🐳👤 Docker login:"
echo "┃       $blue$bold$REGISTERY_URI$white$normal"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker login $REGISTERY_URI --username "$ACCESS_KEY" --password-stdin <<< "$SECRET_KEY"
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 Docker login $REGISTERY_URI"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  docker logout $REGISTERY_URI
  exit 1
fi
## next.config ################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 🐳⏰ Docker build image"
echo "┠────────────────────────────────────────────"
echo "┃${blue}${bold} name    : $IMAGE_NAME${normal}"
echo "┃${blue}${bold} version : $IMAGE_VERSION${normal}"
echo "┃ If nothing else changes, rebuild image with new version..."
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

## next.config ################################################
mv next.config.js next.config.bak
cp $CONFIG_FILE next.config.js
###############################################################

docker build .\
  --build-arg NEXT_PUBLIC_BASE_PAGES_PATH="$NEXT_PUBLIC_BASE_PAGES_PATH" \
  --build-arg NEXT_PUBLIC_BASE_PATH="$NEXT_PUBLIC_BASE_PATH" \
  --build-arg NEXT_PUBLIC_DEPLOYMENT="$NEXT_PUBLIC_DEPLOYMENT" \
  --build-arg NEXT_PUBLIC_VERSION="$NEXT_PUBLIC_VERSION" \
  -f Dockerfile -t $IMAGE_NAME:$IMAGE_VERSION
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 Docker build $IMAGE_NAME"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  docker logout $REGISTERY_URI
  mv next.config.bak next.config.js
  exit 1
fi

## next.config ################################################
mv next.config.bak next.config.js
###############################################################

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 🏷️⏰ Docker tag image $IMAGE_NAME"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker tag $IMAGE_NAME:$IMAGE_VERSION $REGISTERY_URI/$IMAGE_NAME:$IMAGE_VERSION
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 Docker tag $IMAGE_NAME"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  docker logout $REGISTERY_URI
  exit 1
fi

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 📤⏰ Docker push image $IMAGE_NAME"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker push $REGISTERY_URI/$IMAGE_NAME:$IMAGE_VERSION
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴 Docker push $IMAGE_NAME"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  docker logout $REGISTERY_URI
  exit 1
fi

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🛂 Check container-registry      ┃"
echo "┠──────────────────────────────────┨"
echo "┃ Catalog                          ┃"
curl -X GET http://$REGISTERY_URI/v2/_catalog
echo "┠──────────────────────────────────┨"
echo "┃ $bold$CHART$normal Tags list"
curl -X GET http://$REGISTERY_URI/v2/$IMAGE_NAME/tags/list
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

docker logout $REGISTERY_URI

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 😀  easiware docker repository   ┃"
echo "┠──────────────────────────────────┨"
echo "┃ ✅ ${blue}${bold}$REGISTERY_URI${normal}"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

exit 0