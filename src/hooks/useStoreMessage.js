import { useCallback, useEffect, useState } from "react";

export function useStoreMessage(timeout = 3000) {
  const [storeMessage, setStoreMessage] = useState("");

  useEffect(() => {
    if (!storeMessage) return undefined;

    const timer = setTimeout(() => setStoreMessage(""), timeout);
    return () => clearTimeout(timer);
  }, [storeMessage, timeout]);

  const showStoreMessage = useCallback((message) => {
    setStoreMessage(message);
  }, []);

  return {
    storeMessage,
    setStoreMessage: showStoreMessage,
    clearStoreMessage: () => setStoreMessage("")
  };
}
