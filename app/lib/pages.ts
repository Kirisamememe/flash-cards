interface AuthPages {
    signin: () => string;
    signup: () => string;
}

interface RootPage {
    root: string;
}

interface UserPages {
    user: string
}

const authPages: AuthPages = {
    signin: () => '/signin',
    signup: () => '/signin'
};

const rootPage: RootPage = {
    root: '/'
};

const userPages: UserPages = {
    user: "/user"
}

export default {
    auth: authPages,
    rootPage: rootPage,
    userPage: userPages
};
