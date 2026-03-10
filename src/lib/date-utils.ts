import { differenceInDays } from "date-fns"

/**
 * Calcula los días restantes hasta la eliminación permanente (60 días desde la fecha de eliminación).
 */
export const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt)
    const expirationDate = new Date(deletedDate)
    expirationDate.setDate(expirationDate.getDate() + 60)
    const daysLeft = differenceInDays(expirationDate, new Date())
    return Math.max(0, daysLeft)
}
