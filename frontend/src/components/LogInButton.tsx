"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import UserProfile from "./supaauth/user-profile";

const LoginButton = () => {
    const [user, setUser] = useState<unknown>(null);
    const router = useRouter();
    const supabase = createSupabaseBrowser();


    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    
    return (
        <div className="flex items-center space-x-2">
            {user ? (
                <div className="flex items-center space-x-2">
                    <UserProfile />
                </div>
            ) : (
                <Button
                    onClick={() => {
                        router.push("/login");
                    }}
                    className="w-full max-w-xs"
                >
                    Log in
                </Button>
            )}
        </div>
    );
};

export default LoginButton;
