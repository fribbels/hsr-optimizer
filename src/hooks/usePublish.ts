export const usePublish = () => {
  return (event, data) => {
    // emitter.emit(event, data);
    console.log(`++++++++++ Publishing [${event}] with data: ${data}`)
    document.dispatchEvent(new CustomEvent(event, { detail: data }))
  }
}
