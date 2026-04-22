import { vpc } from './vpc';
import { secrets } from './secrets';

// ── WebSocket API (API Gateway v2) ──────────────────────────────────────────
// Serverless WebSocket — scales to zero, pay per message.
// Free tier: 1M messages + 750K connection-minutes/month (12 months).
//
// Flow:
//   Client connects → $connect Lambda stores connectionId in Upstash Redis
//   Client disconnects → $disconnect Lambda removes connectionId
//   Server-side event → fan-out Lambda reads connections from Redis,
//                       calls postToConnection for each
//
// STUB: Lambda handlers not yet implemented.
// To activate:
//   1. Create services/realtime/src/connect.ts
//   2. Create services/realtime/src/disconnect.ts
//   3. Create services/realtime/src/broadcast.ts
//   4. Uncomment below

// export const ws = new sst.aws.ApiGatewayWebSocket('Realtime');
//
// ws.route('$connect', {
//   handler: 'services/realtime/src/connect.handler',
//   link: [...secrets],
// });
//
// ws.route('$disconnect', {
//   handler: 'services/realtime/src/disconnect.handler',
//   link: [...secrets],
// });
//
// // Called by other Lambdas (via function invoke or Kafka consumer)
// // to push events to connected clients
// export const broadcastFunction = new sst.aws.Function('Broadcast', {
//   handler: 'services/realtime/src/broadcast.handler',
//   link: [...secrets],
//   environment: {
//     WEBSOCKET_API_ENDPOINT: ws.managementEndpoint,
//   },
// });
