import React, { useState, DragEvent } from 'react'
import Avatar from 'boring-avatars'

const SettingProfile: React.FC = () => {
  const [avatar, setAvatar] = useState<File | null>(null)
  const [banner, setBanner] = useState<File | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [website, setWebsite] = useState('')
  const [nostrAddress, setNostrAddress] = useState('')
  const [lightningAddress, setLightningAddress] = useState('')
  const [bio, setBio] = useState('')

  const handleDrop =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]
      setter(file)
    }

  const handleSave = () => {
    console.log({
      avatar,
      banner,
      username,
      displayName,
      website,
      nostrAddress,
      lightningAddress,
      bio,
    })
  }

  const renderImagePreview = (file: File | null, className: string) => {
    return file ? (
      <img
        src={URL.createObjectURL(file)}
        alt="Preview"
        className={className}
      />
    ) : null
  }

  return (
    <div>
      <div className="relative mb-14">
        <div
          className="relative group w-full h-[200px] bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-900 transition-colors duration-300 ease-in-out overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop(setBanner)}
        >
          {renderImagePreview(
            banner,
            'w-full object-cover group-hover:opacity-70 transition-opacity duration-300 ease-in-out'
          )}
          {!banner && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="absolute font-thin text-white text-center group-hover:opacity-70 transition-opacity duration-300 ease-in-out">
                Upload Banner
              </p>
            </div>
          )}
        </div>
        <div
          className={
            'z-20 absolute inset-0 flex justify-start items-start top-10 left-20 ' +
            'transform -translate-x-1/2 translate-y-1/2 w-32 h-32 rounded-full bg-gray-100 dark:bg-zinc-900 border-2 border-white dark:border-black'
          }
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop(setAvatar)}
        >
          <div className="relative group w-full h-full flex items-center justify-center">
            {renderImagePreview(
              avatar,
              'w-full h-full object-cover rounded-full group-hover:opacity-70 transition-opacity duration-300 ease-in-out'
            ) || (
              <div className="w-full h-full object-cover group-hover:opacity-70 transition-opacity duration-300 ease-in-out">
                <Avatar
                  size={124}
                  name={username}
                  variant="beam"
                  colors={[
                    '#92A1C6',
                    '#146A7C',
                    '#F0AB3D',
                    '#C271B4',
                    '#C20D90',
                  ]}
                />
              </div>
            )}
            {!avatar && (
              <p className="absolute font-thin text-white text-center group-hover:opacity-70 transition-opacity duration-300 ease-in-out">
                Upload Avatar
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="p-4">
        {[
          {
            label: 'ユーザ名',
            value: username,
            setter: setUsername,
            type: 'text',
          },
          {
            label: '表示名',
            value: displayName,
            setter: setDisplayName,
            type: 'text',
          },
          {
            label: 'ウェブサイト',
            value: website,
            setter: setWebsite,
            type: 'text',
          },
          {
            label: 'Nostr Address (NIP-05)',
            value: nostrAddress,
            setter: setNostrAddress,
            type: 'text',
          },
          {
            label: 'Lightning Address',
            value: lightningAddress,
            setter: setLightningAddress,
            type: 'text',
          },
          { label: '自己紹介', value: bio, setter: setBio, type: 'textarea' },
        ].map(({ label, value, setter, type }, index) => (
          <div className="mb-4" key={index}>
            <label className="block text-gray-700 dark:text-gray-200">
              {label}
            </label>
            {type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          保存
        </button>
      </div>
    </div>
  )
}

export default SettingProfile
