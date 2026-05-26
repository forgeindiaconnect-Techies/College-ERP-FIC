import express from 'express';
import Book from '../models/Book.js';
import IssueRecord from '../models/IssueRecord.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all books
// @route   GET /api/library/books
// @access  Private
router.get('/books', protect, async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching books' });
  }
});

// @desc    Add a new book
// @route   POST /api/library/books
// @access  Private (Admin/SubAdmin)
router.post('/books', protect, authorize('Admin', 'Sub Admin'), async (req, res) => {
  try {
    const { isbn, title, author, category, copies, shelfLocation } = req.body;
    
    const count = await Book.countDocuments();
    const bookId = `B${String(count + 1).padStart(3, '0')}`;

    const newBook = new Book({
      bookId,
      isbn,
      title,
      author,
      category,
      copies,
      available: copies,
      shelfLocation
    });

    const createdBook = await newBook.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid book data' });
  }
});

// @desc    Get all issue records
// @route   GET /api/library/issues
// @access  Private
router.get('/issues', protect, async (req, res) => {
  try {
    const issues = await IssueRecord.find({});
    
    // Auto-calculate fine before sending if Overdue
    const today = new Date();
    const updatedIssues = issues.map(issue => {
      if (issue.status === 'Issued' && today > issue.dueDate) {
        issue.status = 'Overdue';
        const diffTime = Math.abs(today - issue.dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        issue.fine = diffDays * 10; // ₹10 per day fine
      }
      return issue;
    });

    res.json(updatedIssues);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching issues' });
  }
});

// @desc    Issue a book
// @route   POST /api/library/issues
// @access  Private (Admin/SubAdmin)
router.post('/issues', protect, authorize('Admin', 'Sub Admin'), async (req, res) => {
  try {
    const { bookId, studentName, regNo, dueDate } = req.body;
    
    const book = await Book.findOne({ bookId });
    if (!book || book.available <= 0) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    const count = await IssueRecord.countDocuments();
    const issueId = `IS-${100 + count + 1}`;

    const newIssue = new IssueRecord({
      issueId,
      bookId: book._id,
      bookTitle: book.title,
      studentName,
      regNo,
      issueDate: new Date(),
      dueDate: new Date(dueDate),
      status: 'Issued'
    });

    const createdIssue = await newIssue.save();
    
    // Update book availability
    book.available -= 1;
    await book.save();

    res.status(201).json(createdIssue);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid issue data' });
  }
});

// @desc    Return a book
// @route   PUT /api/library/issues/:id/return
// @access  Private (Admin/SubAdmin)
router.put('/issues/:id/return', protect, authorize('Admin', 'Sub Admin'), async (req, res) => {
  try {
    const issue = await IssueRecord.findOne({ issueId: req.params.id });
    if (!issue) {
      return res.status(404).json({ message: 'Issue record not found' });
    }

    issue.status = 'Returned';
    issue.returnDate = new Date();
    issue.conditionOnReturn = req.body.condition || 'Good';
    
    // Calculate final fine
    const today = new Date();
    if (today > issue.dueDate) {
      const diffTime = Math.abs(today - issue.dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      issue.fine = diffDays * 10;
    }

    const updatedIssue = await issue.save();

    // Increment book availability
    const book = await Book.findById(issue.bookId);
    if (book) {
      book.available += 1;
      await book.save();
    }

    res.json(updatedIssue);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error returning book' });
  }
});

export default router;
