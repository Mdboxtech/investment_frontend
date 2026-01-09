"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import authService, { User } from "@/lib/api/services/auth.service"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EmailVerificationModalProps {
    user: User | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EmailVerificationModal({
    user,
    open,
    onOpenChange,
}: EmailVerificationModalProps) {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Robust check: verified only if we have a truthy string/date
    const isVerified = !!user?.email_verified_at

    useEffect(() => {
        // Reset state when user changes or modal re-opens
        if (open) {
            setSent(false)
            setError(null)
        }
    }, [open, user])

    const handleSendVerification = async () => {
        setLoading(true)
        setError(null)
        try {
            await authService.sendVerificationEmail()
            setSent(true)
        } catch (err: any) {
            console.error("Failed to send verification email:", err)
            setError(err.response?.data?.message || "Failed to send verification link")
        } finally {
            setLoading(false)
        }
    }

    // If user is verified, we shouldn't show this modal usually, 
    // but if it's open for some reason, we can show a success state or just null.
    if (isVerified && !sent) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                        <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <DialogTitle className="text-center text-xl">Verify your email</DialogTitle>
                    <DialogDescription className="text-center">
                        {sent
                            ? "We've sent a verification link to your email address."
                            : "Please verify your email address to access all features of the platform."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="text-center font-medium bg-muted px-4 py-2 rounded-lg">
                        {user?.email}
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {sent && (
                        <div className="flex items-center gap-2 text-success font-medium">
                            <CheckCircle className="h-4 w-4" />
                            <span>Verification link sent!</span>
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-center">
                    {sent ? (
                        <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Close
                        </Button>
                    ) : (
                        <div className="flex flex-col w-full gap-2 sm:flex-row sm:justify-center">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>
                                Remind me later
                            </Button>
                            <Button onClick={handleSendVerification} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Verification Link"
                                )}
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
