"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage = () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(() => router.replace("/"), 1500);
    }, [router]);
    return <div>You have logged out... redirecting in a sec.</div>;
};

export default LogoutPage;
