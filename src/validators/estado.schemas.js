import { z } from "zod";
export const actualizarActivoSchema = z
.object({ activo: z.boolean() }).strict();

