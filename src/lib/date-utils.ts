import { differenceInDays } from "date-fns"

/**
 * Calculates days remaining until permanent deletion (60 days from deletion date).
 * @param deletedAt The ISO date string when the service was moved to trash.
 * @returns Number of days remaining (minimum 0).
 */
export const getDaysRemaining = (deletedAt: string) => {
    const deletedDate = new Date(deletedAt)
    const expirationDate = new Date(deletedDate)
    expirationDate.setDate(expirationDate.getDate() + 60)
    const daysLeft = differenceInDays(expirationDate, new Date())
    return Math.max(0, daysLeft)
}
