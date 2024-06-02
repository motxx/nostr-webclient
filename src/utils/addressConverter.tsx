export const nostrAddressForDisplay = (nostrAddress: string) => {
  return nostrAddress.substring(0, 2) === '_@'
    ? nostrAddress.substring(1)
    : nostrAddress
}

export const userIdForDisplay = (userId: string) => {
  return userId.length > 3 && userId.substring(0, 3) === 'npub'
    ? userId.substring(0, 17)
    : nostrAddressForDisplay(userId)
}
