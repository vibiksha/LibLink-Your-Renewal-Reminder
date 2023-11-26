const books = (db) => {
    const getBooks = async (req, res) => {
      try {
        const books = await db('books')
          .select('name', 'bookId', 'author','img')
          .where('quantity', '>', 0);
        res.json({ books });
      } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
      }
    };
  
    return { getBooks };
  };
  
  module.exports = {
    books: books
  };
  