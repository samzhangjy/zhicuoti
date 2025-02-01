export async function* splitStream(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const data = new TextDecoder().decode(value);
      yield data;
    }
  } finally {
    reader.releaseLock();
  }
}
