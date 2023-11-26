window.onload = function() {
    const borrowedBooks = JSON.parse(localStorage.getItem('borrowedBooks'));

    const bookList = document.getElementById('borrowed-books-container');
    borrowedBooks.forEach(book => {
        // Inside your loop for creating book cards
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

        cardBody.appendChild(bookImage);
        cardBody.appendChild(bookName);
        cardBody.appendChild(authorName);
        cardBody.appendChild(bookId);
        card.appendChild(cardBody);
        bookCard.appendChild(card);

        bookList.appendChild(bookCard);
    });
}
