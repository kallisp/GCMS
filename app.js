//  first time only - insert  "prestart": "npm install" in package.json

const express = require('express')
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');

const app = express()
const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'GCMS',
  password: 'kall1kall1',
  port: 5432,
})

client.connect(function (err) {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
})

app.use('/', express.static('app'))
app.use('/geoserver', proxy({ target: 'http://localhost:8080', changeOrigin: true }));
app.use(bodyParser.json()); // for parsing application/json

app.get('/persons', function (request, response) {
  client.query('SELECT * FROM persons', function (err, results) {
    response.json(results);
  })
});

app.get('/persons_graves', function (request, response) {
  console.log(request.param);
  var query = "SELECT graves.gid,persons.pid,persons_in_grave.pgid,diadromos,thesi,category,availability,grave_level,entry_date,exit_date,name,surname,father_name,mother_name,birth_date,death_date,age,death_place,geom\
  FROM graves\
  LEFT JOIN persons_in_grave ON graves.gid = persons_in_grave.gid\
  LEFT JOIN persons ON persons.pid = persons_in_grave.pid \
  WHERE diadromos='"+ request.param('diadromos') + "' " + "OR thesi='" + request.param('thesi') + "'";

  console.log(query);

  client.query(query, function (err, results) {
    if (err != undefined) {
      return response.status(500).send(err);
    }
    response.json(results);
  })
});

app.post('/persons_graves', function (request, response) {
  // console.log(request.body) //εμφανιση του body από το request
  var updatePersonsQuery = "UPDATE persons SET name='" + request.body.name +
    "', surname='" + request.body.surname +
    "', father_name='" + request.body.father_name +
    "', mother_name='" + request.body.mother_name + "'" +
    // ", birth_date=" + request.body.birth_date +
    // ", death_date=" + request.body.death_date +
    ", age=" + request.body.age +
    ", death_place='" + request.body.death_place +
    "' WHERE pid=" + request.body.pid;

  var updateGravesQuery = "UPDATE graves SET diadromos='" + request.body.diadromos +
    "', thesi='" + request.body.thesi +
    "', category='" + request.body.category +
    "', availability='" + request.body.availability +
    "' WHERE gid=" + request.body.gid;

  var updatePersonsInGraveQuery = "UPDATE persons_in_grave SET grave_level=" + request.body.grave_level +
    // ", entry_date=" + request.body.entry_date + ", exit_date=" + request.body.exit_date +
    " WHERE pgid= " + request.body.pgid;

  console.log(updatePersonsQuery)
  // console.log(updateGravesQuery)
  console.log(updatePersonsInGraveQuery)


  client.query(updateGravesQuery, function (err, results) {

    if (err != undefined) {
      console.warn(err);
      return response.status(500).send(err);;
    }

    client.query(updatePersonsQuery, function (err, results) {

      if (err != undefined) {
        console.warn(err);
        return response.status(500).send(err);;
      }

      client.query(updatePersonsInGraveQuery, function (err, results) {

        if (err != undefined) {
          console.warn(err);
          return response.status(500).send(err);
        }
        return response.status(200).end();
      })
    })
  })
});

app.get('/grave_history', function (request, response) {
  console.log(request.param);
  var query = "SELECT graves.gid,persons.pid,persons_in_grave.pgid,diadromos,thesi,category,availability,grave_level,entry_date,exit_date,name,surname,father_name,mother_name,birth_date,death_date,age,death_place,geom\
    FROM graves\
    LEFT JOIN persons_in_grave ON graves.gid = persons_in_grave.gid\
    LEFT JOIN persons ON persons.pid = persons_in_grave.pid \
    WHERE exit_date IS NOT NULL AND graves.gid = " + request.param('gid') + " ORDER BY entry_date ASC";

  console.log(query);

  client.query(query, function (err, results) {
    if (err != undefined) {
      return response.status(500).send(err);
    }
    response.json(results);
  })
});

// app.post('/insert_person', function (request, response) {
//   var insertPersonsQuery = "INSERT INTO persons (surname,name,father_name,mother_name,birth_date,death_date,age,death_place) VALUES '" + request.body.surname +
//     "', '" + request.body.name + "', '" + request.body.father_name + "', '" + request.body.mother_name + "', " + request.body.birth_date + ", " + request.body.death_date + 
//     ", " + request.body.age + ", '" + request.body.death_place + "'";

//     var updateGravesQuery = "UPDATE graves SET diadromos='" + request.body.diadromos +
//     "', thesi='" + request.body.thesi +
//     "', category='" + request.body.category +
//     "', availability='" + request.body.availability +
//     "' WHERE gid=" + request.body.gid;

//   var insertPersonsInGraveQuery = "INSERT INTO persons_in_grave (grave_level,entry_date,exit_date) VALUES " + request.body.grave_level + ", entry_date=" + request.body.entry_date + ", exit_date=" + request.body.exit_date +
//     " WHERE pgid= " + request.body.pgid;

//   console.log(insertPersonsQuery)
//   // console.log(updateGravesQuery)
//   console.log(insertPersonsInGraveQuery)


//   client.query(insertPersonsQuery, function (err, results) {

//     if (err != undefined) {
//       console.warn(err);
//       return response.status(500).send(err);;
//     }

//     client.query(updateGravesQuery, function (err, results) {

//       if (err != undefined) {
//         console.warn(err);
//         return response.status(500).send(err);;
//       }

//       client.query(insertPersonsInGraveQuery, function (err, results) {

//         if (err != undefined) {
//           console.warn(err);
//           return response.status(500).send(err);
//         }
//         return response.status(200).end();
//       })
//     })
//   })
// });

app.listen(8000, () => console.log('Example app listening on port 8000!'))