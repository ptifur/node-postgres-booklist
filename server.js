const express = require('express')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 5000
const app = express()

require('dotenv').config()

const { Pool } = require('pg')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
})

// view engine
app.set('view engine', 'ejs')

// middleware static
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// routes
app.get('/', (req, res) => res.render('home'))
app.get('/books', async (req, res) => {
    try {
        const client = await pool.connect()
        const result = await client.query('SELECT * FROM booklist');
        const results = { 'results': (result) ? result.rows : null};
        res.render('book-list', results );
        client.release();
    } catch(err) {
        console.log(err)
        res.send('error ' + err)
    }
})

app.listen(PORT) 
console.log(`listening on ${ PORT }`)