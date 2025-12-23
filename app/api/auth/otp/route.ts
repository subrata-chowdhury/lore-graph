import User from '@/models/User';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const id = cookieStore.get('userId')?.value;

    if (!id) {
        return new NextResponse('ID is required', { status: 400 });
    }

    try {
        const otp = await generateOtp();
        const user = await User.findById(id);
        user.otp = otp;
        user.otpExpiry = Date.now() + 600000; // 10 minutes
        await user.save();
    } catch {
        return new NextResponse('Error sending OTP', { status: 500 });
    }

    return NextResponse.json({ messege: 'OTP sent successfully' }, { status: 200 });

    async function generateOtp() {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        return otp;
    }
}

export async function POST(req: NextRequest) {
    const { otp } = await req.json();
    const cookieStore = await cookies();
    const id = cookieStore.get('userId')?.value;

    if (!id || !otp) {
        return new NextResponse('OTP is required', { status: 400 });
    }

    try {
        let user = await findById(id);

        async function findById(id: string) {
            const collections = [User];

            const promises = collections.map((collection) =>
                collection.findById(id).exec().then((result) => ({ model: collection.modelName, data: result }))
            );

            const results = await Promise.all(promises);

            const user = results.find(result => result.data !== null);
            if (user) {
                return { ...user.data.toObject(), type: user.model };
            }
            return null;
        }

        if (!user) {
            return new NextResponse('User not found', { status: 404 });
        }
        if (user.otp !== otp) {
            return new NextResponse('Invalid OTP', { status: 400 });
        }
        if (Date.now() > user.otpExpiry) {
            return new NextResponse('OTP has expired', { status: 400 });
        }

        // Optionally, you can clear the OTP after successful verification
        user.otp = null;
        user.verified = true;
        user = { ...await User.findByIdAndUpdate(id, { otp: null, verified: true }, { new: true }), type: user.type };

        return NextResponse.json({ message: 'OTP verified successfully', user: { type: user.type, institution: user.institution || '' } }, { status: 200 });
    } catch (error) {
        console.log(error)
        return new NextResponse('Error verifying OTP', { status: 500 });
    }
}

export async function PUT() {
    return NextResponse.json({ message: 'PUT request received' });
}

export async function DELETE() {
    return NextResponse.json({ message: 'DELETE request received' });
}