const express = require('express')
var proxy = require('http-proxy-middleware');
const app = express()
const { Client } = require('pg')
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'GCMS',
    password: 'kall1kall1',
    port: 5432,
})

client.connect(function(err){
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })

/*const query = 'SELECT diadromos, thesi, surname, name, father_name, mother_name, birth_date, death_date, age, death_place, category, availability' FROM graves, persons, persons_in_grave
WHERE ((graves.gid = persons_in_grave.gid) AND (persons.pid = persons_in_grave.pid));*/

app.use('/', express.static('app'))
app.use('/geoserver', proxy({ target: 'http://localhost:8080', changeOrigin: true }));

app.get('/persons',function(request, response) {
  client.query('SELECT * FROM persons', function(err,results) {
    response.json(results);
  })
});

app.get('/persons_graves',function(request, response) {
  client.query('SELECT diadromos, thesi, surname, name, father_name, mother_name, birth_date, death_date, age, death_place, category, availability \
                FROM graves, persons, persons_in_grave \
                WHERE ((graves.gid = persons_in_grave.gid) AND (persons.pid = persons_in_grave.pid))', function(err,results) {
    response.json(results);
  })
});
 
// 

//app.post('/persons', function (request, response) {

    /// ... code

    //..

    // client.query(query, (err, res) => {
    //     console.log(err ? err.stack : res.rows[0].message) // Hello World!

    //     response.send('posted in /persons');


    //     client.end()
    //   })


///*});

//app.put('/persons', function (request, response) {

   // response.json({ name: 'mike' });
//});

app.listen(8000, () => console.log('Example app listening on port 8000!'))