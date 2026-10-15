import { z } from "zod";
export const asignarAdministradorSchema = z
.object({ rol: z.literal("ADMINISTRADOR") })
.strict()

