// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const session = require('express-session'); 
// const User = require('./models/User');
// const bcrypt = require('bcryptjs');
// const authRoutes = require('./routes/auth');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(express.json());
// app.use(cors({
//   origin: 'http://localhost:5173', 
//   methods: ['GET', 'POST'],
//   credentials: true
// }));

// mongoose.connect('mongodb://127.0.0.1:27017/EDI', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log('MongoDB connection error:', err));

// app.use(session({
//   secret: 'your_generated_secret_key',  
//   resave: false,
//   saveUninitialized: false,
//   cookie: { secure: false }  
// }));

// console.log("Server is starting...");


// app.post('/api/register', async (req, res) => {
//   try {
//     const { name, email, mobile, password } = req.body;
//     console.log('Registering user:', { name, email, mobile });

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       console.log('User already exists');
//       return res.status(400).json({ msg: 'User already exists' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       name,
//       email,
//       mobile,
//       password: hashedPassword,
//     });

//     await newUser.save();
//     res.status(201).json({ msg: 'User registered successfully' });
//   } catch (err) {
//     console.error('Register error:', err); 
//     res.status(500).json({ msg: 'Server error', error: err.message }); 
//   }
// });


// app.post('/api/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ msg: 'User not found' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ msg: 'Invalid credentials' });
//     }

  
//     req.session.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email
//     };

//     res.json({ msg: 'Login successful', user: req.session.user });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ msg: 'Server error' });
//   }
// });

// app.get('/profile', (req, res) => {
//   if (!req.session.user) {
//     return res.status(401).json({ msg: 'Unauthorized' });
//   }

//   res.json({ user: req.session.user });
// });


// app.post('/api/logout', (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       return res.status(500).json({ msg: 'Failed to logout' });
//     }

//     res.json({ msg: 'Logout successful' });
//   });
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session'); 
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Profile = require('./models/userprofile'); // Import Profile model

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST'],
  credentials: true
}));

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/EDI', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Session setup
app.use(session({
  secret: 'your_generated_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
}));

console.log("Server is starting...");

// Registration Route (for users collection)
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registering user:', { name, email });

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err); 
    res.status(500).json({ msg: 'Server error', error: err.message }); 
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.json({ msg: 'Login successful', user: req.session.user });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// User Profile Route (Create or Update Profile)
app.post('/api/profile', async (req, res) => {
  try {
    const { name, email, location, skills, interest } = req.body;
    
    if (!req.session.user) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }

    const userId = req.session.user.id;

    let profile = await Profile.findOne({ userId });

    if (profile) {
      // Update existing profile
      profile.name = name;
      profile.email = email;
      profile.location = location;
      profile.skills = skills;
      profile.interest = interest;
      await profile.save();
      return res.json({ msg: 'Profile updated successfully', profile });
    } else {
      // Create new profile
      profile = new Profile({
        userId,
        name,
        email,
        location,
        skills,
        interest
      });
      await profile.save();
      return res.status(201).json({ msg: 'Profile created successfully', profile });
    }
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get User Profile Route
app.get('/api/profile', async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const userId = req.session.user.id;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Logout Route
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ msg: 'Failed to logout' });
    }

    res.json({ msg: 'Logout successful' });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));