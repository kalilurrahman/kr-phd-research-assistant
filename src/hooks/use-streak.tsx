import { useEffect, useState } from "react";
import { computeStreak, getUsageLog } from "@/lib/usage-tracker";

export function useStreak(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const update = () => setN(computeStreak(getUsageLog()));
    update();
    window.addEventListener("kr-phd:storage", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("kr-phd:storage", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return n;
}
