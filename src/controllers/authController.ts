import axios from 'axios';
import { Request, Response } from 'express';
import prisma from '../prisma';
import { UserType } from '../generated/prisma';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;

export const auth0Login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const token = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
            grant_type: 'password',
            username: email,
            password,
            client_id: AUTH0_CLIENT_ID,
            client_secret: AUTH0_CLIENT_SECRET,
            scope: 'openid profile email',
            connection: 'Username-Password-Authentication'
        });

        const { access_token, id_token } = token.data;

        const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const auth0Id = userInfo.data.sub;
        const name = userInfo.data.name || '';
        const emailRes = userInfo.data.email;

        let user = await prisma.user.findUnique({
            where: { auth0Id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    auth0Id,
                    email: emailRes,
                    name,
                    type: 'estudiante'
                }
            });
        }

        res.status(200).json({ access_token, id_token, user });
    } catch (error: any) {
        console.error('Auth0 login error:', error.response?.data || error.message);
        res.status(401).json({ message: 'Login failed', error: error.response?.data || error.message });
    }
};