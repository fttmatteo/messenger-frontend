import { differenceInDays } from "date-fns"

/**
 * Calculates days remaining until permanent deletion (60 days from creation/deletion date).
 * @param createdAt The ISO date string when the service was created/deleted.
 * @returns Number of days remaining (minimum 0).
 */
export const getDaysRemaining = (createdAt: string) => {
    const deletedDate = new Date(createdAt)
    const expirationDate = new Date(deletedDate)
    expirationDate.setDate(expirationDate.getDate() + 60)
    const daysLeft = differenceInDays(expirationDate, new Date())
    return Math.max(0, daysLeft)
}
