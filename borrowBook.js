window.onload = function() {
    var username = localStorage.getItem('username');
    fetch(`http://localhost:3000/userDetails?username=${username}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
        if (response.ok){
            return response.json();
        } else {
            throw new Error('Failed to fetch user details');
        }
    })
    .then(data => {
        document.getElementById('amount-display').innerText = `Amount: ${data.amount}`;
        document.getElementById('fine-display').innerText = `Fine: ${data.fine}`;
    })
    .catch(error => {
        console.error('Error:', error);
    });

    fetch("http://localhost:3000/books", {
        method: 'GET',
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Failed to fetch available books');
        }
    })
    .then(data => {
        const availableBooks = data.books;

        const bookList = document.getElementById('book-list');
        availableBooks.forEach(book => {
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

            const addToCartBtn = document.createElement('button');
            addToCartBtn.classList.add('btn', 'btn-primary', 'mt-2');
            addToCartBtn.textContent = 'Add to Cart';
            const borrowBtn = document.createElement('button');
            borrowBtn.classList.add('btn', 'btn-success', 'mt-2');
            borrowBtn.textContent = 'Borrow';
            const isBookInCart = localStorage.getItem('cartItems') ? JSON.parse(localStorage.getItem('cartItems')).some(item => item.bookId === book.bookId) : false;
            const isBookBorrowed= localStorage.getItem('borrowedBooks') ? JSON.parse(localStorage.getItem('borrowedBooks')).some(item => item.bookId === book.bookId) : false;
            if (isBookInCart) {
                addToCartBtn.textContent = 'Already in Cart';
                addToCartBtn.disabled = true;
            } 
            if (isBookBorrowed) {
                addToCartBtn.textContent = 'Add to Cart';
                borrowBtn.textContent = 'Already Borrowed';
                addToCartBtn.disabled = true;
                borrowBtn.disabled = true;
            } 
            else {
                addToCartBtn.addEventListener('click', function() {
                    addToCartBtn.textContent = 'Adding...'; // Change button text
                    addToCartBtn.disabled = true; // Disable the button immediately
                    addToCartBtn.textContent = 'Added to Cart';
                    addBookToCart(book.bookId);
                });
                borrowBtn.addEventListener('click', function() {
                    borrowBtn.textContent = 'Borrowing...'; // Change button text
                    borrowBtn.disabled = true; // Disable the button immediately
                    borrowBook(book.bookId);
                    borrowBtn.textContent = 'Borrowed';
                });
            }

            cardBody.appendChild(bookImage);
            cardBody.appendChild(bookName);
            cardBody.appendChild(authorName);
            cardBody.appendChild(bookId);
            cardBody.appendChild(addToCartBtn);
            cardBody.appendChild(borrowBtn);
            card.appendChild(cardBody);
            bookCard.appendChild(card);

            bookList.appendChild(bookCard);
        });

        function addBookToCart(bookId) {
            const username = localStorage.getItem('username');
            fetch('http://localhost:3000/addToCart', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    bookId: bookId
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json(); // Return the added book data
                } else {
                    throw new Error('Failed to add book to cart');
                }
            })
            .then(addedBook => {
                const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
                cartItems.push(addedBook); // Add the newly added book to the cartItems
                localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Update cartItems in localStorage
                alert('Book added to cart successfully!');
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Already in Cart';
                location.reload(); // Refresh the page after successful addition
                
                
            })
            .catch(error => {
                console.error('Error:', error);
                addToCartBtn.textContent = 'Add to Cart'; // Reset button text on error
                addToCartBtn.disabled = false;
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
};



function fetchUserBorrowedBooks(username) {
    return fetch(`http://localhost:3000/borrowedBooks?username=${username}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch user\'s borrowed books');
            }
        })
        .then(data => data.borrowedBooks)
        .catch(error => console.error('Error fetching borrowed books:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    function displayUserBorrowedBooks() {
        const loggedInUser = localStorage.getItem('username');
        fetchUserBorrowedBooks(loggedInUser)
            .then(userBorrowedBooks => {
                if (userBorrowedBooks.length > 0) {
                    localStorage.setItem('borrowedBooks', JSON.stringify(userBorrowedBooks));
                    window.location.href = 'borrowedBooks.html';
                } else {
                    alert('You have not borrowed any books yet!');
                }
            })
            .catch(error => console.error('Error displaying borrowed books:', error));
    }

    document.querySelector('.navbar-nav .nav-link[href="#"]').addEventListener('click', function (event) {
        event.preventDefault();
        displayUserBorrowedBooks();
    });
});

function fetchUserCart(username) {
    return fetch(`http://localhost:3000/userCart?username=${username}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch user\'s cart items');
            }
        })
        .then(data => data.userCart)
        .catch(error => console.error('Error fetching cart items:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    function displayUserCart() {
        const loggedInUser = localStorage.getItem('username');
        fetchUserCart(loggedInUser)
            .then(userCartItems => {
                if (userCartItems.length > 0) {
                    localStorage.setItem('cartItems', JSON.stringify(userCartItems));
                    window.location.href = 'cart.html';
                } else {
                    alert('Your cart is empty');
                }
            })
            .catch(error => console.error('Error displaying cart items:', error));
    }

    document.getElementById('cart').addEventListener('click', function (event) {
        event.preventDefault();
        displayUserCart();
    });

    
});
function borrowBook(bookId) {
    const username = localStorage.getItem('username');
    fetch('http://localhost:3000/borrow', {
        method: 'POST',
        body: JSON.stringify({
            username: username,
            bookId: bookId
        }),
        headers: {
            'Content-type': 'application/json; charset=UTF-8'
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Book borrowed successfully!');

            // Update the borrowedBooks in localStorage
            const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks')) || [];
            const addedBook = { bookId: bookId };
            borrowedBooks.push(addedBook);
            localStorage.setItem('borrowedBooks', JSON.stringify(borrowedBooks));

            const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
            const updatedCartItems = cartItems.filter(item => item.bookId !== bookId);
            localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
            // Find the corresponding buttons by bookId
            const borrowBtn = document.querySelector(`#borrowBtn-${bookId}`);
            const addToCartBtn = document.querySelector(`#addToCartBtn-${bookId}`);
            addToCartBtn.textContent = 'A';
            if (borrowBtn && addToCartBtn) {
                borrowBtn.disabled = true;
                borrowBtn.textContent = 'Borrowed';
                addToCartBtn.disabled = true;
                addToCartBtn.textContent = 'Already Borrowed';
            }
            // You may want to update UI or perform other actions here
        } else {
            throw new Error('Failed to borrow book');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle error scenario
    });
}


function logout() {
    localStorage.clear(); // Clear the localStorage
    window.location.href = 'welcomepage.html'; // Redirect to the login page
}

// Attach the logout function to the logout link
const logoutLink = document.getElementById('logoutLink');
logoutLink.addEventListener('click', logout);