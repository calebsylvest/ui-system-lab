import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ui-cheatsheet: 'Count reads "1 members"' -> pluralize with Intl.PluralRules.
const pluralRules = new Intl.PluralRules("en-US")
export function plural(n: number, one: string, other: string) {
  return `${n} ${pluralRules.select(n) === "one" ? one : other}`
}
