const borrow = (req, res, db) => {
  const username = req.body.username;
  const bookId = req.body.bookId;
  const currentDate = new Date(); // Get the current date

  // Check if the book is available and its quantity is greater than 0
  db('books')
    .where({ bookId: bookId })
    .where('quantity', '>', 0)
    .then((books) => {
      if (books.length === 0) {
        return res.json('Book not available or quantity is 0');
      }

      // Insert the borrowed book
      return db.transaction((trx) => {
        // Reduce the quantity in the 'books' table
        trx('books')
          .where({ bookId: bookId })
          .decrement('quantity', 1)
          .then(() => {
            // Insert the borrowed book in the 'borrowedBooks' table with the current date
            return trx('borrowedBooks')
              .insert({
                username: username,
                bookId: bookId,
                borrowedDate: currentDate, // Insert the current date
              });
          })
          .then(trx.commit)
          .catch(trx.rollback);
      })
        .then(() => {
           db('Cart').whereIn('bookId', bookId).andWhere('username', username).del();
          return res.status(200).json('Borrowed successfully');
        })
        .catch((err) => {
          console.log(err);
          return res.status(500).json('Error borrowing the book');
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json('Error checking book availability');
    });
};

module.exports = {
  borrow: borrow,
};
