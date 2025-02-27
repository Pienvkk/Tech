require('dotenv').config() 

const express = require('express')
const app = express()

app
    .use ('/', express.static('static'))
    .use (express.urlencoded({extended: true}))

    .set ('view engine', 'ejs')
    .set ('views', 'view')

    .get ('/', home)

    .listen(2828)


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`

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
    const Circuits = db.collection('Circuits')

    const sampleCircuit = await Circuits.findOne({})
    console.log('Circuit:', sampleCircuit)
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

// Start the webserver and listen for HTTP requests at specified port
app.listen(process.env.PORT, () => {
    console.log(`I did not change this message and now my webserver is listening at port ${process.env.PORT}`)
})



function home(req, res) {
    res.render('index.ejs')
}