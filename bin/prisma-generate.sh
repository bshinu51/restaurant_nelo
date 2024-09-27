#!/bin/sh

# Check if NODE_ENV is set to "production"
if [ "$NODE_ENV" = "production" ]; then
  npm install --only=production
else
  npm install
fi

npx prisma migrate dev --name init
npx prisma generate --schema=./prisma/schema.prisma

# ./load-data.sh