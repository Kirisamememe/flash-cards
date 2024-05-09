interface UserInfo {
    id: string | undefined
    auto_sync: boolean
    use_when_loggedout: boolean
    blindMode: boolean
    updated_at: Date
    synced_at: Date | undefined
}

interface UserInfoToRemote {
    id: string
    auto_sync: boolean
    use_when_loggedout: boolean
    blind_mode: boolean
    updatedAt: Date
    synced_at: Date | null
}