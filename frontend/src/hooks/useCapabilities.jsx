import { useAuth } from "./useAuth";

export function useCapabilities() {
  const { capabilities } = useAuth();
  return capabilities || {};
}
