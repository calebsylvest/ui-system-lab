import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { personHue } from "@/data"

/** A person as themselves: stable initials on a pale tint of their own hue. */
export function PersonAvatar({ initials, className }: { initials: string; className?: string }) {
  const hue = personHue[initials] ?? 0
  return (
    <Avatar className={className}>
      <AvatarFallback className="person" style={{ "--h": hue } as React.CSSProperties}>{initials}</AvatarFallback>
    </Avatar>
  )
}
