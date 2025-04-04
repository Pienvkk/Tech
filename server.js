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

    .get('/', index)
    .get('/login', renderPage('login'))
    .get('/createAccount', renderPage('createAccount'))
    .get('/accountPreferences', renderPage('accountPreferences'))
    .get('/profile', profile)
    .get('/quiz', quiz)
    .get('/teamUp', teamUp)
    .get('/community', community)
    .get('/createPost', renderPage('createPost'))
    .get('/helpSupport', renderPage('helpSupport'))
    .get('/friends', renderPage('friends'))
    .get('/quiz-results.ejs', quizresults)
    
    .listen(process.env.PORT, () => {
        console.log(`Webserver is listening at port ${process.env.PORT}`)
})



// DATABASE
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



// LOGIN
app.post('/login', async (req, res) => {
    console.log('Received login request:', req.body)

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

        res.redirect('/')

    } catch (error) {
        console.error('Login fout:', error)
        res.status(500).send('Something went wrong')
    }
})



// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    });
})



// ACCOUNT AANMAKEN
app.post('/createAccount',uploadProfilePic.single('file'), async (req, res) => {
    console.log('Received account creation request:', req.body)

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

        await users.insertOne({ username: username, password: pass, email: email, date: formattedDate, profilePic: filename, score: 0});

        const user = await users.findOne({ username: username, password: pass })
        req.session.user = { username }
        res.redirect('/accountPreferences')
        
    } catch (error) {
        console.error('Account creation error:', error)
        res.status(500).send('Server error')
    }
})



// USER PREFERENCES
app.post('/accountPreferences', async (req, res) => {
    const {season, driver, team, circuit} = req.body;

    try {
        const users = db.collection('0Users')

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



// FOLLOW
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



// UNFOLLOW
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



async function checkIfFollowing(currentUser, targetUser, db) {
    const user = await db.collection("0Users").findOne({
        username: currentUser,
        following: targetUser
    });

    return user !== null
}



app.get("/check-follow-status", async (req, res) => {
    const { targetUser } = req.query
    const currentUser = req.session.user.username

    try {
        const isFollowing = await checkIfFollowing(currentUser, targetUser, db)
        res.json({ isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to check follow status" })
    }
})



// QUIZ PAGINA
async function quiz(req, res) {
    try {
        const user = req.session.user
        console.log("Current user:", user)

        if (!user) {
            return res.render('quiz.ejs', { user: null, questions: [] })
        }

        // VRAGEN OPHALEN
        const questions = await db.collection('0Questions').find().toArray()
        console.log("Quiz questions:", questions)



        // VRAAG 1 - CHAMPIONSHIP
        // Pakt top 4 drivers uit seizoen van userPreferences als mogelijke antwoorden
        const championship = await db.collection('Championships').findOne({
            year: isNaN(user.firstSeason) ? user.firstSeason : parseInt(user.firstSeason)
        })

        if (!championship) {
            console.error("No sufficient data for season:", user.firstSeason);
            return res.status(500).send(`Error: No championship data for ${user.firstSeason} season`)
        }

        const topDrivers = championship.driver_standings
        .slice(0, 4)
        .sort(() => 0.5 - Math.random())
        .map(driver => driver.name)



        // VRAAG 2 - CIRCUIT
        // Pakt 3 random circuits - voegt user circuit toe - en geeft de bijbehorende landen als mogelijke antwoorden
        const circuitsList = await db.collection('Circuits').aggregate([{ $sample: { size: 3 } }]).toArray()
        const userCircuit = await db.collection('Circuits').findOne({ circuitRef: user.circuit })

        if (!userCircuit || circuitsList.length === 0) {
            console.error("No sufficient data for circuit:", user.circuit);
            return res.status(500).send(`Error: No circuit data for ${user.circuit}`)
        }

        circuitsList.push(userCircuit)

        const topTracks = circuitsList
        .sort(() => 0.5 - Math.random())
        .map(circuit => circuit.country)


        
        // VRAAG 3 - DRIVER NUMBER
        // Pakt 3 random getallen tussen 0 & 100 en voegt driver nummer toe van driver van user preferences als mogelijke antwoorden
        const numbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 100) + 1)
        const userDriver = await db.collection('Drivers').findOne({ driverRef: user.driver })

        if (!userDriver || !userDriver.number) {
            console.error("No sufficient data for driver:", user.driver);
            return res.status(500).send(`Error: No driver data for ${user.driver}`)
        }

        numbers.push(userDriver.number)

        const driverNumbers = numbers.sort(() => 0.5 - Math.random())



        // VRAAG 4 - DRIVER POINTS 2024
        // 
        const championship2024 = await db.collection('Championships').findOne({ year: 2024 })

        if (!championship2024) {
            console.error("No data for 2024 championship");
            return res.status(500).send("No data for 2024 championship");
        }

        const driverInfo = championship2024.driver_standings.find(d => d.driverRef === user.driver)

        if (!driverInfo) {
            console.error("Driver not found in 2024 standings");
            return res.status(500).send(`No data for driver ${user.driver}`);
        }

        const userDriverPoints = driverInfo.points
        
        const overigePoints = new Set()

        while (overigePoints.size < 3) {
            const variatie = Math.floor(Math.random() * 7) + 5 // Max 12 pt verschil
            const plusOfMin = Math.random() > 0.5 ? 1 : -1;
            const nieuwePoints = userDriverPoints + plusOfMin * variatie;

            if (nieuwePoints !== userDriverPoints && nieuwePoints >= 0) {
                overigePoints.add(nieuwePoints)
            }
        }

        const driverPoints = [...overigePoints, userDriverPoints].sort(() => 0.5 - Math.random());



        // VRAAG 5 - TEAM POINTS RANDOM SEIZOEN
        //
        const correcteSeizoen = await db.collection('Championships').findOne({
            year: isNaN(user.firstSeason) ? user.firstSeason : parseInt(user.firstSeason)
        })

        if (!correcteSeizoen || !correcteSeizoen.constructor_standings) {
            console.error("No constructor found for season:", user.firstSeason)
            return res.status(500).send(`Error: No constructor data for ${user.firstSeason}`)
        }

        const userTeam = correcteSeizoen.constructor_standings.find((team, index) => {
            return team.name?.toLowerCase() === user.team.toLowerCase()
        })

        if (!userTeam) {
            console.error(`Team ${user.team} niet gevonden in constructor standings voor ${user.firstSeason}`)
            return res.status(500).send(`Team ${user.team} niet gevonden in data`)
        }

        const teamPosition = userTeam.position || (correcteSeizoen.constructor_standings.indexOf(userTeam) + 1)

        const overigePositions = new Set()
        
        while (overigePositions.size < 3) {
            const variatie = Math.floor(Math.random() * 3) + 1 // Max 3 posities verschil
            const plusOfMin = Math.random() > 0.5 ? 1 : -1
            const fakePos = teamPosition + variatie * plusOfMin

            if (fakePos > 0 && fakePos <= correcteSeizoen.constructor_standings.length && fakePos !== teamPosition) {
                overigePositions.add(fakePos)
            }
        }

        const constructorPositions = [...overigePositions, teamPosition]
        .map(pos => pos.toString())
        .sort(() => 0.5 - Math.random())



        // Functie om placeholders te vervangen in de vragen & antwoorden
        const personalizeText = (text, user, topDrivers, topTracks, driverNumbers, driverPoints, constructorPositions) => {
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

                .replace("{{answer3.1}}", driverNumbers[0])
                .replace("{{answer3.2}}", driverNumbers[1])
                .replace("{{answer3.3}}", driverNumbers[2])
                .replace("{{answer3.4}}", driverNumbers[3])

                .replace("{{answer4.1}}", driverPoints[0])
                .replace("{{answer4.2}}", driverPoints[1])
                .replace("{{answer4.3}}", driverPoints[2])
                .replace("{{answer4.4}}", driverPoints[3])

                .replace("{{answer5.1}}", constructorPositions[0])
                .replace("{{answer5.2}}", constructorPositions[1])
                .replace("{{answer5.3}}", constructorPositions[2])
                .replace("{{answer5.4}}", constructorPositions[3])
        }

        const correctAnswers = []

        const personalizedQuestions = questions.map((q, index) => {
            const questionText = personalizeText(q.question, user, topDrivers, topTracks, driverNumbers, driverPoints, constructorPositions)
            const answerOptions = q.answers.split(",").map(answer => personalizeText(answer, user, topDrivers, topTracks, driverNumbers, driverPoints, constructorPositions))

            if (index === 0) correctAnswers.push(championship.driver_standings[0].name)
            if (index === 1) correctAnswers.push(userDriver.number.toString())
            if (index === 2) correctAnswers.push(userCircuit.country)
            if (index === 3) correctAnswers.push(userDriverPoints.toString())
            if (index === 4) correctAnswers.push(teamPosition.toString())

            return {
                question: questionText,
                answers: answerOptions
            }
        })

        console.log("Correct answers:", correctAnswers)
        req.session.correctAnswers = correctAnswers

        res.render('quiz.ejs', { user, questions: personalizedQuestions })

    } catch (err) {
        console.error("Error fetching questions:", err)
        res.status(500).send('Error fetching questions')
    }
}



// QUIZ SUBMITTING / SCORE BEREKENEN
app.post('/submit-quiz', async (req, res) => {
    try {
        const user = req.session.user
        const users = db.collection('0Users')
        const userAnswers = req.body
        const correctAnswers = req.session.correctAnswers

        console.log("User answers:", userAnswers)
        console.log("Correct answers:", correctAnswers)

        let score = 0

        correctAnswers.forEach((correctAnswer, index) => {
            const userAnswer = userAnswers[`question-${index}`]

            if (userAnswer && userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                score++
            } else {
                score--
            }
        })

        await users.updateOne(
            { username: user.username },
            { $inc: { score: score } } 
        )

        const updatedUser = await users.findOne({ username: user.username })


        res.render('quiz-results.ejs', {score, user: updatedUser, total: correctAnswers.length  })

    } catch (err) {
        console.error("Error processing quiz:", err)
        res.status(500).send("Error processing quiz results.")
    }
})



// INDEX - HOMEPAGINA (voor leaderboard)
async function index(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('index.ejs', { user: req.session.user || null, users })
    } catch (err) {
    }
}



async function profile(req, res) {
    try {
        const username = req.session.user?.username;
        
        const user = await db.collection('0Users').findOne({ username});
        const users = await db.collection('0Users').find().toArray();

        res.render('profile.ejs', { user: user || null, users: users || [] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
}


// COMMUNITY PAGINA
async function community(req, res) {
    try {
        const posts = await db.collection('0Posts').find().toArray()
        res.render('community.ejs', { user: req.session.user || null, posts })
    } catch (err) {
    }
}




// QUIZ-RESULTS PAGINA
async function quizresults(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('quiz-results.ejs', { user: req.session.user || null, users })
    } catch (err) {
    }
}



// TEAM-UP PAGINA
async function teamUp(req, res) {
    try {
        const users = await db.collection('0Users').find().toArray()
        res.render('teamUp.ejs', { user: req.session.user || null, users })
    } catch (err) {
    }
}



// POST UPLOADEN
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
})



// UPLOAD IMAGES OPHALEN
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'static/uploads', req.params.filename);
    res.sendFile(filePath);
})



// PROFILE IMAGES OPHALEN
app.get('/uploads/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'static/profilepics', req.params.filename);
    res.sendFile(filePath);require('dotenv').config() 
})
  


// ARCHIVE PAGINA
app.get('/archive', async (req, res) => {
    try {
        console.log("Data is er"); // kijken of t binnenkomt

        const category = req.query.category || "drivers"

        let data = []

        console.log("Geselecteerde categorie:", category)

        if (category === "drivers") {
            data =  await db.collection('Drivers').find().toArray()
        } else if (category === "constructors") {
            data =  await db.collection('Constructors').find().toArray()
        } else if (category === "championships") {
            data =  await db.collection('Championships').find().toArray()
        } else if (category === "circuits") {
            data =  await db.collection('Circuits').find().toArray()
        } else {
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
    console.error('404 error at URL: ' + req.url)
    res.status(404).send('404 error at URL: ' + req.url)
})

// Middleware voor server errors - error 500
app.use((err, req, res) => {
    console.error(err.stack)
    res.status(500).send('500: server error')
})