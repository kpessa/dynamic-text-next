export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null

  return ((...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }) as T
}