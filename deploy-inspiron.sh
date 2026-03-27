#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
red=$(tput setaf 1)
blue=$(tput setaf 4)
###############################################################
FILES_IP="10.0.0.7"
###############################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🛠️        $blue$bold Deploy emoji$red DELL $normal        ┃"
echo "┠─────────────────────────────────────┨"
echo "┃ 📑 Using files for Ip:$red $FILES_IP$normal     ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
./scripts/ip-server.sh
sudo ./deployImage.sh $FILES_IP "true"