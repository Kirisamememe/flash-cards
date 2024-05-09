import {PartOfSpeechLocal, PartOfSpeechToRemote, WordCard} from "@/types/WordCard"
import {PartOfSpeech, Word} from "@prisma/client";

export type GetUserInfoFromLocalResult = {
    isSuccess: true, data: any
}

export type SaveUserInfoResult = {
    isSuccess: true
} | {
    isSuccess: false, error: Error
}

export type UpsertCardResult = {
    isSuccess: true
    data: any
} | {
    isSuccess: false
    error: {
        message: string
        detail: any
    },
}

export type UpsertPartOfSpeechResult = { isSuccess: true, data: any } | {
    isSuccess: false
    error: {
        message: string
        detail: any
    }
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
    data: string
} | {
    isSuccess: false;
    message: string;
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

export type GetPartOfSpeechesResult = {
    isSuccess: true
    data: PartOfSpeech[]
} | {
    isSuccess: false
    error: string
    detail: any
}

export type GetCardsResult = {
    isSuccess: true
    data: Word[]
} | {
    isSuccess: false
    error: string
    detail: any
}

export type GetUserInfoFromRemoteResult = {
    isSuccess: true,
    data: {
        id: string
        synced_at: Date | null,
        updatedAt: Date
        auto_sync: boolean,
        use_when_loggedout: boolean,
        blind_mode: boolean
    } | null
} | {
    isSuccess: false,
    error: string,
    detail: unknown
}

export type UpdatePromiseCommonResult = {
    isSuccess: true,
    data: any
} | {
    isSuccess: false,
    error: {
        message: string
        detail: any
    }
}