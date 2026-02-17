"use client"

import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { UserPageBanner, UserPageBannerSkeleton } from "../components/user-page-banner";
import { UserPageInfo, UserPageInfoSkeleton } from "../components/user-page-info";
import { Separator } from "@/components/ui/separator";
import { AppErrorBoundary } from "@/components/error-boundary";

interface UserSectionProps {
    userId: string;
}

export const UserSection = ({ userId }: UserSectionProps) => {
    return (
        <Suspense fallback={<UserSectionSkeleton/>}>
            <AppErrorBoundary title="Error Loading User" fullScreen>
                <UserSectionSuspense userId={userId} />
            </AppErrorBoundary>
        </Suspense>
    )
}

const UserSectionSkeleton = () => {
    return (
        <div className="flex flex-col">
            <UserPageBannerSkeleton/>
            <UserPageInfoSkeleton/>
        </div>
    )
}

const UserSectionSuspense = ({ userId }: UserSectionProps) => {

    const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId })

    return (
        <div className="flex flex-col">
            <UserPageBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    )
}