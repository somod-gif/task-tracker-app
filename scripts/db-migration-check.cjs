/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const { Client } = require("pg");

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const checks = {
    taskWorkType: await client.query("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TaskWorkType') AS ok"),
    taskAssignmentTable: await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'TaskAssignment') AS ok"),
    taskSummaryColumn: await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'summary') AS ok"),
    taskWorkTypeColumn: await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'workType') AS ok"),
    taskAssignedAtColumn: await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Task' AND column_name = 'assignedAt') AS ok"),
    sprintTable: await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Sprint') AS ok"),
    sprintType: await client.query("SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SprintType') AS ok"),
  };

  for (const [name, result] of Object.entries(checks)) {
    console.log(name, Boolean(result.rows[0]?.ok));
  }

  await client.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
