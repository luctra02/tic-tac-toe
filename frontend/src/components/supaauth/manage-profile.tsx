"use client";
import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog";
import { CircleUser } from "lucide-react";
import { cn } from "@/lib/utils";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Avatar from "./avatar";
import { z } from "zod";
import { toast } from "sonner";
import { CiEdit } from "react-icons/ci";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

export type IconKey = "email" | "github" | "discord" | "google";

export const authProvider = {
    email: {
        Icon: MdOutlineMarkEmailRead,
    },
    github: {
        Icon: FaGithub,
    },
    discord: {
        Icon: FaDiscord,
    },
    google: {
        Icon: FcGoogle,
    },
};

export default function ManageProfile() {
    const [activeTab, setActiveTab] = useState("profile");
    const [data, setData] = useState<User | null>(null);

    const [isEditing, setIsEditing] = useState(false);

    const supabase = createSupabaseBrowser();

    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setData(user);
        };
        fetchUser();
    }, [supabase.auth]);

    const [username, setUsername] = useState(data?.user_metadata.full_name);
    const [currentName, setCurrentName] = useState(username);
    useEffect(() => {
        if (data?.user_metadata.full_name) {
            setUsername(data.user_metadata.full_name);
        }
    }, [data?.user_metadata.full_name]);

    const AuthProviderIcon = data?.app_metadata?.provider
        ? authProvider[data.app_metadata.provider as IconKey]?.Icon ||
          MdOutlineMarkEmailRead
        : MdOutlineMarkEmailRead;

    const usernameSchema = z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(12, { message: "Username must not exceed 12 characters" })
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores"
        );

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.currentTarget.value);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key == "Enter") {
            // Check if the Enter key was pressed
            const newUsername = e.currentTarget.value;

            if (newUsername != currentName) {
                try {
                    usernameSchema.parse(newUsername);
                    const {} = await supabase.auth.updateUser({
                        data: { full_name: newUsername },
                    });
                    toast.success("Username updated successfully!");
                    setCurrentName(newUsername);
                    setIsEditing(false);
                } catch (error) {
                    if (error instanceof z.ZodError) {
                        const errorMessage =
                            error.errors[0]?.message || "Invalid username";
                        toast.error(errorMessage);
                    }
                    setUsername(data?.user_metadata.full_name);
                }
            }
        }
    };

    const handleEditClick = () => {
        if (isEditing) {
            // Simulate Enter key logic
            const event = {
                key: "Enter",
                currentTarget: {
                    value: username,
                },
            } as unknown as React.KeyboardEvent<HTMLInputElement>;

            handleKeyDown(event);
        }

        setIsEditing(!isEditing);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button id="manage-profile"></button>
            </DialogTrigger>
            <DialogContent className=" w-full md:w-[55rem] flex flex-col sm:flex-row  ">
                <div className=" w-60 h-[100%] rounded-s-lg p-5 space-y-7 ">
                    <div>
                        <DialogTitle>Manage Profile</DialogTitle>
                    </div>

                    <div
                        className={cn(
                            "p-2 flex items-center gap-2  rounded-lg text-sm cursor-pointer transition-all  ",
                            {
                                " text-green-700 dark:text-green-500 ring-[0.5px] ring-zinc-400":
                                    activeTab == "profile",
                            }
                        )}
                        onClick={() => setActiveTab("profile")}
                    >
                        <CircleUser />
                        <span>Profile</span>
                    </div>
                </div>

                <div className="flex-1 h-full  border-l rounded-lg px-5 sm:px-10 py-5 divide-y-[0.5px] space-y-5">
                    <h1 className="font-bold text-xl w-36">Profile details</h1>
                    <div className="flex items-center py-5  sm:gap-24">
                        <h1 className="text-sm font-medium w-36 ">Profile</h1>
                        <div className="flex-1 sm:px-3">
                            <Avatar />
                        </div>
                    </div>
                    <div className="flex items-center sm:gap-24 py-5 justify-between ">
                        <h1 className="text-sm font-medium w-36">Username</h1>
                        <div className="flex-1 flex justify-between items-center sm:pl-3  ">
                            {isEditing ? (
                                <input
                                    id="usernameInput"
                                    type="text"
                                    value={username}
                                    onChange={handleUsernameChange}
                                    onKeyDown={handleKeyDown}
                                    className="border-2 rounded-md p-2 text-sm"
                                />
                            ) : (
                                <p className="text-sm">{username}</p>
                            )}
                            <CiEdit
                                className="cursor-pointer text-3xl"
                                onClick={handleEditClick}
                            />
                        </div>
                    </div>
                    <div className="flex items-center sm:gap-24 py-5 justify-between ">
                        <h1 className="text-sm font-medium w-36">Email</h1>
                        <div className="flex-1 flex justify-between items-center sm:pl-3  ">
                            <p className="text-sm">{data?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-start py-5 gap-2 sm:gap-24 ">
                        <h1 className="text-sm font-medium w-36  ">
                            Connected accounts
                        </h1>
                        <div className="flex-1 space-y-5 ">
                            <div className="flex items-center gap-2 px-3">
                                <AuthProviderIcon />
                                <p className="capitalize">
                                    {data?.app_metadata?.provider}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {data?.user_metadata?.user_name}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
