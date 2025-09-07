import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchBoxProps {
    placeholder?: string
    value: string
    onChange: (value: string) => void
    className?: string
}

export function SearchBox({
    placeholder = "Search...",
    value,
    onChange,
    className = ""
}: SearchBoxProps) {
    return (
        <div className={`relative ${className}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 pr-10 rtl:pl-10 rtl:pr-10"
            />
            {value && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange("")}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}
