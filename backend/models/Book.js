import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  bookId: { type: String, required: true, unique: true },
  isbn: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, required: true },
  copies: { type: Number, required: true, default: 1 },
  available: { type: Number, required: true, default: 1 },
  shelfLocation: { type: String, default: 'General Stack' }
}, { timestamps: true });

export default mongoose.model('Book', bookSchema);
