import { auth } from "@/app/lib/auth";
import pages from "@/app/lib/pages";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const locales = ['en', 'ja', 'zh-cn', 'zh-tw'];
const protectedPages = ["/user/*", "/ai-booster/*"];
const authPages = ["/signin"];

const intlMiddleware = createMiddleware({
    locales,
    defaultLocale: "en",
    localePrefix: "as-needed",
})

const testPagesRegex = (pages: string[], pathname: string) => {
    // ここで、渡されたパスがどういうパスかチェックする
    const regex = `^(/(${locales.join("|")}))?(${pages
        .map((p) => p.replace("/*", ".*"))
        .join("|")})/?$`;
    return new RegExp(regex, "i").test(pathname);
}


const handleAuth = async (
    req: NextRequest,
    isAuthPage: boolean,
    isProtectedPage: boolean,
) => {
    const session = await auth();
    const isAuth = !!session?.user; // ログインしていれば強制的にtrue、そうでなければ強制的にfalse

    if (!isAuth && isProtectedPage) { // ログインしておらず、且つログイン状態が必要なページにアクセスしようとしている場合
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
            from += req.nextUrl.search;
            // ここのsearchは、検索機能とかではなく、
            // クエリ部分（?以降の部分、たとえば?key=value&key2=value2など）すべてを含む
        }

        return NextResponse.redirect(
            new URL(
                `${pages.auth.signin()}?from=${encodeURIComponent(from)}`,
                // encodeURIComponentを使うと、安全にリダイレクト先のURLに含めることが可能
                req.url,
            ),
        );
    }

    if (isAuth && isAuthPage) { // ログインしているにもかかわらず、ログイン・登録画面にアクセスしようとしている
        return NextResponse.redirect(new URL(pages.rootPage.root, req.nextUrl)) // ルートページに戻ろうな
    }

    return intlMiddleware(req);
};

export default async function middleware(req: NextRequest) {
    const isAuthPage = testPagesRegex(authPages, req.nextUrl.pathname);
    const isProtectedPage = testPagesRegex(protectedPages, req.nextUrl.pathname);

    return await handleAuth(req, isAuthPage, isProtectedPage);
}

export const config = {
    // これにマッチするパスは、ミドルウェアを通らない
    matcher: ['/((?!api|_next|.*\\..*).*)'],
};