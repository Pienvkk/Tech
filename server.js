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
    .get('/quiz', quiz)
    .get('/teamUp', teamUp)
    .get('/community', community)
    .get('/createPost', renderPage('createPost'))
    .get('/helpSupport', renderPage('helpSupport'))
    .get('/friends', renderPage('friends'))
    .get('/quiz-results.ejs', quizresults)
    .get('/leaderboard', leaderboard)
    
    
    .listen(process.env.PORT, () => {
        console.log(`Webserver is listening at port ${process.env.PORT}`)
})



// Database
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const { render } = require('ejs')

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

// Afbeeldingen opslaan forum
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

// Afbeeldingen opslaan profielfoto

const profileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profilepics'); // Separate folder for profile pictures
    },
    filename: function (req, file, cb) {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const uploadProfilePic = multer({ storage: profileStorage });



// Inloggen
app.post('/login', async (req, res) => {
    // Check of login request binnenkomt
    console.log('Received login request:', req.body)

    // Inloggen
    const { username, pass} = req.body

    try {
        const users = db.collection('0Users')
        const {season, team, driver, circuit} = req.body;

        // Zoek de gebruiker in de database
        const user = await users.findOne({ username: username, password: pass })

        if (!user) {
            return res.status(400).send('Incorrect username or password')
        }

        // Login is succesvol - Sla de gebruiker op in de sessie
        req.session.user = { 
            id: user._id,
            username: user.username, 
            password: user.password,
            firstSeason: user.firstSeason,
            team: user.team,
            driver: user.driver,
            circuit: user.circuit
        }

        // Update user om zijn preferences toe te voegen
        // await users.updateOne(
        //     { username: req.session.user.username },
        //     { $set: { firstSeason: season, team: team, driver: driver, circuit: circuit}}
        //   );
        res.redirect('/')


    } catch (error) {
        console.error('Login fout:', error)
        res.status(500).send('Something went wrong')
    }
})



// Uitloggen
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
})



// Account aanmaken
app.post('/createAccount',uploadProfilePic.single('file'), async (req, res) => {
    // Check of account creatie request binnenkomt
    console.log('Received account creation request:', req.body)

    // Account aanmaken
    const { username, pass, email, date, file} = req.body;
    const formattedDate = date ? new Date(date) : null

    try {
        const users = db.collection('0Users')
        const filename = req.file ? req.file.filename : null
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
        await users.insertOne({ username: username, password: pass, email: email, date: formattedDate, profilePic: filename, score: 0});

        const user = await users.findOne({ username: username, password: pass })
        req.session.user = { username }
        res.redirect('/accountPreferences')
        
    } catch (error) {
        console.error('Account creation error:', error)
        res.status(500).send('Server error')
    }
})



// Voorkeuren instellen
app.post('/accountPreferences', async (req, res) => {
    const {season, driver, team, circuit} = req.body;

    try {
        const users = db.collection('0Users')

        // Update user om zijn preferences toe te voegen
        await users.updateOne(
            { username: req.session.user.username },
            { $set: { firstSeason: season, team: team, driver: driver, circuit: circuit }}
          );

        console.log("Preferences have been updated", req.session.user.username)
        res.redirect('/profile')
    } 
    
    catch (error) {
        console.error('Preferences adding error:', error)
        res.status(500).send('Server error')
    }
})

app.post('/follow', async (req, res) =>{
    const {targetUser} = req.body;
    const currentUser = req.session.user.username;

    try{
        const users = db.collection('0Users')
        
        await users.updateOne(
            { username: currentUser },
            { $addToSet: { following: targetUser } }
        );

        await users.updateOne(
            { username: targetUser },
            { $addToSet: {followers: currentUser}}
        )

        res.json({ message: 'You are now following ${targetUsername}.'})
    
    }   catch (error) {
            console.error('Error following user:', error)
            res.status(500).send('Server error')
    }
})

app.post('/unfollow', async (req, res) =>{
    const {targetUser} = req.body;
    const currentUser = req.session.user.username;

    try{
        const users = db.collection('0Users')
        
        await users.updateOne(
            { username: currentUser },
            { $pull: { following: targetUser } }
        );

        await users.updateOne(
            { username: targetUser },
            { $pull: {followers: currentUser}}
        )

        res.json({ message: 'You are now following ${targetUsername}.'})
    
    }   catch (error) {
            console.error('Error following user:', error)
            res.status(500).send('Server error')
    }
})





// Quiz pagina
async function quiz(req, res) {
    try {
        const user = req.session.user
        console.log("Current user:", user)

        if (!user) {
            return res.render('quiz.ejs', { user: null, questions: [] })
        }

        // Haal de quizvragen op
        const questions = await db.collection('0Questions').find().toArray()
        console.log("Quiz questions:", questions)


        // VRAAG 1 - CHAMPIONSHIP
        // Haal de championship data op uit jaar van userPreference
        const championship = await db.collection('Championships').findOne({
            year: isNaN(user.firstSeason) ? user.firstSeason : parseInt(user.firstSeason)
        })

        // Error bij championship database
        if (!championship) {
            console.error("No sufficient data for season:", user.firstSeason)
            return res.status(500).send(`Error: No championship data for ${user.firstSeason} season`)
        }

        // Pakt top 4 drivers - shufflet - pakt namen
        const topDrivers = championship.driver_standings
        .slice(0, 4) 
        .sort(() => 0.5 - Math.random())
        .map(driver => driver.name) 



        // VRAAG 2 - CIRCUIT
        // Haal de circuit data op
        const circuits = await db.collection('Circuits').findOne()

        // Error bij circuit database
        if (!circuits) {
            console.error("No sufficient data for circuit:", user.circuit)
            return res.status(500).send(`Error: No circuit data for ${user.circuit}`)
        }

        // Pakt 3 circuits uit collectie en voegt circuit toe dat overeenkomt met userPreference
        const circuitsList = await db.collection('Circuits').aggregate([{ $sample: { size: 3 } }]).toArray()
        const userCircuit = await db.collection('Circuits').findOne({
            circuitRef: user.circuit
        })

        circuitsList.push(userCircuit)

        // shufflet - pakt bijbehorende landen
        const topTracks = circuitsList
        .sort(() => 0.5 - Math.random())
        .map(circuit => circuit.country)



        // Functie om placeholders te vervangen in de vragen & antwoorden
        const personalizeText = (text, user, drivers) => {
            return text
            .replace("{{firstSeason}}", user.firstSeason)
            .replace("{{driver}}", user.driver)
            .replace("{{team}}", user.team)
            .replace("{{circuit}}", user.circuit)

            .replace("{{answer1.1}}", topDrivers[0])
            .replace("{{answer1.2}}", topDrivers[1])
            .replace("{{answer1.3}}", topDrivers[2])
            .replace("{{answer1.4}}", topDrivers[3])

            .replace("{{answer2.1}}", topTracks[0])
            .replace("{{answer2.2}}", topTracks[1])
            .replace("{{answer2.3}}", topTracks[2])
            .replace("{{answer2.4}}", topTracks[3])
        }

        // Function to remove unwanted quotes around the answer
        const sanitizeAnswer = (answer) => {
            return answer.replace(/\"/g, '').trim(); // Remove quotes
        };

        // When preparing the questions and answers
        const personalizedQuestions = questions.map((q, index) => ({
            question: personalizeText(q.question, user, topDrivers),
            answers: q.answers.split(", ").map(answer => sanitizeAnswer(answer)),
            correctAnswer: sanitizeAnswer(q.correctAnswer)
        }));

        console.log("Rendering quiz with user:", user)
        res.render('quiz.ejs', { user, questions: personalizedQuestions })

    } catch (err) {
        console.error("Error fetching questions:", err)
        res.status(500).send('Error fetching questions')
    }
}

app.post('/submit-quiz', async (req, res) => {
    try {
        const user = req.session.user;
        const users = db.collection('0Users');
        const userAnswers = req.body;
        const questions = await db.collection('0Questions').find().toArray();
        let score = 0;

        questions.forEach((question, index) => {
            const userAnswer = userAnswers[`question-${index}`].replace(/\"/g, '').trim(); // Sanitize user input
            const correctAnswer = question.correctAnswer.replace(/\"/g, '').trim(); // Sanitize correct answer

            if (userAnswer === correctAnswer) {
                score++
            }
            else{
                score--
            }
        });
        await users.updateOne(
            { username: user.username },
            { $inc: { score: score } } // Increment the user's score in the database
        );

        const updatedUser = await users.findOne({ username: user.username });


        res.render('quiz-results.ejs', {score, user: updatedUser, total: questions.length  });
    } catch (err) {
        console.error("Error processing quiz:", err);
        res.status(500).send("Error processing quiz results.");
    }
});


// Community pagina
async function community(req, res) {
    try {
        const posts = await db.collection('0Posts').find().toArray()
        res.render('community.ejs', { user: req.session.user || null, posts })
    } catch (err) {
    }
}

async function leaderboard(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('leaderboard.ejs', { user: req.session.user || null, users })
    } catch (err) {
    }
}

async function quizresults(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('quiz-results.ejs', { user: req.session.user || null, users })
    } catch (err) {
    }
}

async function teamUp(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('teamUp.ejs', { user: req.session.user || null, users })
    } catch (err) {
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

app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'static/profilepics', req.params.filename);
    res.sendFile(filePath);
});


// Archief pagina
app.get('/archive', async (req, res) => {
    try {
        console.log("Data is er"); // kijken of t binnenkomt

        const category = req.query.category || "drivers"

        let data = []

        console.log("Geselecteerde categorie:", category)

        if (category === "drivers") {
            data =  await db.collection('Drivers').find().toArray()
        } 
        else if (category === "constructors") {
            data =  await db.collection('Constructors').find().toArray()
        } 
        else if (category === "championships") {
            data =  await db.collection('Championships').find().toArray()
        } 
        else if (category === "circuits") {
            data =  await db.collection('Circuits').find().toArray()
        } 
        else {
            return res.status(400).json({ error: "No category" })
        }
        
        res.render('archive.ejs', { user: req.session.user, category, data })
    } 
    
    catch (err) {
        console.error("Error fetching archive:", err);
        res.status(500).send('Error fetching archive')
    } 
})



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