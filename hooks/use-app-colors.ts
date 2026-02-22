import { AppColors } from "@/constants/theme";
import { useColorScheme } from "./use-color-scheme";

/** Returns the correct AppColors slice for the current colour scheme. */
export function useAppColors() {
  const scheme = useColorScheme() ?? "light";
  return { ...AppColors[scheme], accent: AppColors.accent };
}
