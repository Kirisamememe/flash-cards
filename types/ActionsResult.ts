import { WordIndexDB } from "@/types/WordIndexDB"

export type SaveCardsResults = {
    isSuccess: boolean,
    successResults: {
        isSuccess: true;
        message: string;
        data: WordIndexDB
    }[],
    errorResults: {
        isSuccess: false;
        error: {
            message: string;
        }
    }[],
    message: string
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

export type SignResult = {
    isSuccess: true;
    message: string;
} | {
    isSuccess: false;
    error: {
        message: string;
    };
};

export type GetPromiseCommonResult<T> = {
    isSuccess: true
    data: T
} | {
    isSuccess: false,
    error: {
        message: string
        detail: any
    }
}

export type UpdatePromiseCommonResult<T> = {
    isSuccess: true,
    data: T
} | {
    isSuccess: false,
    error: {
        message: string
        detail: any
    }
}