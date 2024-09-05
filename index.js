require("dotenv").config();

const pg = require("pg");
const express = require("express");
const client = new pg.Client(process.env.DATABASE_URL);

const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

//GET ROUTE
app.get("/api/flavors", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

//POST
app.post("/api/flavors", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
      INSERT INTO flavors(iceCream_name, is_favorite)
      VALUES($1, $2)
      RETURNING *
      `;

    const response = await client.query(SQL, [
      req.body.iceCream_name,
      req.body.is_favorite || false,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//UPDATE (PUT)
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
        UPDATE flavors
        SET iceCream_name=$1, is_favorite=$2, updated_at=now()
        WHERE id=$3 RETURNING *
      `;
    const response = await client.query(SQL, [
      req.body.iceCream_name,
      req.body.is_favorite,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    const SQL = /* sql */ `
          DELETE FROM flavors WHERE id = $1
        `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");

  SQL = /* sql */ `
    DROP TABLE IF EXISTS flavors;

    CREATE TABLE flavors (
      id SERIAL PRIMARY KEY,
      is_favorite BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      iceCream_name VARCHAR(255)
    );
  `;

  await client.query(SQL);

  SQL = /* sql */ `
  INSERT INTO flavors(iceCream_name, is_favorite) VALUES('Chocolate', true);
  INSERT INTO flavors(iceCream_name, is_favorite) VALUES('Vanilla', true);
  INSERT INTO flavors(iceCream_name, is_favorite) VALUES('Strawberry', false);
`;

  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();
