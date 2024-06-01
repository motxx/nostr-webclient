import classNames from 'classnames'

interface PrimaryButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  className,
}) => {
  return (
    <button
      className={classNames(
        'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 hover:dark:bg-blue-700 active:dark:bg-blue-800 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
