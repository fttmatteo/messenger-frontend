/**
 * Guard Components
 * 
 * These components protect routes based on device type requirements.
 * - DesktopOnlyGuard: Shown to mobile users trying to access admin panel
 * - MobileOnlyGuard: Shown to desktop users trying to access messenger app
 */
export { DesktopOnlyGuard } from './DesktopOnlyGuard.tsx'
export { MobileOnlyGuard } from './MobileOnlyGuard.tsx'
