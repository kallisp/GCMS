const express = require('express')
var proxy = require('http-proxy-middleware');
const app = express()

app.use('/', express.static('app'))
app.use('/geoserver', proxy({target: 'http://localhost:8080', changeOrigin: true}));
// app.get('/', (req, res) => res.view('/index.html'))
// 
app.listen(8000, () => console.log('Example app listening on port 8000!'))