#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
red=$(tput setaf 1)
blue=$(tput setaf 4)
###############################################################
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "┃ 🔎 $blue$bold Looking for server IP $normal"
echo "┠─────────────────────────────────────"
###############################################################
INFOS=$(ip a | grep 'inet ' | grep /2  | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
SERVER_IP="127.0.0.1"
while IFS= read -r ROW; do
    echo "┃ 🖥️  Ip server: $blue$ROW$normal"
    if [ "${ROW:0:8}" == "192.168." ]; then
        SERVER_IP=$ROW
    elif ! [ "$SERVER_IP" == "127.0.0.1" ]; then
        SERVER_IP=$ROW
    fi
done <<< "$INFOS"
echo "┠─────────────────────────────────────"
echo "┃ 📌🖥️  Current server  Ip: $red$SERVER_IP$normal"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
