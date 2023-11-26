window.onload = function() {
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')); // Fetch already borrowed books
    const cartItems = JSON.parse(localStorage.getItem('cartItems')); // Fetch books in cart

    const booksNotBorrowed = cartItems.filter(cartBook => {
        // Check if the book from cartItems is not present in borrowedBooks
        return !borrowedBooks.some(borrowedBook => borrowedBook.bookId === cartBook.bookId);
    });

    const bookList = document.getElementById('borrowed-books-container');
    booksNotBorrowed.forEach(book => {

        const bookCard = document.createElement('div');
        bookCard.classList.add('col', 'pb-15');

        const card = document.createElement('div');
        card.classList.add('card', 'h-100');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'd-flex', 'flex-column', 'justify-content-center', 'align-items-center');

        const bookImage = document.createElement('img');
        bookImage.classList.add('card-img-top', 'text-center', 'img-thumbnail', 'small-image');
        bookImage.src = book.img;
        bookImage.alt = 'Book Cover';
        bookImage.style.height = '250px';
        bookImage.style.width = '200px';

        const bookName = document.createElement('h5');
        bookName.classList.add('card-title', 'text-center', 'mt-2');
        bookName.textContent = book.name;

        const authorName = document.createElement('p');
        authorName.classList.add('card-text', 'text-center');
        authorName.textContent = `Author: ${book.author}`;

        const bookId = document.createElement('p');
        bookId.classList.add('card-text', 'text-center');
        bookId.textContent = `Book ID: ${book.bookId}`;
        const removeButton = document.createElement('button');
        removeButton.classList.add('btn', 'btn-danger', 'mt-2','mb-3');
        removeButton.textContent = 'Remove';
       // Inside the forEach loop where you create book cards
       removeButton.addEventListener('click', async () => {
        try {
            // Remove the clicked book from the cart in the database
            const response = await fetch('http://localhost:3000/removeFromCart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: localStorage.getItem('username'), bookId: book.bookId })
            });
    
            if (response.ok) {
                // If the book was removed successfully from the cart in the database,
                // remove the card from the display
                bookList.removeChild(bookCard);
    
                // Update cartItems in local storage after successful removal
                const cartItems = JSON.parse(localStorage.getItem('cartItems'));
                const updatedCartItems = cartItems.filter(item => item.bookId !== book.bookId);
                localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
            } else {
                console.error('Failed to remove book from cart');
                // Handle error if needed
            }
        } catch (error) {
            console.error('Error removing book from cart:', error);
            // Handle error if needed
        }
    });
    

    
        // Appending the remove button to the card
        cardBody.appendChild(removeButton);
        cardBody.appendChild(bookImage);
        cardBody.appendChild(bookName);
        cardBody.appendChild(authorName);
        cardBody.appendChild(bookId);
        card.appendChild(cardBody);
        bookCard.appendChild(card);

        bookList.appendChild(bookCard);
    });

const borrowAllBtn = document.getElementById('borrowAllBtn');
borrowAllBtn.addEventListener('click', function() {
    const username = localStorage.getItem('username'); // Replace with actual username or fetch from user session
    const borrowedBooks = JSON.parse(localStorage.getItem('cartItems'));
    const bookIds = borrowedBooks.map(book => book.bookId);
console.log(bookIds)
    fetch('http://localhost:3000/borrowAllBooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            bookId: bookIds
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Borrowing books failed.'); 
    })
    .then(data => {
        console.log('Books borrowed successfully:', data);
        alert(data.message); // Display success message in an alert box
        window.location.href = 'borrowBook.html'; 
        const newlyBorrowedBooks = JSON.parse(localStorage.getItem('cartItems'));
        const updatedBorrowedBooks = newlyBorrowedBooks.concat(borrowedBooks);
        localStorage.setItem('borrowedBooks', JSON.stringify(updatedBorrowedBooks));
    })
    .catch(error => {
        console.error('Error borrowing books:', error.message);
    });
});
}