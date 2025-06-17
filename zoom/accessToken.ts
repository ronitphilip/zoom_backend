import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

let accessToken: string | null = null;
let tokenExpiresAt: number | null = null;

export const getAccessToken = async () => {
    console.log('getAccessToken');

    const now = Date.now();

    if (accessToken && tokenExpiresAt && now < tokenExpiresAt) {
        return accessToken;
    }

    const authString = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
            {},
            {
                headers: {
                    Authorization: `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        accessToken = response.data.access_token;
        tokenExpiresAt = now + response.data.expires_in * 1000 - 60000;

        return accessToken;
    } catch (error: any) {
        console.error('Zoom token error:', error?.response?.data || error.message);
        throw new Error('Failed to get Zoom access token');
    }
};