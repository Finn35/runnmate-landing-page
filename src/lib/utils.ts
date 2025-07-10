import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleBuildTimeRequest() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return new Response(null, { status: 200 });
  }
  return null;
}
