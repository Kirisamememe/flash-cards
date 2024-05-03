import {WordCard} from "@/components/wordCard";

export type SaveResult =
    | {
        isSuccess: true;
        message: string;
        data: WordCard
    }
    | {
        isSuccess: false;
        error: {
            message: string;
        }
    }

export type DeleteResult = {
    isSuccess: true;
    message: string;
} | {
    isSuccess: false;
    error: {
        message: string;
    }
}
