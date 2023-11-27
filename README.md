# LibLink-Your-Renewal-Reminder

This project is an Express.js-based library management system that includes features for user registration, book borrowing, fine calculation, and email notifications for overdue books.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/vibiksha/LibLink-Your-Renewal-Reminder.git
    ```

2. Install dependencies:

    ```bash
    cd LibLink-Your-Renewal-Reminder
    npm install express knex nodemailer node-cron
    ```
3. Set up the database:
    - Create a MySQL database named `register`.
    - Run the following SQL commands to create the required tables:

    ```sql
    -- Create 'books' table
    CREATE TABLE books (
        bookId INT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        img VARCHAR(255)
    );

    -- Create 'collectdata' table
    CREATE TABLE collectdata (
        username VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        fine DECIMAL(10,2) DEFAULT 0
    );

    -- Create 'cart' table
    CREATE TABLE cart (
        username VARCHAR(255),
        bookId INT,
        PRIMARY KEY (username, bookId),
        FOREIGN KEY (username) REFERENCES collectdata(username),
        FOREIGN KEY (bookId) REFERENCES books(bookId)
    );

    -- Create 'borrowedBooks' table
    CREATE TABLE borrowedBooks (
        username VARCHAR(255),
        bookId INT,
        issueDate DATETIME,
        emailStatus INT DEFAULT 0,
        borrowedDate DATETIME,
        FOREIGN KEY (username) REFERENCES collectdata(username),
        FOREIGN KEY (bookId) REFERENCES books(bookId)
    );
    ```

4. Modify the `knex` configuration in `server.js` to match your database settings (`host`, `user`, `password`).

5. Start the server:

    ```bash
    node server.js
    ```

### Additional Dependencies

- `express`: Web framework for Node.js.
- `knex`: SQL query builder for Node.js.
- `nodemailer`: Module for sending emails from Node.js applications.
- `node-cron`: Cron-like scheduler for Node.js.

Make sure to have these installed and configured appropriately for the project to run smoothly.

### Routes

- `POST /register`: Register a user.
- `POST /borrow`: Borrow a book.
- `POST /signin`: User authentication.
- `GET /books`: Get all available books.
- `GET /borrowedBooks`: Get books borrowed by a specific user.
- `GET /userDetails`: Get details (amount and fine) of a user.
- `POST /addToCart`: Add a book to the user's cart.
- `GET /userCart`: Get the user's cart details.
- `POST /borrowAllBooks`: Borrow multiple books at once.
- `POST /removeFromCart`: Remove a book from the user's cart.

### Cron Jobs

- Email notifications for overdue books are sent every minute (`cron.schedule('*/1 * * * *', ...)`)
- Fines are calculated and deducted daily at midnight (`cron.schedule('0 0 * * *', ...)`)
    - Fines increase after 14 days of book borrowing.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

