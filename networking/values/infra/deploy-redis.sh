#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
red=$(tput setaf 1)
blue=$(tput setaf 4)
################################################
APP="redis"
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🐋  DEPLOY $blue$bold$APP$normal                           ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo "..."
################################################
if ! [ $USER == "root" ]; then
  echo "$red┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$red┃$normal 🔥 FATAL ERROR: USER is not root"
  echo "$red┠────────────────────────────────────────────"
  echo "$red┃$normal  👤 USER is $red$USER$normal"
  echo "$red┃$normal  💲 Run ${blue}sudo $0 $1$normal"
  echo "$red┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
################################################
if ! [ $# -eq 1 ]; then
  echo "$red┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$red┃$normal 🔥FATAL ERROR: No arguments supplied for:"
  echo "$red┠────────────────────────────────────────────"
  echo "$red┃$normal ${bold}NAMESPACE${normal}"
  echo "$red┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$normal"
  exit 1
fi
NAMESPACE=$1
################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 📦 Deployment ♦️ $APP"
echo "┠────────────────────────────────────────────"
echo "┃ 🔵 Namespace: ${blue}$NAMESPACE$normal"
echo "┃ 🔵 Storage: ${blue}1Gi$normal"            # See pvc.yaml
echo "┃ 🔵 StorageClass: ${blue}nfs-csi$normal"   # See pvc.yaml
echo "┃ 🛃 redis-password ${blue}***$normal"      # see redis-secret.yaml
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
################################################
echo "✨ pvc..."
  #################################
  # Generate ecoded password with #
  # $ echo -n 'fred123' | base64  #
  #################################
sudo microk8s kubectl apply -n $NAMESPACE -f ./infra/redis-pvc.yaml
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴  pvc $APP"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
################################################
echo "✨ secret..."
sudo microk8s kubectl apply -n $NAMESPACE -f ./infra/redis-secret.yaml
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴  secret $APP"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
################################################
echo "✨ deployment..."
sudo microk8s kubectl apply -n $NAMESPACE -f ./infra/redis-statefulset.yaml
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴  deployment $APP"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi
################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 📤 Service $APP"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sudo microk8s kubectl apply -n $NAMESPACE -f ./infra/redis-service.yaml
if ! [ $? -eq 0 ]; then
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  echo "🔥FATAL ERROR: 🔴  service $APP"
  echo "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
  exit 1
fi


