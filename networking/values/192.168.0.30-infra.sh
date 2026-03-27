#!/bin/bash
bold=$(tput bold)
normal=$(tput sgr0)
red=$(tput setaf 1)
blue=$(tput setaf 4)
################################################
APP_INSTALLED="oci-registry-browser"
NAMESPACE="oci-registry-browser"
echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ ☸️  microk8s infra for $blue$bold$APP_INSTALLED$normal ┃" 
echo "┠────────────────────────────────────────────"
echo "┃ 🛃 Namespace: $NAMESPACE"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
echo "."
sudo ./infra/deploy-redis.sh $NAMESPACE

# TODO PostgreSQL
# Cet env de test utilise son PostgreSql

echo "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"
echo "┃ 🟢  $blue$bold$APP_INSTALLED$normal ready 😀          ┃"
echo "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"
