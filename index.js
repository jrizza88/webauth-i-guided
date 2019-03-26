const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');


const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());


server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  const user = req.body;

  const hash = bcrypt.hashSync(user.password, 14);

user.password = hash;

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
// ALTERNATIVE WAY
// const credentials = req.body;

// // find the user in the database by it's username then
// if (!user || !bcrypt.compareSync(credentials.password, user.password)) {
//   return res.status(401).json({ error: 'Incorrect credentials' });
// }
  
  
  let { username, password } = req.body;

  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

function checkCredentials (req, res, next){
  const { username, password } = req.headers;

  if (username && password) {
 
    Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
          next();
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json({message: "ran into unexpeted error"});
    });
   
  } else {
    res.status(400).json({message: "No credentials provided"})
  } 
}

// axios.get(url, { headers: {username, password}} )

// function auth(req,res,next){
//   const {username, password} = req.headers;

//   Users.findBy({ username })
//     .first()
//     .then(user => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         next();
//       } else {
//         res.status(401).json({ message: 'Invalid Credentials' });
//       }
//     })
//     .catch(error => {
//       res.status(500).json(error);
//     });
// }

server.get('/api/users', checkCredentials, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

// protect this route, only authenticated users should see it
// server.get('/api/users', (req, res) => {
//   Users.find()
//     .then(users => {
//       res.json(users);
//     })
//     .catch(err => res.send(err));
// });

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
