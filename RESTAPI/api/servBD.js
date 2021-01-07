const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const status = require('http-status');

var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'localhost',
    user: 'root',
    password: 'password',
	database: 'GHD_DB'
});

module.exports={
	
	// REGISTER, LOGIN E UTILIZADORES

	register: function (req, callback) {
		if (!req.body.username || !req.body.mail || !req.body.pass) {
			let err = { code: status.BAD_REQUEST, message: "Please provide User" };
			return callback(err, null);
		} else {
			//verificar se email já existe
			let query = "select * from User where mail = ?";
			let table = [req.body.mail];
			query = mysql.format(query, table);
			pool.query(query, function (errorMail, resultsMail) {
				if (errorMail) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: errorMail };
					return callback(err, null);
				}
				else {
					if (resultsMail.length > 0) {
						//mail já existe, não é possivel registar
						err = { code: status.BAD_REQUEST, message: "Mail already exists" };
						return callback(err, null);
					} else {
						let hashedPassword = bcrypt.hashSync(req.body.pass, 8);
						//mail não existe, pode fazer insert
						let query = "call insert_user(?,?,?)";
						let table = [req.body.username, req.body.mail, hashedPassword];
						query = mysql.format(query, table);
						pool.query(query, function (error, results) {
							if (error) {
								err = { code: status.INTERNAL_SERVER_ERROR, message: error };
								return callback(err, null);
							}
							else {
								//create token
								var token = jwt.sign({ id: results.insertId }, "config.secret", {
									expiresIn: 86400 // expires in 24 hours
								});
								results.token = token;
								results.auth = true;
								console.log(JSON.stringify(results));
								return callback(null, results);
							}
						});
					}
				}
			});
		}
	},
	login: function (req, callback) {
		if (!req.body.pass || !req.body.username) {
			let err = { code: status.BAD_REQUEST, message: "Please provide utilizador" };
			return callback(err, null);
		} else {
			let query = "select * from User where mail = ?";
			let table = [req.body.mail];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					if (results.length > 0) {
						//check pass
						console.log(JSON.stringify(req.body) + " \n" + JSON.stringify(results));
						var passwordIsValid = bcrypt.compareSync(req.body.pass, results[0].pass);
						if (!passwordIsValid) {
							err = { code: status.UNAUTHORIZED, message: "Wrong pass" };
							return callback(err, null);
						}
						var token = jwt.sign({ id: results.id_user }, "config.secret", {
							expiresIn: 86400 // expires in 24 hours
						});
						results[0].token = token;
						results[0].auth = true;
						console.log(JSON.stringify(results));
						return callback(null, results[0]);
					} else {
						let err = { code: status.NOT_FOUND, message: "Utilizador doesn't exist" };
						return callback(err, null);
					}
				}
			});
		}
	},
	updateUtilizador: function (req, callback) {
		if (!req.body.username || !req.body.mail || !req.body.pass ) {
			let err = { code: status.BAD_REQUEST, message: "Please provide utilizador" };
			return callback(err, null);
		} else {
			let query = "UPDATE utilizador SET username=?, mail=?, pass=? WHERE id_user = ?";
			let hashedPassword = bcrypt.hashSync(req.body.pass, 8);
			let table = [req.body.username, req.body.mail, hashedPassword, req.params.id_user];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					if (results.affectedRows > 0)
						return callback(null, results);
					else {
						err = { code: status.NOT_FOUND, message: "Utilizador doesn't exist" };
						return callback(err, null);
					}
				}
			});
		}
	},
	deleteUtilizador: function (req, callback) {
		let query = "DELETE from User WHERE id_user = ?";
		let table = [req.params.id_user];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.affectedRows > 0)
					return callback(null, results);
				else {
					err = { code: status.NOT_FOUND, message: "Utilizador doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},
	getUtilizadores: function (callback) {
		pool.query('SELECT id_user,username,mail FROM User', function (error, results) {
			if (error) {
				let err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				return callback(null, results);
			}
		});
	},
	getUtilizadoresById: function (req, callback) {
		let query = "SELECT id_user,username,mail FROM User WHERE id_user = ?";
		let table = [req.params.id_user];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.length > 0)
					return callback(null, results);
				else {
					let err = { code: status.NOT_FOUND, message: "Utilizador doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},
	
	//DEVICES

	insertDevice: function (req, callback) {
		if (!req.body.serial) {
			let err = { code: status.BAD_REQUEST, message: "Please provide a device" };
			return callback(err, null);
		} else {
			let query = "call insert_device(?)";
			let table = [req.body.serial];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					return callback(null, results);
				}
			});
		}
	},

	getDevices: function (callback) {
		pool.query('SELECT id_device, serial FROM Device', function (error, results) {
			if (error) {
				let err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				return callback(null, results);
			}
		});
	},
	getDevicesById: function (req, callback) {
		let query = "SELECT id_device, serial FROM Device WHERE id_device = ?";
		let table = [req.params.id_device];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.length > 0)
					return callback(null, results);
				else {
					let err = { code: status.NOT_FOUND, message: "Device doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	deleteDevice: function (req, callback) {
		let query = "DELETE from Device WHERE id_device = ?";
		let table = [req.params.id_device];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.affectedRows > 0)
					return callback(null, results);
				else {
					err = { code: status.NOT_FOUND, message: "Device doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	//PROFILE

	insertProfile: function (req, callback) {
		if (!req.body.designacao || !req.body.temp_min || !req.body.temp_max || !req.body.hum_air_min || !req.body.hum_air_max || !req.body.hum_earth_min || !req.body.hum_earth_max) {
			let err = { code: status.BAD_REQUEST, message: "Please provide a profile" };
			return callback(err, null);
		} else {
			let query = "call insert_profile(?,?,?,?,?,?,?)";
			let table = [req.body.designacao,req.body.temp_min,req.body.temp_max,req.body.hum_air_min,req.body.hum_air_max,req.body.hum_earth_min,req.body.hum_earth_max];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					return callback(null, results);
				}
			});
		}
	},

	getProfile: function (callback) {
		pool.query('SELECT id_perfil,designacao,temp_min,temp_max,hum_air_min,hum_air_max,hum_earth_min,hum_earth_max FROM Perfil', function (error, results) {
			if (error) {
				let err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				return callback(null, results);
			}
		});
	},

	getProfileById: function (req, callback) {
		let query = "id_perfil,designacao,temp_min,temp_max,hum_air_min,hum_air_max,hum_earth_min,hum_earth_max FROM Perfil WHERE id_perfil = ?";
		let table = [req.params.id_perfil];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.length > 0)
					return callback(null, results);
				else {
					let err = { code: status.NOT_FOUND, message: "Device doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	deleteProfile: function (req, callback) {
		let query = "DELETE from Perfil WHERE id_perfil = ?";
		let table = [req.params.id_perfil];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.affectedRows > 0)
					return callback(null, results);
				else {
					err = { code: status.NOT_FOUND, message: "Profile doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	//HISTORY

	insertHistory: function (req, callback) {
		if (!req.body.id_device || !req.body.timestamp || !req.body.temp || !req.body.hum_air || !req.body.hum_earth || !req.body.luminosity || !req.body.pump || !req.body.motor) {
			let err = { code: status.BAD_REQUEST, message: "Please provide a history device" };
			return callback(err, null);
		} else {
			let query = "call insert_history(?,?,?,?,?,?,?)";
			let table = [req.body.id_device,req.body.timestamp,req.body.temp,req.body.hum_air,req.body.hum_earth,req.body.luminosity,req.body.pump];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					return callback(null, results);
				}
			});
		}
	},

	getHistory: function (callback) {
		pool.query('SELECT id_history,id_device,timestamp,temp,hum_air,hum_earth,luminosity,pump,motor FROM History', function (error, results) {
			if (error) {
				let err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				return callback(null, results);
			}
		});
	},

	getHistoryById: function (req, callback) {
		let query = "SELECT id_history,id_device,timestamp,temp,hum_air,hum_earth,luminosity,pump,motor FROM History WHERE id_history = ?";
		let table = [req.params.id_history];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.length > 0)
					return callback(null, results);
				else {
					let err = { code: status.NOT_FOUND, message: "History doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	deleteHistory: function (req, callback) {
		let query = "DELETE from History WHERE id_history = ?";
		let table = [req.params.id_history];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.affectedRows > 0)
					return callback(null, results);
				else {
					err = { code: status.NOT_FOUND, message: "History doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	//USER-DEVICE 

	insertUSRDEV: function (req, callback) {
		if (!req.body.id_user || !req.body.id_device || !req.body.designacao) {
			let err = { code: status.BAD_REQUEST, message: "Please provide a relation" };
			return callback(err, null);
		} else {
			let query = "call insert_reldevice(?,?,?)";
			let table = [req.body.id_user,req.body.id_device,req.body.designacao];
			query = mysql.format(query, table);
			pool.query(query, function (error, results) {
				if (error) {
					err = { code: status.INTERNAL_SERVER_ERROR, message: error };
					return callback(err, null);
				}
				else {
					return callback(null, results);
				}
			});
		}
	},

	getUSRDEV: function (callback) {
		pool.query('SELECT id_rel_user_device, id_user,id_device,designacao FROM rel_user_device', function (error, results) {
			if (error) {
				let err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				return callback(null, results);
			}
		});
	},
	getUSRDEVById: function (req, callback) {
		let query = "SELECT id_rel_user_device, id_user,id_device,designacao FROM Device WHERE id_rel_user_device = ?";
		let table = [req.params.id_rel_user_device];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.length > 0)
					return callback(null, results);
				else {
					let err = { code: status.NOT_FOUND, message: "Device doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},

	deleteUSRDEV: function (req, callback) {
		let query = "DELETE from rel_user_device WHERE id_rel_user_device = ?";
		let table = [req.params.id_rel_user_device];
		query = mysql.format(query, table);
		pool.query(query, function (error, results) {
			if (error) {
				err = { code: status.INTERNAL_SERVER_ERROR, message: error };
				return callback(err, null);
			}
			else {
				if (results.affectedRows > 0)
					return callback(null, results);
				else {
					err = { code: status.NOT_FOUND, message: "Device doesn't exist" };
					return callback(err, null);
				}
			}
		});
	},






}