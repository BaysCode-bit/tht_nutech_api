exports.health = (req, res) => {
  return res.status(200).json({
    status: 0,
    message: "OK",
    data: { time: new Date().toISOString() },
  });
};
