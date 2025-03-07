require('dotenv').config() 

const express = require('express')
const app = express()
const multer = require('multer')

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
    .get ('/quiz', quiz)
    .get ('/teamUp', teamUp)
    .get ('/community', community)
    .get ('/createPost', createPost)
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
            { username: req.session.user.username },
            { $set: { firstSeason: season, team: team, driver: driver }}
          );
        console.log(season)
        console.log("Username to update:", req.session.username);
        res.redirect('/')

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
        req.session.user = { username }; 
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
});



// Uitloggen
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.post('/createPost', async (req, res) => {
    console.log('Received post creation request:', req.body); 

    const { title, content, file } = req.body;

    if (!req.session.user) {
        return res.status(401).send('You must be logged in to create a post.');
    }

    try {
        const db = client.db(process.env.DB_NAME);
        const posts = db.collection('0Posts');

        const username = req.session.user.username; // Retrieve the username

        console.log('Username:', username);

        await posts.insertOne({ user: username, title: title, content: content, file: file });

        res.redirect('/community'); // Redirect to community page after posting

    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).send('Server error');
    }
});

// Quiz

app.get('/quiz', async (req, res) => {

    console.log('Vraag vraag:', req.body); 

    try {

        const db = client.db(process.env.DB_NAME)
        const questions= db.collection('0Questions')

          // Haal alle vragen op en zet ze in een array
          const allQuestions = await questions.find().toArray();

          // Stuur de vragen als JSON-response
          res.json(allQuestions);

          console.log('questions', allQuestions)

    }

    catch (error) {
        console.error('quiz vragen ophalen ging fout:', error)
        res.status(500).send('Er is iets misgegaan op de server')
    }
});

/*
async function run() {
    try {
      await client.connect();
      // database and collection code goes here
      const db = client.db("`Formule1");
      const coll = db.collection("0Questions");
      // find code goes here
      const cursor = coll.find();
      // iterate code goes here
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
  }}

*/


// Data uit MongoDB voor archief pagina
app.get('/api/data/:category', async (req, res) => {
    try {
        const db = client.db(process.env.DB_NAME);
        const category = req.params.category; // Haal de categorie uit de URL

        let data = [];

        if (category === "drivers") {
            data = await db.collection("Drivers").find({}).toArray();
        } else if (category === "constructors") {
            data = await db.collection("Constructors").find({}).toArray();
        } else if (category === "championships") {
            data = await db.collection("Championships").find({}).toArray();
        } else if (category === "circuits") {
            data = await db.collection("Circuits").find({}).toArray();
        } else {
            return res.status(400).json({ error: "Ongeldige categorie" });
        }

        res.json(data);

    } catch (error) {
        console.error("Fout bij ophalen van data:", error);
        res.status(500).json({ error: "Server error" });
    }
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
    }}

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

function createPost (req, res) {
    if (req.session.user) {
        res.render('createPost.ejs', { user: req.session.user });
    } else {
        res.render('createPost.ejs', { user: null });    
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



