const register = (req, res, db) => {
	const email = req.body.email;
  
	// Check if the email already exists in the database
	db.from('collectdata')
	  .select('email')
	  .where('email', '=', email)
	  .then((rows) => {
		if (rows.length > 0) {
		  // Email already exists, send an error response
		  return res.status(400).json('Email already exists. Please register with another email.');
		} else {
		  // Email doesn't exist, insert the data
		  db('collectdata')
			.insert(req.body)
			.then(() => {
			  // Data inserted successfully, send a success response
			  return res.status(200).json('Registered successfully');
			})
			.catch((err) => {
			  console.log(err);
			  return res.status(500).json('Error registering user');
			});
		}
	  })
	  .catch((err) => {
		console.log(err);
		return res.status(500).json('Error registering user');
	  });
  };
  
  module.exports = {
	register: register
  };
  