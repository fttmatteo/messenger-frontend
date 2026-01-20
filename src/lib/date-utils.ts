import { differenceInDays } from "date-fns"

/**
 * Calcula los días restantes hasta la eliminación permanente (60 días desde la fecha de eliminación).
 * @param deletedAt La cadena de fecha ISO cuando el servicio fue movido a la papelera.
 * @returns Número de días restantes (mínimo 0).
 */
export const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt)
    const expirationDate = new Date(deletedDate)
    expirationDate.setDate(expirationDate.getDate() + 60)
    const daysLeft = differenceInDays(expirationDate, new Date())
    return Math.max(0, daysLeft)
}
