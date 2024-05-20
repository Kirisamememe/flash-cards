import {Ratelimit} from "@upstash/ratelimit";
import {Redis} from "@upstash/redis";

export const rateLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(1, "3600 s")
})

export function fetchFromWordsAPI() {



}