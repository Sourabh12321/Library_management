const express = require("express");
const bookRouter = express.Router();
const { bookModel } = require("../models/bookModel");
const {userModel} = require("../models/userModel")
const { authenticate } = require("../middlewares/auth");

bookRouter.post("/addbook", authenticate, async function createBook(req, res) {
  try {
    const { ISBN, title, author, publishedYear, quantity } = req.body;

    const existingBook = await bookModel.findOne({ ISBN });

    if (existingBook) {
      return res
        .status(400)
        .json({ message: "Book with this ISBN already exists." });
    }

    const newBook = new bookModel({
      ISBN,
      title,
      author,
      publishedYear,
      quantity,
    });

    await newBook.save();

    res.status(201).json({ message: "Book added successfully." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
});


bookRouter.patch("/update/:ISBN", async function updateBook(req, res) {
  try {
    const { ISBN } = req.params;
    const { title, author, publishedYear, quantity } = req.body;

    const book = await bookModel.findOne({ ISBN });

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.publishedYear = publishedYear || book.publishedYear;
    book.quantity = quantity || book.quantity;

    await book.save();

    res.status(200).json({ message: "Book details updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


bookRouter.delete("/delete/:ISBN", async function deleteBook(req, res) {
  try {
    const { ISBN } = req.params;

    const deletedBook = await bookModel.findOneAndDelete({ ISBN });

    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


bookRouter.get("/books", async function listBooks(req, res) {
  try {
    const books = await bookModel.find();

    res.status(200).json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





bookRouter.post(
  "/borrow/:bookId",
  authenticate,
  async function borrowBook(req, res) {
    const userId = req.body.userID;
    const { bookId } = req.params;

    try {
      const user = await userModel.findById(userId);
      const book = await bookModel.findById(bookId);

      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }

      const userIndex = user.borrowDetails.findIndex((detail) =>
        detail.book.equals(bookId)
      );


      if (userIndex !== -1) {
        return res
          .status(400)
          .json({ message: "You have already borrowed this book." });
      }

      if (user.borrowDetails.length >= 3) {
        return res
          .status(400)
          .json({
            message: "This book has reached its maximum borrowing limit.",
          });
      }

      if (user.quantity <= 0) {
        return res
          .status(400)
          .json({ message: "This book is currently not available." });
      }

      if (user.borrowDetails.length >= 3) {
        return res
          .status(400)
          .json({
            message: "You have reached your maximum borrowing limit.",
          });
      }

      // Update book quantity and add the book to the user's borrowDetails
      user.quantity -= 1;
      user.borrowDetails.push({
        book: bookId,
        returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      res.status(200).json({ message: "Book borrowed successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  }
);


bookRouter.delete(
  "/return/:bookId",
  authenticate,
  async function returnBook(req, res) {
    const userId = req.body.userID;
    const { bookId } = req.params;

    try {
      const user = await userModel.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const borrowedBookIndex = user.borrowDetails.findIndex(
        (detail) => detail.book.equals(bookId)
      );

      if (borrowedBookIndex === -1) {
        return res
          .status(400)
          .json({ message: "You haven't borrowed this book." });
      }

      // Find the book in the user's borrowDetails and remove it
      user.borrowDetails.splice(borrowedBookIndex, 1);

      // Find the book in the bookModel and increment its quantity
      // const book = await bookModel.findById(bookId);
      // if (book) {
      //   book.quantity += 1;
      //   await book.save();
      // }

      await user.save();

      res.status(200).json({ message: "Book returned successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error." });
    }
  }
);



module.exports = { bookRouter };
