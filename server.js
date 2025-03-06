require('dotenv').config() 

const express = require('express')
const app = express()

const session = require('express-session')

app.use(session({
    secret: 'your-secret-key', // Verander dit naar een veilige string!
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Zet op 'true' als je HTTPS gebruikt
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});





app
    .use(express.json())
    .use (express.urlencoded({extended: true}))
    .use ('/', express.static('static'))

    .set ('view engine', 'ejs')
    .set ('views', 'view')

    .get ('/', home)
    .get ('/login', login)
    .get ('/createAccount', createAccount)
    .get ('/quiz', quiz)
    .get ('/teamUp', teamUp)
    .get ('/community', community)
    .get ('/archive', archive)
    .get ('/helpSupport', helpSupport)
    
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




// Connect met database voor users
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





app.post('/createAccount', async (req, res) => {
    // Check of account creatie request binnenkomt
    console.log('Received account creation request:', req.body); 

    // Account aanmaken
    const { username, pass } = req.body;

    try {
        const db = client.db(process.env.DB_NAME);
        const users = db.collection('0Users');

        // Kijkt of username al bestaat
        const existingUser = await users.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username taken');
        }

        // Stopt nieuwe user in database
        await users.insertOne({ username: username, password: pass });

        res.send('Account successfully created!');

    } catch (error) {
        console.error('Account creation error:', error);
        res.status(500).send('Server error');
    }
});






app.post('/login', async (req, res) => {
    // Check of login request binnenkomt
    console.log('Received login request:', req.body); 

    // Inloggen
    const { username, pass } = req.body

    try {
        const db = client.db(process.env.DB_NAME)
        const users = db.collection('0Users')

        // Zoek de gebruiker in de database
        const user = await users.findOne({ username: username, password: pass })

        if (!user) {
            return res.status(400).send('Ongeldige gebruikersnaam of wachtwoord')
        }

        // Login is succesvol - Sla de gebruiker op in de sessie
        req.session.user = { username: user.username };

        // Login is succesvol - Redirect naar homepagina
        res.redirect('/');

    } catch (error) {
        console.error('Login fout:', error)
        res.status(500).send('Er is iets misgegaan op de server')
    }
})





// Uitloggen
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});





// Functies
function home(req, res) {
    if (req.session.user) {
        res.render('index.ejs', { user: req.session.user });
    } else {
        res.render('index.ejs', { user: null });
    }
}

function login(req, res) {
    if (req.session.user) {
        res.render('login.ejs', { user: req.session.user });
    } else {
        res.render('login.ejs', { user: null });
    }
}

function createAccount (req, res) {
    if (req.session.user) {
        res.render('createAccount.ejs', { user: req.session.user });
    } else {
        res.render('createAccount.ejs', { user: null });    
    }
}

function quiz (req, res) {
    if (req.session.user) {
        res.render('quiz.ejs', { user: req.session.user });
    } else {
        res.render('quiz.ejs', { user: null });    
    }
}

function teamUp (req, res) {
    if (req.session.user) {
        res.render('teamUp.ejs', { user: req.session.user });
    } else {
        res.render('teamUp.ejs', { user: null });  
    }
}

function community (req, res) {
    if (req.session.user) {
        res.render('community.ejs', { user: req.session.user });
    } else {
        res.render('community.ejs', { user: null });  
    }
}

function archive (req, res) {
    if (req.session.user) {
        res.render('archive.ejs', { user: req.session.user });
    } else {
        res.render('archive.ejs', { user: null });  
    }
}

function helpSupport (req, res) {
    if (req.session.user) {
        res.render('helpSupport.ejs', { user: req.session.user });
    } else {
        res.render('helpSupport.ejs', { user: null });  
    }
}




// Middleware voor not found errors - error 404
app.use((req, res) => {
    // log error to console
    console.error('404 error at URL: ' + req.url)
    // send back a HTTP response with status code 404
    res.status(404).send('404 error at URL: ' + req.url)
})

// Middleware voor server errors - error 500
app.use((err, req, res) => {
    // log error to console
    console.error(err.stack)
    // send back a HTTP response with status code 500
    res.status(500).send('500: server error')
})

// Quiz vragen functie


async function run() {
  try {
    await client.connect();
    // database and collection code goes here
    const db = client.db("`Formule1");
    const coll = db.collection("0Questions");
    // find code goes here
    const cursor = coll.find();
    // iterate code goes here
    await cursor.forEach(console.log);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}}

