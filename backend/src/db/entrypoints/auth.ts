import { api } from '../client.js';
import { jwt } from '../../jwt.js';
import { authFactory, result, type Auth, type JwtAuth, type LoginRequest, type Result } from 'shared_types';


//export const router = express.Router();

export async function anonymous(): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/anonymous');
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}

export async function refresh(refreshToken: string): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/refresh', refreshToken, {
        headers: { 'Content-Type': 'text/plain' }
    });
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}

export async function login(loginRequest: LoginRequest): Promise<Result<JwtAuth>> {
    const auth = await api.post<Auth>('/auth/login', loginRequest);
    return auth.map(a => authFactory.jwt(jwt.generate(a.user.id), a));
}
// function wrapAsync(
//     fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
// ) {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         try {
//             await fn(req, res, next);
//         } catch (error) {
//             if (axios.isAxiosError(error) && error.response) {
//                 res.status(error.response.status).json(error.response.data);
//             } else {
//                 res.status(500).json({ message: "Internal server error" });
//             }
//         }
//     };
// }


// router.post('/anonymous', async (_: Request, res: Response): Promise<void> => {
//     const auth = (await api.post<Auth>('/auth/anonymous'));
//     res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
// });

// router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
//     const tokenToRefresh = req.body.refreshToken;
//     if (!tokenToRefresh) {
//         res.status(400).json({ message: "No refresh token provided" });
//         return;
//     }
//     const auth = (await rest.post<Auth>('/auth/refresh', tokenToRefresh, {
//         headers: { 'Content-Type': 'text/plain' }
//     })).data;
//     res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
// });


// router.post('/login', async (req: Request, res: Response): Promise<void> => {
//     const loginRequest: LoginRequest = req.body;
//     const auth = (await rest.post<Auth>('/auth/login', loginRequest)).data;
//     res.json(authFactory.jwt(jwt.generate(auth.user.id), auth));
// });