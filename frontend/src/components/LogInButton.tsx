"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { redirect } from "next/navigation";

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
    if (user) {
        async function signout() {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.log(error);
            }

            redirect("/");
        }

        return (
            <Button
                onClick={() => {
                    signout();
                    setUser(null);
                }}
            >
                Log out
            </Button>
        );
    }
    return (
        <Button
            onClick={() => {
                router.push("/login");
            }}
        >
            Login
        </Button>
    );
};

export default LoginButton;
