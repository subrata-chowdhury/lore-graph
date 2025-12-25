import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import verifyToken from '@/libs/tokenVerify';
import { cookies } from 'next/headers';
// import User from './models/user';
// import dbConnect from './config/db';

export async function middleware(request: NextRequest) {
    const excludeTokenVerification = ['/api/auth/login', '/api/auth/signup', '/api/admin/auth/login', '/api/collector/auth/login', '/api/tests', '/api/labs', '/api/cart/count', '/api/contact'];
    const excludeTokenVerificationPatterns = [/^\/api\/tests\/.*/, /^\/api\/labs\/.*/];
    if (excludeTokenVerification.includes(request.nextUrl.pathname) || excludeTokenVerificationPatterns.some(pattern => pattern.test(request.nextUrl.pathname))) {
        return NextResponse.next();
    }

    let userType: 'admin' | 'user' = 'user';
    if (request.nextUrl.pathname.includes('/admin')) userType = 'admin';

    let token = null;
    switch (userType) {
        case 'admin':
            token = (await cookies()).get('adminToken')?.value;
            break;
        case 'user':
            token = (await cookies()).get('token')?.value;
            break;

        default:
            token = (await cookies()).get('token')?.value;
            break;
    }

    // await dbConnect();

    let user: { id: string, verified: string } | boolean = false;
    if (token) {
        user = await verifyToken<{ id: string, verified: string }>(token, userType);
        if (!user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // const existingUser = await User.findById(user.id);
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user', user.id);

        return NextResponse.next({
            request: { headers: requestHeaders }
        });
    } else {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export const config = {
    matcher: ["/api/:path*"], // Apply middleware to every URL
};
