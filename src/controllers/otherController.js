const pool = require("../utils/db");

exports.getBanners = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT banner_name, banner_image, description FROM banners ORDER BY id"
    );
    return res.status(200).json({ status: 0, message: "Sukses", data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};

exports.getServices = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT service_code, service_name, service_icon, service_tariff FROM services ORDER BY id"
    );
    return res.status(200).json({ status: 0, message: "Sukses", data: rows });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: 500, message: "Server error", data: null });
  }
};
