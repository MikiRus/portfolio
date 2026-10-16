#!/usr/bin/env bash
# Деплой по SSH из GitHub Actions. Ключ CI в authorized_keys привязан к этому
# скрипту (command=...), поэтому выполнить что-то кроме деплоя им нельзя.
set -euo pipefail
target="${SSH_ORIGINAL_COMMAND:-${1:-}}"
case "$target" in
  portfolio | demo-blogger-crm | demo-admin) ;;
  *) echo "unknown target: '$target'" >&2; exit 2 ;;
esac

# Два деплоя одновременно не идут: второй ждёт первый.
exec 9>/var/lock/portfolio-deploy.lock
flock 9

cd "/opt/$target"
git fetch --quiet origin main
git reset --hard --quiet origin/main
echo "== $target @ $(git log -1 --format='%h %s')"

case "$target" in
  portfolio)
    cd deploy && docker compose up -d --build --remove-orphans
    ;;
  # Образы демо подхватит следующая песочница; запущенные доживут свой TTL.
  demo-blogger-crm)
    docker compose build api web
    ;;
  demo-admin)
    docker build -q -t demo-admin-web .
    ;;
esac
docker image prune -f >/dev/null
echo "== done"
