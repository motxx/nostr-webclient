interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  ...props
}) => {
  return (
    <button
      {...props}
      className={`bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 hover:dark:bg-blue-700 active:dark:bg-blue-800 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center ${props.className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default PrimaryButton
