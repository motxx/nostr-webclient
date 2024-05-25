interface TertiaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
}

const TertiaryButton: React.FC<TertiaryButtonProps> = ({
  children,
  onClick,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`bg-gray-800 hover:bg-gray-900 active:bg-gray-900 dark:bg-gray-800 hover:dark:bg-gray-900 active:dark:bg-gray-900 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center ${props.className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default TertiaryButton
