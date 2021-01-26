import * as React from "react";

export const useDelay = <T>(x: T, delay = 100) => {
  const [delayed, setDelayed] = React.useState<T | null>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDelayed(x), delay);
    return () => clearTimeout(timeout);
  }, [x, delay]);

  return delayed === x ? x : null;
};
