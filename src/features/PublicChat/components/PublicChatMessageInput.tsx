import { FormEvent } from 'react'
import { IoMdSend } from 'react-icons/io'

export const PublicChatMessageInput: React.FC<{
  newMessage: string
  setNewMessage: (message: string) => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
}> = ({ newMessage, setNewMessage, handleSubmit }) => (
  <div className="sticky bottom-0 mb-20 sm:mb-0 p-2 sm:px-4 sm:border-t border-gray-200/30 dark:border-gray-700/30 bg-white/60 dark:bg-black/60 backdrop-blur-sm">
    <form className="flex" onSubmit={handleSubmit}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        className="flex-grow rounded-full px-4 sm:px-0 sm:rounded-none outline-none w-full bg-gray-300/50 dark:bg-gray-800/50 sm:bg-transparent sm:dark:bg-transparent text-gray-700 dark:text-gray-300"
        placeholder="Type your message"
      />
      <button
        type="submit"
        className="ml-1 p-2 flex justify-center items-center bg-blue-500/80 hover:bg-blue-600/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-white rounded-full sm:rounded transition duration-200"
      >
        <IoMdSend className="text-xl" />
      </button>
    </form>
  </div>
)
