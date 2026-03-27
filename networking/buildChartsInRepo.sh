#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
underline=$(tput smul)
red=$(tput setaf 1)
blue=$(tput setaf 4)
################################################
REGISTERY_URI="localhost:32000"
################################################
CHART="oci-registry-browser"
VERSION=$1
################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ ☸️  Build Helm$blue$bold $CHART$normal chart ┃" 
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
if ! [ $USER == "root" ]; then
  echo "$red┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$red┃$normal 🔥 FATAL ERROR: USER is not root"
  echo "$red┠────────────────────────────────────────────"
  echo "$red┃$normal  👤 USER is $red$USER$normal"
  echo "$red┃$normal  💲 Run ${blue}sudo $0 $1$normal"
  echo "$red┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
if ! [ $# -eq 1 ]; then
  echo "$red┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$red┃$normal 🔥FATAL ERROR: No arguments supplied for:"
  echo "$red┠────────────────────────────────────────────"
  echo "$red┃$normal ${bold}VERSION${normal}"
  echo "$red┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$normal"
  exit 1
fi

cd helm-chart/
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 🐋  Build Docker images in repository"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./buildPushChart.sh $CHART $VERSION $REGISTERY_URI
if ! [ $? -eq 0 ]; then exit 1; fi
################################################

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 😀 Build Helm chart completed    ┃"
echo "┠──────────────────────────────────┨"
echo "┃ ✅ ${blue}${bold}$CHART $VERSION${normal}    ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"

exit 0