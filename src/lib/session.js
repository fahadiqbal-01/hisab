import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getCachedServerSession = cache(() => getServerSession(authOptions));
