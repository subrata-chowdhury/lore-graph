import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import User from '@/models/user';
import { SignJWT } from 'jose';
import dbConnect from '@/config/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
        return new NextResponse('Username, Phone no and password are required', { status: 400 });
    }

    await dbConnect();

    const buffer = Buffer.from(password, 'base64');
    if (!process.env.PRIVATE_KEY) {
        throw new Error('PRIVATE_KEY is not defined in environment variables');
    }
    const decryptedPassword = crypto.privateDecrypt(process.env.PRIVATE_KEY, buffer).toString('utf8');

    const hashedPassword = await hash(decryptedPassword, 10);

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        if (existingUser.isDeleted) {
            existingUser.isDeleted = false;
            existingUser.password = hashedPassword;
            await existingUser.save();

            const token = await new SignJWT({
                id: existingUser._id,
                verified: existingUser.verified,
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setExpirationTime(Math.floor(Date.now() / 1000) + 3 * 30 * 24 * 60 * 60) // 6 months
                .sign(new TextEncoder().encode(process.env.JWT_SECRET));

            return NextResponse.json({ message: 'User reactivated successfully', user: { verified: false, name: existingUser.name, email: existingUser.email }, token });
        }
        // User already exists, return an error response
        return new NextResponse('User already exists. Please log in.', { status: 400 });
    }

    const newUser = new User({
        name,
        email,
        password: hashedPassword,
    });

    try {
        await newUser.save();
    } catch {
        return new NextResponse('Error saving user', { status: 500 });
    }

    const token = await new SignJWT({
        id: newUser._id,
        verified: newUser.verified,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(Math.floor(Date.now() / 1000) + 3 * 30 * 24 * 60 * 60) // 6 months
        .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    return NextResponse.json({ message: 'User signed up successfully', user: { verified: false, name: newUser.name, email: newUser.email }, token });
}