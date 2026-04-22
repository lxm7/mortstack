// ── Shared VPC ───────────────────────────────────────────────────────────────
// Single VPC for all AWS compute (Lambda, ECS, WebSocket).
// nat: "ec2" for dev/staging (~$3/mo), "managed" for production (~$32/mo).

export const vpc = new sst.aws.Vpc('Vpc', {
  nat: $app.stage === 'production' ? 'managed' : 'ec2',
});
