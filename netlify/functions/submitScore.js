import { Client } from "pg";

export async function handler(event) {
  const { userId, score } = JSON.parse(event.body);

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  await client.connect();

  await client.query("INSERT INTO scores (user_id, score) VALUES ($1, $2)", [userId, score]);

  await client.end();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Score submitted" })
  };
}
