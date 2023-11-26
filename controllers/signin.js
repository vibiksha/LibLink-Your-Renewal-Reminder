const authenticate = (db) => (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
  
	// Check if the provided email exists in the 'collectdata' table
	db('collectdata')
	  .select('email', 'password', 'username') // Select the 'email', 'password', and 'username' columns
	  .where('email', email)
	  .then((rows) => {
		if (rows.length === 0) {
		  return res.status(400).json('Please Register');
		}
  
		const user = rows[0]; // Assuming that the email is unique
  
		if (user.password === password) {
		  // Password matches, store the username in the session
		//   req.session.username = user.username;
		// localStorage.setItem('username', user.username);

		//   console.log(username)
		  res.status(200).json(user.username);
		} else {
		  res.status(400).json('Wrong Password. Try again');
		}
	  })
	  .catch((err) => res.status(400).json('Wrong credentials'));
  };
  
  module.exports = {
	authenticate: authenticate
  };
  