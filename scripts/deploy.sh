#!/usr/bin/env bash
#
# Deploy Agendain ke VPS aaPanel.
#
#   bash /www/wwwroot/agendain/scripts/deploy.sh
#
# `set -euo pipefail` itu inti skrip ini. Versi lama (daftar Commands aaPanel)
# tidak punya guard, sehingga `prisma db push` yang gagal lewat tanpa terlihat
# dan deploy lanjut ke `npm run build` seolah sukses — DB tidak pernah berubah.
# Itulah yang membuat 14 error P2021 lolos senyap sampai 17 Agustus 2026.
#
# LARANGAN: jangan pakai `prisma migrate reset` / `migrate deploy` di repo ini.
# Alur schema-nya `prisma db push`. Folder `prisma/migrations/` sudah dihapus
# justru agar kedua perintah itu tidak bisa mengembalikan struktur lama dan
# menghapus seluruh data production (pernah terjadi 18 Agustus 2026).
set -euo pipefail

APP_DIR=/www/wwwroot/agendain
PM2=/www/server/nodejs/v24.13.0/bin/pm2
PORT=3005
export PM2_HOME=/root/.pm2

cd "$APP_DIR"

echo "==> [1/6] git pull"
# Buang lockfile kotor hasil `npm install` di server agar pull tidak abort.
git checkout -- package-lock.json 2>/dev/null || true
git pull origin main

echo "==> [2/6] npm install"
npm install

echo "==> [3/6] prisma db push + generate"
npx prisma db push
npx prisma generate

# Seeder memakai upsert dengan update aktif: inilah cara konten CMS di kode
# (home_settings dll) tersinkron ke DB. Catatan: seeder juga menjalankan
# deleteMany pada privateTripPackage, jadi paket private trip ditulis ulang
# setiap deploy. Lewati dengan: SEED=0 bash scripts/deploy.sh
if [ "${SEED:-1}" = "1" ]; then
  echo "==> [4/6] prisma db seed"
  npx prisma db seed
else
  echo "==> [4/6] prisma db seed (DILEWATI, SEED=0)"
fi

echo "==> [5/6] build"
npm run build

echo "==> [6/6] restart pm2"
# restart bila proses sudah ada; start bila belum (deploy pertama).
"$PM2" restart agendain --update-env || "$PM2" start "npm run start -- -p $PORT" --name agendain
"$PM2" save

echo
echo "==> SELESAI. Status:"
"$PM2" list
