const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;
const initializeDBAndServer = async () => {
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
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// Get Movie API 1
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT
      movie_name
    FROM
      movie     
      ;`;
  const movieArray = await db.all(getMovieQuery);
  const objectMovieArray = movieArray.map((moviename) => {
    return convertDbObjectToResponseObject(moviename);
  });
  response.send(objectMovieArray);
});

// API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        ${directorId},
       '${movieName}',
       '${leadActor}'
        
      );`;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  const movieObjectModifed = convertDbObjectToResponseObject(movie);
  response.send(movieObjectModifed);
});

//API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
  update movie set 
  director_id = ${directorId},
  movie_name = '${movieName}',
  lead_actor = '${leadActor}'
  where movie_id = ${movieId};
  `;
  const dbResponse = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

// api 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuary = `
    delete from movie where movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuary);
  response.send("Movie Removed");
});

//-----------------------------------------------
const convertDbObjectToResponseObjectDirector = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//--------------------------------------------------

//api 6

app.get("/directors/", async (request, response) => {
  const getDirecorsQuery = `SELECT
      *
    FROM
      director   
      ;`;
  const directorArray = await db.all(getDirecorsQuery);
  const objectDirectorArray = directorArray.map((directorrecords) => {
    return convertDbObjectToResponseObjectDirector(directorrecords);
  });
  response.send(objectDirectorArray);
});

//API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id = ${directorId};`;
  const movieArray = await db.all(getDirectorQuery);
  const objectMovieArray = movieArray.map((moviename) => {
    return convertDbObjectToResponseObject(moviename);
  });
  response.send(objectMovieArray);
});

module.exports = app;
