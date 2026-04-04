exports.checkHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OEBIPAS API is running correctly.',
    timestamp: new Date()
  });
};
