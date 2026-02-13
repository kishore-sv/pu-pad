"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        onClick={toggleTheme}
                        size="sm"
                        variant="outline"
                        className="cursor-pointer rounded-md px-2"
                        aria-label="Toggle theme"
                    >
                        {isDark ? (
                            <IconSun className="size-4 shrink-0" />
                        ) : (
                            <IconMoon className="size-4 shrink-0" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    {isDark ? "Switch to light mode" : "Switch to dark mode"}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
