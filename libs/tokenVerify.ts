import { jwtVerify } from 'jose';

export default async function verifyToken<T>(token: string | undefined | null, userType: 'admin' | 'user' | 'collector'): Promise<false | T> {
    if (token && token !== '') {
        try {
            let jwtSecret = null;
            switch (userType) {
                case 'admin':
                    jwtSecret = process.env.ADMIN_JWT_SECRET;
                    break;
                case 'user':
                    jwtSecret = process.env.JWT_SECRET;
                    break;

                default:
                    jwtSecret = process.env.JWT_SECRET;
                    break;
            }
            const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret)) as { payload: { id: { buffer: number[] } } };
            const newPayload = {
                id: Buffer.from(Object.values(payload.id.buffer)).toString('hex')
            };
            return newPayload as T;
        } catch {
            return false;
        }
    }
    return false;
}