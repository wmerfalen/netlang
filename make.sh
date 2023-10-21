#!/bin/bash
cp _tsconfig.json tsconfig.json
tsc
#cp ./dist/server/src/app/services/incident/create.js* ./server/src/app/services/incident/
cp ./dist/cli.js ./server/src/
cp ./dist/app/services/incident/create.js* ./server/src/app/services/incident/
cp ./dist/server/src/app/controllers/incidentController.js* ./server/src/app/controllers/
# MacOS: this doesn't work
#cp ./dist/app/controllers/notificationsController.js* ./server/src/app/controllers/
# However, this does:
cp ./dist/server/src/app/controllers/notificationsController.js* ./server/src/app/controllers/
cp ./dist/app/controllers/incidentController.js* ./server/src/app/controllers/
cp ./dist/server/src/utils/index.js* ./server/src/utils/
# TODO: why is this here and not prefixed with ./dist/server/src ??
#cp ./dist/app/controllers/incidentController.js* ./server/src/app/controllers/
cp ./dist/app/models/pushNotifications.js* ./server/src/app/models/
cp ./dist/app/models/pushNotificationsQueueLog.js* ./server/src/app/models/
cp ./dist/app/services/user/updateUser.js* server/src/app/services/user/
cp ./dist/app/services/auth/refresh.js* server/src/app/services/auth/
cp ./dist/app/services/auth/token.js* server/src/app/services/auth/
cp ./dist/app/services/push-notifications/incident-notifier.js* ./server/src/app/services/push-notifications/
cp ./dist/app/services/push-notifications/one-signal.js* ./server/src/app/services/push-notifications/
cp ./dist/app/services/push-notifications/queue-worker.js* ./server/src/app/services/push-notifications/
