interface UserInfo {
    id: string
    image: string | undefined | null
    name: string | undefined | null
    auto_sync: boolean
    use_when_loggedout: boolean
    blind_mode: boolean
    updated_at: Date
    synced_at: Date | undefined
}

interface UserInfoToRemote {
    id: string
    image: string | null
    name: string | null
    auto_sync: boolean
    use_when_loggedout: boolean
    blind_mode: boolean
    updatedAt: Date
    synced_at: Date | null
}

interface UserInfoFormRemote {
    id: string
    image: string | null
    name: string | null
    synced_at: Date | null,
    updatedAt: Date
    auto_sync: boolean,
    use_when_loggedout: boolean,
    blind_mode: boolean
}

