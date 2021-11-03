const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketteam.db");

const app = express();
app.use(express.json());

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    player_id: dbObject.player_id,
    player_name: dbObject.player_name,
    jersey_number: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// get all players
app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT *
    FROM cricket_team;
    `;
  const players = await db.all(playersQuery);
  response.send(players);
});
//post request

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postAllPlayerDetails = `
    INSERT INTO
        cricket_team(player_name, jersey_number, role)
    VALUES
        ('${playerName}','${jerseyNumber}','${role}')    
    `;
  const player = await db.run(postAllPlayerDetails);
  response.send("Player Added to Team");
});

module.exports = app;
//get player details

app.get("/players:/playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `
    SELECT *
    FROM cricket_team
    WHERE 
    player_id=${playerId}
    `;
  const player = await db.get(getPlayerDetails);
  response.send(convertDbObjectToResponseObject(player));
});
//update player details

app.put("/players:/playerId", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const { playerId } = request.params;
  const updatePlayerDetails = `
    UPDATE
        cricket_team
    SET
        player_name='${playerName}',
        jersey_number='${jerseyNumber}',
        role='${role}'
    WHERE
        player_id=${playerId};  
    `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});
//delete player
app.delete("/players:/playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlaterDetails = `
    DELETE
    FROM cricket_team
    WHERE 
    player_id=${playerId};
    `;
  await db.run(deletePlaterDetails);
  response.send("Player Removed");
});

module.exports = app;
