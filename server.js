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
    .get ('/accountPreferences', accountPreferences)

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


app.post('/accountPreferences', async (req, res) => {
    const {season, team, driver} = req.body;

    try {
        const db = client.db(process.env.DB_NAME);
        const users = db.collection('0Users');

        // Update user om zijn preferences toe te voegen
        await users.updateOne(
            { username: req.session.username},
            { $set: { firstSeason: season, team: team, driver: driver }}
          );
        console.log(season)
        console.log("Username to update:", req.session.username);
        res.send('Preferences succesfully added!');

    } catch (error) {
        console.error('Preferences adding error:', error);
        res.status(500).send('Server error');
    }
});


app.post('/createAccount', async (req, res) => {
    // Check of account creatie request binnenkomt
    console.log('Received account creation request:', req.body); 

    // Account aanmaken
    const { username, pass, email, date} = req.body;
    const formattedDate = date ? new Date(date) : null;

    try {
        const db = client.db(process.env.DB_NAME);
        const users = db.collection('0Users');

        // Kijkt of username al bestaat
        const existingUser = await users.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username taken');
        }
        const existingEmail = await users.findOne({ email:email });
        if (existingEmail) {
            return res.status(400).send('Email taken');
        }

        // Stopt nieuwe user in database
        await users.insertOne({ username: username, password: pass, email: email, date: formattedDate});
        
        const user = await users.findOne({ username: username, password: pass })
        req.session.username = {username}; 
        res.redirect('/accountPreferences');

        

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

function accountPreferences (req, res) {
    if (req.session.user) {
        res.render('accountPreferences.ejs', { user: req.session.user });
    } else {
        res.render('accountPreferences.ejs', { user: null });    
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
