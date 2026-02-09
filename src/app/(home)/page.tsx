import { ErrorBoundary } from "react-error-boundary";
import { HydrateClient, trpc } from "@/trpc/server"
import { Suspense } from "react";
import { PageClient } from "./client";

const Home = async () => {

    void trpc.hello.prefetch({ text: "Rohit" });

    return (
        <HydrateClient>
            <Suspense fallback={<p>Loading...</p>}>
                <ErrorBoundary fallback={<p>Error...</p>}>
                    <PageClient />
                </ErrorBoundary>
            </Suspense>
        </HydrateClient>
    )
}

export default Home