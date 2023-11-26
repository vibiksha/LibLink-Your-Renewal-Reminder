const express=require('express')
const app=express()
const bodyParser=require('body-parser')
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const knex = require('knex');
const cors = require('cors');
const session = require('express-session');
app.use(cors())
const cron = require('node-cron');
const nodemailer = require('nodemailer');

app.use(session({
	secret: 'Vibiksha@2003', // Replace with your secret key
	resave: true,
	saveUninitialized: true,
	cookie: { secure: false }, // Adjust as needed
  }));

 const db=knex({
client:'mysql',
connection:{
host:'127.0.0.1',
user:'root',
password:'vibis123',
database:'register'
}
})
console.log("hii")
const transporter = nodemailer.createTransport({
	service: 'Gmail', // Use the email service you are using
	auth: {
	  user: 'pk.vibis@gmail.com', // Your email address
	  pass: 'tlxu qxou mulz wfwa' // Your email password or an application-specific password
	}
  });

  cron.schedule('*/1 * * * *', async () => {
	// Get the list of books where the issue date exceeds the threshold
	// const threshold = new Date(); // Calculate the threshold date
	// threshold.setMinutes(threshold.getMinutes() - 1); // Assuming 1 day is the threshold
//   console.log("before threshold")
	const currentTimestamp = Math.floor(new Date().getTime() / 1000);

  // Calculate the threshold as the timestamp 1 minute ago
  	const threshold = currentTimestamp - 60;
	// console.log(threshold)
	const overdueBooks = await db('borrowedBooks')
	  .select('username', 'bookId')
	  .where(db.raw('UNIX_TIMESTAMP(issueDate)'), '<', threshold)
	  .where('emailStatus', 0);
  	console.log(overdueBooks)
	// Send email notifications
	for (const book of overdueBooks) {
		// console.log('Before querying the database');
		const userData = await db('collectdata')
		  .select('email')
		  .where('username', book.username)
		  .first()
		  .catch((err) => {
			console.error('Error retrieving user data:', err);
		  });
		// console.log('After querying the database');
		
	console.log(userData.email)
	  const userEmail = userData.email;
  
	  // Compose and send the email using the transporter
	  const mailOptions = {
		from: 'pk.vibis@gmail.com',
		to: userEmail,
		subject: 'Book Return Reminder',
		text: `Please return the book with ID ${book.bookId}. It's overdue.`
	  };
  
	  transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
		  console.error('Email sending error:', error);
		} else {
		  console.log('Email sent:', info.response);
  
		  // Update the 'emailStatus' flag in the 'borrowedBooks' table to mark that the email has been sent
		  db('borrowedBooks')
			.where('username', book.username)
			.where('bookId', book.bookId)
			.update({ emailStatus: 1 })
			.catch((err) => {
			  console.error('Error updating emailStatus flag:', err);
			});
		}
	  });
	}
  });
  async function calculateAndDeductFines() {
    const overdueBooks = await db('borrowedBooks')
        .select()
        .whereRaw('borrowedDate < DATE_SUB(NOW(), INTERVAL 14 DAY)');

    for (const book of overdueBooks) {
        const borrowedDate = moment(book.borrowedDate);
        const today = moment();
        const daysOverdue = today.diff(borrowedDate, 'days');

        if (daysOverdue > 14) {

			await db('collectdata')
                .where({ username: book.username })
                .increment('fine', 5);
				
            await db('collectdata')
                .where({ username: book.username })
                .decrement('amount', 5);

            const userData = await db('collectdata')
                .select('amount')
                .where({ username: book.username })
                .first();


            if (userData.amount <= 0) {
                // Remove the user from CollectData
                await db('collectdata')
                    .where({ username: book.username })
                    .del();

                // Remove the user's borrowed books from borrowedBooks
                await db('borrowedBooks')
                    .where({ username: book.username })
                    .del();
            }
        }
    }
}

	// Schedule the function to run every day at a specific time (e.g., midnight)
cron.schedule('0 0 * * *', calculateAndDeductFines);

var authenticateController=require('./controllers/signin');
var registerController=require('./controllers/register');
var borrowBookController=require('./controllers/borrowBook');
var booksController=require('./controllers/books');


app.post('/register',(req, res) => { registerController.register(req,res,db)});
app.post('/borrow',(req, res) => { borrowBookController.borrow(req,res,db)});
app.post('/signin', authenticateController.authenticate(db));
app.get('/books', booksController.books(db).getBooks);
app.get('/borrowedBooks', async (req, res) => {
    const { username } = req.query;
    try {
        const borrowedBooksDetails = await db('borrowedBooks')
            .select('borrowedBooks.*', 'books.*')
            .join('books', 'borrowedBooks.bookId', 'books.bookId')
            .where('borrowedBooks.username', username);

        const currentDate = new Date(); // Get the current date

        // Calculate remaining days for each borrowed book
        const booksWithRemainingDays = borrowedBooksDetails.map(book => {
            const borrowedDate = new Date(book.borrowedDate); // Assuming borrowedDate is a field in the borrowedBooks table
            const borrowingDuration = 14; // Assuming 14 days borrowing duration

            const timeDiff = currentDate.getTime() - borrowedDate.getTime();
            const daysPassed = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Calculate days passed since borrowing

            const remainingDays = borrowingDuration - daysPassed;

            return {
                ...book,
                remainingDays: remainingDays > 0 ? remainingDays : 0 // Ensure remaining days doesn't go below zero
            };
        });

        res.json({ borrowedBooks: booksWithRemainingDays });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
});
app.get('/userDetails', async (req, res) => {
    const { username } = req.query;

    try {
        const userDetails = await db('collectdata')
            .select('amount', 'fine')
            .where('username', username)
            .first();

        if (userDetails) {
            res.json(userDetails); // Send the user details as JSON response
        } else {
            res.status(404).json({ error: 'User details not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});
app.post('/addToCart', (req, res) => {
    const { username, bookId } = req.body;

    db('Cart')
        .insert({ username, bookId })
        .then(() => {
            // Data inserted successfully, send a success response
            return res.status(200).json('Book added to cart successfully');
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json('Error adding book to cart');
        });
});
app.get('/userCart', async (req, res) => {
    const { username } = req.query;

    try {
        const cartDetails = await db('Cart')
            .select('Cart.*', 'Books.*')
            .join('Books', 'Cart.bookId', 'Books.bookId')
            .where('Cart.username', username);
		console.log(cartDetails)
        res.json({ userCart: cartDetails });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user cart details' });
    }
});
// ...
app.post('/borrowAllBooks', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        // Check if bookIds is an array and not null or undefined
        if (!bookId || !Array.isArray(bookId)) {
            throw new Error('Invalid bookIds array');
        }

        // Prepare an array of objects to be inserted into the borrowedBooks table
        const booksToBorrow = bookId.map(bookId => ({ username, bookId }));

        // Use bulkInsert to insert all borrowed books at once
        await db('borrowedBooks').insert(booksToBorrow);

        // Remove borrowed books from the user's cart
        await db('Cart').whereIn('bookId', bookId).andWhere('username', username).del();

        // Respond with a success message and prompt
        const promptMessage = `Successfully borrowed ${bookId.length} book(s)!`;
        res.status(200).json({ message: promptMessage });
    } catch (error) {
        console.error('Error borrowing books:', error);
        res.status(500).json({ message: 'Error borrowing books' });
    }
});
app.post('/removeFromCart', async (req, res) => {
    try {
        const { username, bookId } = req.body;

        // Remove the book from the cart in the database
        await db('Cart').where({ username, bookId }).del();

        res.status(200).json({ message: 'Book removed from cart successfully' });
    } catch (error) {
        console.error('Error removing book from cart:', error);
        res.status(500).json({ message: 'Error removing book from cart' });
    }
});






const port=3000
app.listen(port,function(err){
	if(err) console.log("error in listening")
	console.log("listening on port",port);
})

