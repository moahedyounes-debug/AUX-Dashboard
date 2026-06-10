// React hook: loads + caches the live AUX ticket data (admin / All access).
import { useQuery } from "@tanstack/react-query";
import { loadAllData, type LoadedData } from "./data";

export function useTickets() {
  return useQuery<LoadedData>({
    queryKey: ["aux", "tickets"],
    queryFn: () => loadAllData(),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}