export interface UserMenuProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  onLogout?: () => void
  onProfile?: () => void
  onSettings?: () => void
  className?: string
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
  transformOrigin?: {
    vertical: 'top' | 'center' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}