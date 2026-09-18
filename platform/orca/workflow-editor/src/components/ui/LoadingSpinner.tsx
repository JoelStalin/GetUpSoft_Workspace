import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
}

const sizeMap = {
  small: '16px',
  medium: '24px',
  large: '32px',
}

export default function LoadingSpinner({ size = 'medium', color = '#4A9EFF' }: LoadingSpinnerProps) {
  const sizeValue = sizeMap[size]

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: sizeValue,
          height: sizeValue,
          borderRadius: '50%',
          border: `2px solid rgba(255, 255, 255, 0.1)`,
          borderTopColor: color,
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
