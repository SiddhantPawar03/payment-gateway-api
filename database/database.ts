import { DBInterface } from "../interfaces/dbInterface";
import { Client, QueryResult } from "pg";
const { DATABASE_PASSWORD } = process.env;


const client = new Client({
  host: "localhost",
  user: "postgres",
  password: DATABASE_PASSWORD, 
  port: 5432,
  database: "paymentGateway",
});

client.connect((err) => {
  if (err) {
    console.error('Connection Error', err);
  } else {
    console.log('Database Connected Successfully!');
  }
});

async function insertPaymentData(data: DBInterface): Promise<QueryResult> {
  try {
    return client.query(`
      INSERT INTO payment (amount, contact, name, email, order_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [data.amount, data.contact, data.name, data.email, data.order_id]);
  } catch (err) {
    throw err;
  }
}

async function getAllPaymentsData(): Promise<DBInterface[]> {
  try {
    const result = await client.query(`
      SELECT * FROM payment
    `);
    return result.rows;
  } catch (err) {
    throw err;
  }
}

export {
  client,
  insertPaymentData,
  getAllPaymentsData,
};
