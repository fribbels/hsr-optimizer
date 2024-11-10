export const usePublish = () => {
  return (event: string, data: string) => {
    console.log(`Publishing [${event}] with data: ${data}`)
    document.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
}
