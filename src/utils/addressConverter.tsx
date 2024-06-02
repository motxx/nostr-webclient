export const nostrAddressForDisplay = (nostrAddress: string) => {
  return nostrAddress.substring(0, 2) === '_@'
    ? nostrAddress.substring(1)
    : nostrAddress
}
