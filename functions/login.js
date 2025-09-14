import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

  try {
    const res = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (res.rows.length === 0) {
      return { statusCode: 401, body: "Invalid username or password" };
    }

    const user = res.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return { statusCode: 401, body: "Invalid username or password" };
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { statusCode: 200, body: JSON.stringify({ token }) };
  } catch (err) {
    return { statusCode: 500, body: "Error: " + err.message };
  } finally {
    await client.end();
  }
}
