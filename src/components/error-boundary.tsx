"use client";

import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

interface YouTubeLikeErrorFallbackProps {
    title?: string;
    fullScreen?: boolean;
}

const YouTubeLikeErrorFallback = ({
    title = "Something went wrong",
    fullScreen = false,
}: YouTubeLikeErrorFallbackProps) => {
    const router = useRouter();

    return (
        <div
        className={`flex items-center justify-center ${
            fullScreen ? "min-h-screen" : "min-h-100"
        } bg-white px-4`}
        >
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mx-auto mb-6 w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.172 9.172a4 4 0 015.656 5.656M15 9h.01M9 15h.01M12 12h.01"
                        />
                    </svg>
                </div>

                {/* Title */}
                <h1 className="text-lg md:text-xl font-medium text-gray-900 mb-6">
                    {title}
                </h1>

                {/* Button */}
                <button
                onClick={() => router.push("/")}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export const AppErrorBoundary = ({
    children,
    title,
    fullScreen,
}: { children: React.ReactNode, title?: string, fullScreen?: boolean }) => {
    return (
        <ErrorBoundary
        fallbackRender={() => (
            <YouTubeLikeErrorFallback
            title={title}
            fullScreen={fullScreen}
            />
        )}
        >
            {children}
        </ErrorBoundary>
    );
};