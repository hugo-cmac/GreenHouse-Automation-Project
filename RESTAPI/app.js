const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const status = require('http-status');
var servBD = require("./api/servBD");
const jwt = require('jsonwebtoken');
var cors = require('cors');
const mysql = require('mysql');
/*var jsdom = require('jsdom');
$ = require('jquery')(new jsdom.JSDOM().window);*/



app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X_Requested-With, Content-Type, Accept, Authorization");
    if(req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use(cors({ credentials: true, origin: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());



// LOGIN, REGISTER e UTILIZADORES

app.post('/register', function (req,res){
	servBD.register(req, function (error, results) {
		if (error) {
			res.status(error.code).send(error.message);
		}
		else {
			return res.status(status.CREATED).send({ error: false, data: results, message: 'New User has been registered successfully' });
		}
	});
});

app.post('/login', function (req, res) {
	servBD.login(req, function (error, results) {
		if (error) {
			res.status(error.code).send(error.message);
		}
		else {
			return res.status(status.OK).send({ error: false, data: results, message: 'User logged in successfully' });
		}
	});
});

app.get('/utilizadores', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.getUtilizadores(function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					res.status(status.OK).send({ error: false, data: results, message: 'Utilizadores.' });
				}
			});
	// 	}
	// });
});

app.get('/utilizadores/:id_user', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.getUtilizadoresById(req, function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					return res.status(status.OK).send({ error: false, data: results, message: 'Utilizador.' });
				}
			});
	// 	}
	// });
});

app.put('/utilizadores/:id_user', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.updateUtilizador(req, function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					return res.status(status.CREATED).send({ error: false, data: results, message: 'New utilizador has been modified successfully.' });
				}
			});
	// 	}
	// });
});

app.delete('/utilizadores/:id_user', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.deleteUtilizador(req, function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					return res.status(status.CREATED).send({ error: false, data: results, message: 'Utilizador deleted successfully' });
				}
			});
	// 	}
	// });
});

//DEVICES

app.post('/devices', function (req, res) {
	servBD.insertDevice(req, function (error, results) {
		if (error) {
			res.status(error.code).send(error.message);
		}
		else {
			return res.status(status.OK).send({ error: false, data: results, message: 'User logged in successfully' });
		}
	});
});

app.get('/devices', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.getDevices(function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					res.status(status.OK).send({ error: false, data: results, message: 'Utilizadores.' });
				}
			});
	// 	}
	// });
});

app.get('/devices/:id_device', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.getDevicesById(req, function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					return res.status(status.OK).send({ error: false, data: results, message: 'Utilizador.' });
				}
			});
	// 	}
	// });
});


app.delete('/devices/:id_device', verifyToken, function (req, res) {
	// jwt.verify(req.token, "config.secret", (err, authData) => {
	// 	if (err) {
	// 		res.status(status.UNAUTHORIZED).send("Wrong token");
	// 	} else {
			servBD.deleteUtilizador(req, function (error, results) {
				if (error) {
					res.status(error.code).send(error.message);
				}
				else {
					return res.status(status.CREATED).send({ error: false, data: results, message: 'Utilizador deleted successfully' });
				}
			});
	// 	}
	// });
});

//HISTORY







app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});



// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

// Verify Token
function verifyToken(req, res, next) {
	// Get auth header value
	// const bearerHeader = req.headers['authorization'];
	// // Check if bearer is undefined
	// if (typeof bearerHeader !== 'undefined') {
	// 	// Split at the space
	// 	const bearer = bearerHeader.split(' ');
	// 	// Get token from array
	// 	const bearerToken = bearer[1];
	// 	// Set the token
	// 	req.token = bearerToken;
	// 	// Next middleware
		next();
	// } else {
	// 	// Forbidden
	// 	res.status(status.UNAUTHORIZED).send("No authorization");
	// }
}

module.exports = app;