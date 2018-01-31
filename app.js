const express = require('express')
var proxy = require('http-proxy-middleware');
const app = express()
const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'kall1kall1',
    port: 5432,
})

client.connect((err) => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })

const query = 'SELECT diadromos, thesi, surname, name, father_name, mother_name, birth_date, death_date, age, death_place, category, availability' FROM graves, persons, persons_in_grave
WHERE ((graves.gid = persons_in_grave.gid) AND (persons.pid = persons_in_grave.pid));

app.use('/', express.static('app'))
app.use('/geoserver', proxy({ target: 'http://localhost:8080', changeOrigin: true }));
// app.get('/', (req, res) => res.view('/index.html'))
// 

app.post('/persons', function (request, response) {

    /// ... code

    //..

    // client.query(query, (err, res) => {
    //     console.log(err ? err.stack : res.rows[0].message) // Hello World!

    //     response.send('posted in /persons');


    //     client.end()
    //   })


});

app.put('/persons', function (request, response) {

    response.json({ name: 'mike' });
});

app.listen(8000, () => console.log('Example app listening on port 8000!'))