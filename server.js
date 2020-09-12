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
        const result = await client.query('SELECT * FROM booklist')
        const results = { 'results': (result) ? result.rows : null}
        res.render('book-list', results )
        client.release()
    } catch (err) {
        console.log(err)
        res.send(err)
    }
})

app.get('/books/submit', (req, res) => res.render('book-submit'))

app.post('/books/submit', async (req, res) => {
    try {
        const client = await pool.connect()
        const sql = 'INSERT INTO booklist (title, author) VALUES ($1, $2)'
        const params = [req.body.title, req.body.author]
        client.query(sql, params)
        client.release();
        res.redirect('/books')
    } catch (err) {
        res.send(err)
    }
})

app.get('/books/delete/:id', async (req, res) => {
    try {
        const client = await pool.connect()
        const sql = 'DELETE FROM booklist WHERE id = $1'
        const params = [req.params.id]
        client.query(sql, params)
        client.release()
        res.redirect('/books')
    } catch (err) {
        res.send(err)
    }
})

app.get('/books/edit/:id', async (req, res) => {
    try {

        const client = await pool.connect()

        const sql = 'SELECT * FROM booklist WHERE id = $1'
        const params = [req.params.id]

        const result = await client.query(sql, params)

        res.render('book-update', { r: result.rows[0] })

    } catch (err) {
        res.send(err)
    }
})

app.post('/books/edit/:id', async (req, res) => {
    try {

        const client = await pool.connect()

        const sql = 'UPDATE booklist SET title = $1, author = $2 WHERE id = $3'
        const params = [req.body.title, req.body.author, req.params.id]

        const result = await client.query(sql, params)

        res.redirect('/books')

    } catch (err) {
        res.send(err)
        res.redirect('/')
    }
})

app.listen(PORT) 
console.log(`listening on ${ PORT }`)