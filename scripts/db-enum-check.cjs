/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv/config");

const { Client } = require("pg");

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const role = await client.query(
    "SELECT enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'Role' ORDER BY enumsortorder",
  );
  const types = await client.query(
    "SELECT typname FROM pg_type WHERE typname IN ('TaskWorkType', 'SprintType') ORDER BY typname",
  );

  console.log("Role enum values:", role.rows.map((row) => row.enumlabel));
  console.log("Types present:", types.rows.map((row) => row.typname));

  await client.end();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
