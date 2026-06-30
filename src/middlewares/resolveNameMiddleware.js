const resolveRegisterName = (req, res, next) => {
  const { nombre, apellido } = req.body;
  if (nombre !== undefined) {
    req.body.name = [nombre, apellido].filter(Boolean).join(" ").trim();
  }
  next();
};

export default resolveRegisterName;
