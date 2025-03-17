require('dotenv').config() 

const express = require('express')
const app = express()
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const session = require('express-session')

app.use(session({
    secret: 'your-secret-key', // Verander dit naar een veilige string!
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Zet op 'true' als je HTTPS gebruikt
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user || null
    next()
});



// Globale functie om paginas in te laden
function renderPage(page) {
    return (req, res) => {
        res.render(`${page}.ejs`, { user: req.session.user || null })
    };
}



app
    .use(express.json())
    .use (express.urlencoded({extended: true}))
    .use ('/', express.static('static'))

    .set ('view engine', 'ejs')
    .set ('views', 'view')

    .get('/', renderPage('index'))
    .get('/login', renderPage('login'))
    .get('/createAccount', renderPage('createAccount'))
    .get('/accountPreferences', renderPage('accountPreferences'))
    .get('/profile', renderPage('profile'))
    .get('/quiz', quizbattlefunctie)
    .get('/teamUp', renderPage('teamUp'))
    .get('/community', community)
    .get('/createPost', renderPage('createPost'))
    .get('/archive', renderPage('archive'))
    .get('/helpSupport', renderPage('helpSupport'))
    
    
    .listen(process.env.PORT, () => {
        console.log(`Webserver is listening at port ${process.env.PORT}`)
})



// Database
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Formule1`

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
})



// Globale functie voor verbinding met database / voorkomt iedere functie const aan moeten maken voor db
let db;

client.connect()

    .then(() => {
        console.log('Database connection established')
        db = client.db(process.env.DB_NAME);
    })

  .catch((err) => {
    console.log(`Database connection error - ${err}`)
    console.log(`For uri - ${uri}`)

})



// Inloggen
app.post('/login', async (req, res) => {
    // Check of login request binnenkomt
    console.log('Received login request:', req.body)

    // Inloggen
    const { username, pass } = req.body

    try {
        const users = db.collection('0Users')


        // Zoek de gebruiker in de database
        const user = await users.findOne({ username: username, password: pass })

        if (!user) {
            return res.status(400).send('Ongeldige gebruikersnaam of wachtwoord')
        }

        // Login is succesvol - Sla de gebruiker op in de sessie
        req.session.user = { username: user.username }

        // Login is succesvol - Redirect naar homepagina
        res.redirect('/');

        // Update user om zijn preferences toe te voegen
        await users.updateOne(
            { username: req.session.user.username },
            { $set: { firstSeason: season, team: team, driver: driver }}
          );
        res.redirect('/')


    } catch (error) {
        console.error('Login fout:', error)
        res.status(500).send('Er is iets misgegaan op de server')
    }
})



// Uitloggen
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
})



// Account aanmaken
app.post('/createAccount', async (req, res) => {
    // Check of account creatie request binnenkomt
    console.log('Received account creation request:', req.body)

    // Account aanmaken
    const { username, pass, email, date} = req.body;
    const formattedDate = date ? new Date(date) : null

    try {
        const users = db.collection('0Users')

        // Kijkt of username al bestaat
        const existingUser = await users.findOne({ username: username })
        if (existingUser) {
            return res.status(400).send('Username taken')
        }
        const existingEmail = await users.findOne({ email:email })
        if (existingEmail) {
            return res.status(400).send('Email taken')
        }

        // Stopt nieuwe user in database
        await users.insertOne({ username: username, password: pass, email: email, date: formattedDate});

        const user = await users.findOne({ username: username, password: pass })
        req.session.user = { username }
        res.redirect('/accountPreferences')
        
    } catch (error) {
        console.error('Account creation error:', error)
        res.status(500).send('Server error')
    }
});



// Voorkeuren instellen
app.post('/accountPreferences', async (req, res) => {
    const {season, team, driver} = req.body;

    try {
        const users = db.collection('0Users')

        // Update user om zijn preferences toe te voegen
        await users.updateOne(
            { username: req.session.user.username },
            { $set: { firstSeason: season, team: team, driver: driver }}
          );
        console.log(season)
        console.log("Username to update:", req.session.user.usernamee)
        res.redirect('/')

    } catch (error) {
        console.error('Preferences adding error:', error)
        res.status(500).send('Server error')
    }
});

// Inloggen
app.post('/login', async (req, res) => {
    // Check of login request binnenkomt
    console.log('Received login request:', req.body); 
})


// Afbeeldingen opslaan
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/uploads');
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});



const upload = multer({ storage })


// Quiz pagina

async function quizbattlefunctie (req, res) {
    try {
        const questions = db.collection('0Questions')
        const quizquestions = await db.collection('0Questions').find().toArray()
        console.log("Fetched Questions:", quizquestions); // Debugging

        res.render('quiz.ejs', { user: req.session.user || null, questions })
    } catch (err) {
        console.error("Error fetching quizquestions:", err);
        res.status(500).send('Error fetching quizquestions')
    }
}
/*
// 1 haalt vragen op 
app.get('/quiz', async (req, res) => {
    console.log('Quizpagina bezocht');

    try {
        const questions = db.collection('0Questions');

    
        const allQuestions = await questions.find().toArray();

        console.log('Questions:', allQuestions);
    
        res.render('quiz.ejs', { 
            user: req.session.user || null, 
            questions: allQuestions 
        });

    } catch (error) {
        console.error('Quiz vragen ophalen ging fout:', error);
        res.status(500).send('Er is iets misgegaan op de server');
    }
});

*/

//2 berekent score 

app.post('/submit-quiz', async (req, res) => {
    try {
        const userAnswers = req.body;

        let score = 0;
        for (let userAnswer of userAnswers) {
            const question = await questionsCollection.findOne({ question: userAnswer.question });
            if (question && userAnswer.answer === question.correct_answer) {
                score++;
            }
        }

        res.json({ success: true, message: "Quiz verwerkt", score: score });
    } catch (error) {
        console.error('Fout bij verwerken van quiz:', error);
        res.status(500).json({ success: false, message: "Serverfout" });
    }
});

/*app.get('/quiz', async (req, res) => {
    console.log('Quizpagina bezocht');

    try {
        const db = client.db(process.env.DB_NAME);
        const questions = db.collection('0Questions');

        // Haal alle vragen op en zet ze in een array
        const allQuestions = await questions.find().toArray();

        // Log vragen in de terminal
        console.log('Questions:', allQuestions);
    
        // Render de quizpagina en stuur vragen + gebruiker mee
        res.render('quiz.ejs', { 
            user: req.session.user || null, 
            questions: allQuestions 
        });

    } catch (error) {
        console.error('Quiz vragen ophalen ging fout:', error);
        res.status(500).send('Er is iets misgegaan op de server');
    }
});
*/

// Community pagina
async function community(req, res) {
    try {
        const posts = await db.collection('0Posts').find().toArray()
        console.log("Fetched posts:", posts); // Debugging

        res.render('community.ejs', { user: req.session.user || null, posts })
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).send('Error fetching posts')
    }
}



// Post uploaden
app.post('/createPost', upload.single('file'), async (req, res) => {
    console.log('Received post creation request:', req.body); 

    const { title, content, file } = req.body;

    if (!req.session.user) {
        return res.status(401).send('You must be logged in to create a post.');
    }

    try {
        const posts = db.collection('0Posts');

        const username = req.session.user.username; // Retrieve the username
        const filename = req.file ? req.file.filename : null

        console.log('Username:', username);

        await posts.insertOne({ user: username, title: title, content: content, file: filename });

        res.redirect('/community'); // Redirect to community page after posting

    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).send('Server error');
    }
});

app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'static/uploads', req.params.filename);
    res.sendFile(filePath);
});


// Archief pagina
app.get('/api/data/:category', async (req, res) => {
    try {
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
