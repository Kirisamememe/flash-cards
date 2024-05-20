"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
// import { useWordbookStore } from "@/providers/wordbook-store-provider";


export default function Template({ children }: { children: React.ReactNode }) {

    // const isTransition = useWordbookStore((state) => state.isTransition)
    const pathname = usePathname();

    // TODO Exitのアニメーションが機能しない問題

    return (
        <AnimatePresence mode={"wait"}>
            {children}
        </AnimatePresence>

    )
}