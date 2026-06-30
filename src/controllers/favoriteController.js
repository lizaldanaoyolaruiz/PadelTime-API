import User from "../models/User.js";
import Complex from "../models/Complex.js";

export const getFavoritos = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id)
      .populate("favoritos", "_id name city location image ratingAverage price")
      .lean();

    return res.json({ favoritos: usuario.favoritos || [] });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener favoritos.", error: error.message });
  }
};

export const checkFavorito = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id)
      .select("favoritos")
      .lean();
    const esFavorito = (usuario.favoritos || []).some(
      (id) => id.toString() === req.params.complexId,
    );
    return res.json({ esFavorito });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al verificar favorito.", error: error.message });
  }
};

export const agregarFavorito = async (req, res) => {
  try {
    const { complexId } = req.params;

    const complejo = await Complex.findById(complexId);
    if (!complejo)
      return res.status(404).json({ message: "Complejo no encontrado." });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { favoritos: complexId },
    });

    return res.json({ message: "Agregado a favoritos.", esFavorito: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al agregar favorito.", error: error.message });
  }
};

export const quitarFavorito = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { favoritos: req.params.complexId },
    });

    return res.json({ message: "Eliminado de favoritos.", esFavorito: false });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al quitar favorito.", error: error.message });
  }
};
