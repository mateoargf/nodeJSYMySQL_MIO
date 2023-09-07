const express = require('express')
const mysql = require('mysql')
const path = require('path')
const session = require('express-session')
require('dotenv').config()


const app = express()

//variables de entorno
app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: true
}))

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
}

const conexion = mysql.createConnection(dbConfig)

conexion.connect((error) => {
    if (error) {
        console.log('error al conectar', error)
    } else {
        console.log('conexion exitosa')
    }
})


app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/home', (req, res) => {
    //res.send('<h1>hola mundo</h1>')
    res.sendFile(path.join(__dirname + '/public/index.html'))
})

app.post('/envio', (req, res) => {

    let username = req.body.usuario
    let password = req.body.password

    //throw => objeto o error durante la ejecicion del programa
    if (username && password) {
        conexion.query('SELECT * FROM cuentas WHERE usuario = ? AND password = ?', [username, password], (error, resultado, fields) => {
            console.log(resultado)
            if (error) throw error;
            if (resultado.length > 0) {
                console.log('el usuario está')
                req.session.loggedin = true
                req.session.username = username
            } else {
                console.log('el usuario no se encuentra')
            }
            res.redirect('/dashboard')
        })
    } else {
        // res.send('por favor ingrese usuario y contraseña')
        res.redirect('/home')
        res.end()
    }
})

app.get('/dashboard', (req, res) => {
    req.session.views++
    if (req.session.loggedin) {
        res.send('te registraste y tu nombre es' + req.session.username)
    } else {
        res.send('inicia sesión para ver la página')
    }
})

app.listen(3009, () => {
    console.log('servidor ejecutandose')
})