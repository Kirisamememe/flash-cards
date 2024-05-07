import { WordCard } from "@/types/WordCard"

export type UpsertCardResult = any | {
    error: string,
    detail: any
}

export type SaveCardsResults = {
    isSuccess: boolean,
    successResults: {
        isSuccess: true;
        message: string;
        data: WordCard
    }[],
    errorResults: {
        isSuccess: false;
        error: {
            message: string;
        }
    }[],
    message: string
}

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

export type SavePOSResult = {
    isSuccess: true;
    message: string;
    data: any
} | {
    isSuccess: false;
    error: {
        message: string;
    }
}

export type SignResult =   | {
    isSuccess: true;
    message: string;
} | {
    isSuccess: false;
    error: {
        message: string;
    };
};
