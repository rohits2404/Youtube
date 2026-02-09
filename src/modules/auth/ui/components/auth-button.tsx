import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { UserCircleIcon } from "lucide-react"

export const AuthButton = () => {
    return (
        <>
            <SignedIn>
                <UserButton /> 
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal">
                    <Button
                    variant={"outline"}
                    className="px-4 py-2 font-medium text-sm text-blue-600 hover:text-blue-600 border-blue-500/20 rounded-full shadow-none"
                    >
                        <UserCircleIcon/>
                        Sign In
                    </Button>
                </SignInButton>
            </SignedOut>
        </>
    )
}