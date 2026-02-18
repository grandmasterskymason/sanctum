interface EmptyStateProps {
  message: string
  description?: string
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex h-64 flex-col items-center justify-center text-center">
      <p className="text-gray">{message}</p>
      {description && (
        <p className="mt-2 text-sm text-gray-light">{description}</p>
      )}
    </div>
  )
}
