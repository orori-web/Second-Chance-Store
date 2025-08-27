// models/searchHistory.js
const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  searchCount: { type: Number, default: 1 },
  lastSearched: { type: Date, default: Date.now }
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);
module.exports = SearchHistory;
