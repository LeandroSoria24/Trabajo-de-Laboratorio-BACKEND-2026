import { app } from "./app.js";
import { iniciarLimpiezaRevocaciones } from "./tareas/limpiezaRevocaciones.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
    iniciarLimpiezaRevocaciones();
});
