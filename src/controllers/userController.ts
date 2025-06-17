import { Request, Response } from 'express';
import prisma from '../prisma';
import axios from 'axios';
import { UserType } from '../generated/prisma';
import { translateAuth0Error } from '../utils/auth0ErrorTraslator';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN!;
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID!;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET!;
const AUTH0_MGMT_CLIENT_ID = process.env.AUTH0_MGMT_CLIENT_ID!;
const AUTH0_MGMT_CLIENT_SECRET = process.env.AUTH0_MGMT_CLIENT_SECRET!;

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, name, password, type } = req.body;

    if (!email.endsWith('@uc.cl') && type !== 'propietario') {
      return res.status(400).json({ error: 'Correo electrónico no autorizado para estudiante, debes ingresar un correo UC.' });
    }

    const mgmtTokenResponse = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      client_id: AUTH0_MGMT_CLIENT_ID,
      client_secret: AUTH0_MGMT_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    });

    const mgmtToken = mgmtTokenResponse.data.access_token;

    const createUserResponse = await axios.post(
      `https://${AUTH0_DOMAIN}/api/v2/users`,
      {
        email,
        name,
        connection: 'Username-Password-Authentication',
        password,
        email_verified: false,
      },
      {
        headers: {
          Authorization: `Bearer ${mgmtToken}`
        }
      }
    );

    const auth0User = createUserResponse.data;

    const user = await prisma.user.create({
      data: {
        auth0Id: auth0User.user_id,
        email: auth0User.email,
        name: auth0User.name,
        type: type as UserType
      }
    });

    res.status(201).json({ user });
  } catch (error: any) {
    const auth0Message = error.response?.data.message || error.response?.data.error_description;
    const translated = translateAuth0Error(auth0Message);
    console.error('Error al crear un usuario con auth0:', error.response?.data || error.message);
    res.status(400).json({ error: translated });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const token = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'password',
      username: email,
      password,
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      scope: 'openid profile email',
      connection: 'Username-Password-Authentication',
      audience: process.env.AUTH0_AUDIENCE
    });

    const { access_token, id_token } = token.data;


    const userInfo = await axios.get(`https://${AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    if (!userInfo.data.email_verified) {
      return res.status(403).json({ error: 'Debes verificar tu correo electrónico.' });
    }

    const auth0Id = userInfo.data.sub;


    const user = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado en la base de datos' });
    }

    res.status(200).json({ access_token, id_token, user });
  } catch (error: any) {
    const auth0Message = error.response?.data.message || error.response?.data.error_description;
    const translated = translateAuth0Error(auth0Message);
    console.error('Error al iniciar sesión con Auth0:', error.response?.data || error.message);
    res.status(401).json({ error: translated });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  try {
    const { auth0Id } = req.body;
    const { email, name, type } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { auth0Id }
    });

    if (!existingUser) {
      return res.status(400).json({ error: 'El usuario no existe.' });
    }

    const user = await prisma.user.update({
      where: { auth0Id },
      data: {
        email,
        name,
        type: type as UserType
      }
    });

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ error: 'Error al modificar el usuario.' });
  }
};
