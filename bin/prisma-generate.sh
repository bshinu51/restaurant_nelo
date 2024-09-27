#!/bin/sh

# Check if NODE_ENV is set to "production"
if [ "$NODE_ENV" = "production" ]; then
  npm install --only=production
else
  npm install
fi

npx prisma generate