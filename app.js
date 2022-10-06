const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const app = express();

const databasePath = path.join(__dirname, "covid19India.db");

app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    consol.log(`Error message: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertStateObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

const convertDistrictObjectToResponseObject = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/states/", async (request, response) => {
  const getState = `SELECT * FROM State`;
  const allStates = await database.all(getState);
  response.send(
    allStates.map((each) => convertStateObjectToResponseObject(each))
  );
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getState = `SELECT * FROM State WHERE state_id = ${stateId}`;
  const allStates = await database.all(getState);
  response.send(
    allStates.map((each) => convertStateObjectToResponseObject(each))
  );
});

app.post("/districts/", async (request, response) => {
  const { districtName, StateId, cases, cured, active, deaths } = request.body;
  const InsertData = `INSERT INTO District (district_name, state_id, cases, cured, active, deaths)
    VALUES ('${districtName}', ${StateId}, ${cases}, ${cured}, ${active}, ${deaths})`;
  await database.run(InsertData);
  response.send("District Successfully Added");
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetails = `SELECT * FROM District WHERE district_id = ${districtId}`;
  const districtDetails = await database.all(getDistrictDetails);
  response.send(
    districtDetails.map((each) => convertDistrictObjectToResponseObject(each))
  );
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteQuery = `DELETE FROM District WHERE District_id = ${districtId}`;
  await database.all(deleteQuery);
  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const insertQuery = `UPDATE District SET
    district_name = '${districtName}',
    state_id = ${StateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE
    district_id = ${districtId}`;
  await database.run(insertQuery);
  response.send("District Details Updated");
});

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const statsQuery = `SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive,
    SUM(deaths) as totalDeaths FROM District WHERE state_id = ${stateId}`;
  const stats = await database.all(statsQuery);
  response.send(stats);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getObjectQuery = `SELECT state_name FROM State JOIN District ON State.state_id = District.state_id WHERE district_id = ${districtId}`;
  const state = await database.all(getObjectQuery);
  response.send({ stateName: state.state_name });
});
module.exports = app;
