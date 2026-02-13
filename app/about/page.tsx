import { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/lib/site-config";
import { IconClock, IconEyeOff, IconLock, IconShield } from "@tabler/icons-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "About",
    description: "Learn about PU Pad and its zero-knowledge encryption model.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-4xl max-h-screen px-6 py-16">
            <div className="mb-12 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                    About {siteConfig.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                    A privacy-first, zero-knowledge encrypted notes application.
                </p>
            </div>

            <Separator className="mb-12" />

            <section className="mb-16 space-y-4">
                <h2 className="text-2xl font-semibold">Why This Exists</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Most note apps require accounts, store your content in plain text,
                    or analyze your data. {siteConfig.name} does none of that.
                    Your notes are encrypted in your browser before they ever reach the server.
                    Only your code can decrypt them.
                </p>
            </section>

            {/* Features Grid */}
            <section className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <IconShield className="h-6 w-6 text-primary" />
                        <CardTitle>Zero-Knowledge</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        The server never sees your decrypted data.
                        Encryption and decryption happen entirely in your browser.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <IconLock className="h-6 w-6 text-primary" />
                        <CardTitle>Single Code Access</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        No accounts. No email. No recovery.
                        Your code is your key. Lose it, and the data is gone.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <IconEyeOff className="h-6 w-6 text-primary" />
                        <CardTitle>No Tracking</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        No analytics on your content.
                        No behavioral profiling.
                        Privacy is not optional here.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <IconClock className="h-6 w-6 text-primary" />
                        <CardTitle>Self-Destruct</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                        Notes can automatically expire and delete themselves,
                        including revision history.
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <div className="mt-20 text-sm text-muted-foreground">
                Built by <Link target="_blank" href="https://kishore-sv.me" className="hover:text-primary underline underline-offset-2 transition-all ease-in-out">{siteConfig.author}</Link>.
                Privacy is a feature, not a marketing line.
            </div>
        </div>
    );
}
