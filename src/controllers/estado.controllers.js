export const actualizarActivo = async (req, res) => {
const usuario = await cambiarActivo(
req.parametrosValidados.id,
req.bodyValidado.activo);
return res.json(usuario);
};