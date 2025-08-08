'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

// Accessibility wrapper for toast notifications
export function useAccessibleToast() {
  useEffect(() => {
    // Create aria-live region for screen readers
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.setAttribute('role', 'status')
    liveRegion.className = 'sr-only'
    liveRegion.id = 'toast-announcer'
    document.body.appendChild(liveRegion)

    // Override toast methods to announce to screen readers
    const originalSuccess = toast.success
    const originalError = toast.error
    const originalInfo = toast.info

    toast.success = (message: string, options?: any) => {
      liveRegion.textContent = `成功: ${message}`
      return originalSuccess(message, options)
    }

    toast.error = (message: string, options?: any) => {
      liveRegion.textContent = `エラー: ${message}`
      return originalError(message, options)
    }

    toast.info = (message: string, options?: any) => {
      liveRegion.textContent = `情報: ${message}`
      return originalInfo(message, options)
    }

    return () => {
      // Cleanup
      toast.success = originalSuccess
      toast.error = originalError
      toast.info = originalInfo
      document.body.removeChild(liveRegion)
    }
  }, [])
}

// Skip navigation link component
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
    >
      メインコンテンツへスキップ
    </a>
  )
}
EOF < /dev/null