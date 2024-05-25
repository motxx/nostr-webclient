interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  ...props
}) => {
  console.log({ props })
  return (
    <button
      className={`bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 dark:bg-yellow-600 hover:dark:bg-yellow-700 active:dark:bg-yellow-800 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center ${props.className}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default SecondaryButton
