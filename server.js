require('dotenv').config() 

const express = require('express')
const app = express()

app
    .use(express.json())
    .use (express.urlencoded({extended: true}))
    .use ('/', express.static('static'))

    .set ('view engine', 'ejs')
    .set ('views', 'view')

    .get ('/', home)
    .get ('/login', login)
    .get ('/createAccount', createAccount)

    .listen(process.env.PORT, () => {
        console.log(`Webserver is listening at port ${process.env.PORT}`)
    })


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Formule1`

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
})

client.connect()
  .then(async() => {
    console.log('Database connection established')

    const db = client.db(process.env.DB_NAME)
    const users = db.collection('0Users')

    const sampleUsers = await users.findOne({})
    console.log('users:', sampleUsers)
})
  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)
})



app.get('/', (req, res) => {
    res.send('Hello World!')
})



// Middleware to handle not found errors - error 404
app.use((req, res) => {
    // log error to console
    console.error('404 error at URL: ' + req.url)
    // send back a HTTP response with status code 404
    res.status(404).send('404 error at URL: ' + req.url)
})

// Middleware to handle server errors - error 500
app.use((err, req, res) => {
    // log error to console
    console.error(err.stack)
    // send back a HTTP response with status code 500
    res.status(500).send('500: server error')
})



// Check of login request binnenkomt
app.post('/login', async (req, res) => {
    console.log('Received login request:', req.body); 
    res.send('Received request'); 
});

// Inloggen
app.post('/login', async (req, res) => {
    const { username, pass } = req.body

    try {
        const db = client.db(process.env.DB_NAME)
        const users = db.collection('0Users')

        // Zoek de gebruiker in de database
        const user = await users.findOne({ username: username, password: pass })

        if (!user) {
            return res.status(400).send('Ongeldige gebruikersnaam of wachtwoord')
        }

        // Login is succesvol
        res.send('Succesvol ingelogd!')

    } catch (error) {
        console.error('Login fout:', error)
        res.status(500).send('Er is iets misgegaan op de server')
    }
})


function home(req, res) {
    res.render('index.ejs')
}

function login(req, res) {
    res.render('login.ejs')
}

function createAccount (req, res) {
    res.render('createAccount.ejs')
}