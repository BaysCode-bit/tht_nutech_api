const financeModel = require("../models/financeModel");

exports.topUp = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res
        .status(401)
        .json({ status: 401, message: "Token tidak disertakan", data: null });
    }

    const amountRaw =
      req.body &&
      (req.body.top_up_amount ?? req.body.amount ?? req.body.topUpAmount);
    const amount = Number(amountRaw);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        status: 102,
        message:
          "Paramater amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
        data: null,
      });
    }

    const user = await financeModel.getUserByEmail(req.user.email);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    const tx = await financeModel.insertTopUpTransaction({
      user_id: user.id,
      amount,
      description: "Top Up balance via API",
    });

    const updatedUser = await financeModel.getUserById(user.id);

    return res.status(200).json({
      status: 0,
      message: "Top Up Balance berhasil",
      data: {
        balance: updatedUser ? String(updatedUser.balance) : null,
        transaction: tx,
      },
    });
  } catch (err) {
    console.error(">>> topUp error", err);
    if (err.message === "INSUFFICIENT_BALANCE") {
      return res
        .status(400)
        .json({ status: 102, message: "Saldo tidak mencukupi", data: null });
    }
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.getBalance = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res
        .status(401)
        .json({ status: 401, message: "Token tidak disertakan", data: null });
    }

    const user = await financeModel.getUserByEmail(req.user.email);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    return res.status(200).json({
      status: 0,
      message: "Get Balance Berhasil",
      data: { balance: String(user.balance) },
    });
  } catch (err) {
    console.error(">>> getBalance error", err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.createTransaction = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res
        .status(401)
        .json({ status: 401, message: "Token tidak disertakan", data: null });
    }

    const { service_code, service_name } = req.body || {};
    const amountRaw =
      req.body &&
      (req.body.amount ?? req.body.total_amount ?? req.body.top_up_amount);
    const amount = Number(amountRaw);

    if (!service_code) {
      return res
        .status(400)
        .json({ status: 102, message: "Service code harus diisi", data: null });
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        status: 102,
        message:
          "Parameter amount hanya boleh angka dan tidak boleh lebih kecil dari 0",
        data: null,
      });
    }

    const user = await financeModel.getUserByEmail(req.user.email);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    const tx = await financeModel.createPaymentTransaction({
      user_id: user.id,
      service_code,
      service_name: service_name || null,
      amount,
      description: `Payment for ${service_code}`,
    });

    const updatedUser = await financeModel.getUserById(user.id);

    return res.status(200).json({
      status: 0,
      message: "Transaksi berhasil",
      data: {
        invoice_number: tx.invoice_number,
        service_code: tx.service_code,
        service_name: tx.service_name,
        transaction_type: tx.transaction_type,
        total_amount: tx.total_amount,
        created_on: tx.created_on,
        balance: updatedUser ? String(updatedUser.balance) : null,
      },
    });
  } catch (err) {
    console.error(">>> createTransaction error", err);

    if (err.message === "INSUFFICIENT_BALANCE") {
      return res
        .status(400)
        .json({ status: 102, message: "Saldo tidak mencukupi", data: null });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res
        .status(401)
        .json({ status: 401, message: "Token tidak disertakan", data: null });
    }

    const offset = Number.isFinite(Number(req.query.offset))
      ? Number(req.query.offset)
      : 0;
    const limit = Number.isFinite(Number(req.query.limit))
      ? Number(req.query.limit)
      : 10;

    const user = await financeModel.getUserByEmail(req.user.email);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    const history = await financeModel.getTransactionHistory(
      user.id,
      offset,
      limit
    );

    return res.status(200).json({
      status: 0,
      message: "Get History Transaksi berhasil",
      data: history,
    });
  } catch (err) {
    console.error(">>> getHistory error", err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};
