import bcrypt from "bcryptjs";
import { Client } from "pg";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const { username, password } = JSON.parse(event.body);

  if (!username || !password) {
    return { statusCode: 400, body: "Missing username or password" };
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await client.query(
      "INSERT INTO users (username, password) VALUES ($1, $2)",
      [username, hashedPassword]
    );
    return { statusCode: 200, body: "User created" };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  } finally {
    await client.end();
  }
}
