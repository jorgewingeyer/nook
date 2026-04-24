export const uploadFile = async (
  bucket: any,
  key: string,
  body: ArrayBuffer | ReadableStream<Uint8Array>,
  metadata?: Record<string, string>,
) => {
  return bucket.put(key, body, {
    customMetadata: metadata,
  });
};

export const downloadFile = async (bucket: any, key: string) => {
  return bucket.get(key);
};

export const deleteFile = async (bucket: any, key: string) => {
  return bucket.delete(key);
};

export const listFiles = async (bucket: any, prefix?: string) => {
  return bucket.list({ prefix });
};
