import { z } from "zod";
export const asignarAdministradorSchema = z
.object({ rol: z.literal("ADMINISTRADOR") })
.strict()

export const retirarRolParametrosSchema = z
.object({
id: z.uuid(),
rol: z.enum(["PARTICIPANTE",
"ADMINISTRADOR"])
}).strict();