import { SubscriptionsVideosSection } from "../sections/subscription-videos-section"

export const SubscriptionView = () => {
    return (
        <div className="max-w-3xl mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <div>
                <h1 className="text-2xl font-bold">Subscription</h1>
                <p className="text-xs text-muted-foreground">
                    View and Manage all Your Subscriptions
                </p>
            </div>
            <SubscriptionsVideosSection />
        </div>
    )
}