const Transaction = require("../models/transaction");
const { StatusCodes } = require("http-status-codes");

const CreateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(StatusCodes.CREATED).json({ msg: "Inquiry sent to provider", transaction });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

const GetProviderTransactions = async (req, res) => {
  try {
    // This assumes we link transactions to providers via listing
    const transactions = await Transaction.find().populate({
      path: "listingId",
      match: { providerId: req.user.userId }
    });
    // Filter out null listings (those that don't belong to this provider)
    const myTransactions = transactions.filter(t => t.listingId !== null);
    res.status(StatusCodes.OK).json({ transactions: myTransactions });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: err.message });
  }
};

module.exports = { CreateTransaction, GetProviderTransactions };
