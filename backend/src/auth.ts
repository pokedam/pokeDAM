// import express from 'express';
// import type { Request, Response, } from 'express';
// import { User } from './database.js';
// import { v4 } from 'uuid';
// import { jwt } from './jwt.js';

// const router = express.Router();

// router.post('/anonymous', async (_: Request, res: Response): Promise<void> => {
//     let user = await User.create({
//         refreshToken: v4(),
//         nickname: null
//     });

//     user.nickname = `Trainer${String(user.id).padStart(4, '0')}`;
//     await user.save();

//     res.json({
//         idToken: jwt.generate(user.id),
//         user: user
//     });
// });

// router.get('/user', jwt.middleware, async (req: Request, res: Response): Promise<void> => {
//     if (!req.userId) {
//         res.status(401).send();
//         return;
//     }

//     const user = await User.findByPk(req.userId);
//     if (!user) {
//         res.status(404).send();
//         return;
//     }

//     res.json(user);
// });

// router.get('/user/:userId', async (req: Request, res: Response): Promise<void> => {
//     const user = await User.findByPk(Number(req.params.userId));
//     if (!user) {
//         res.status(404).send();
//         return;
//     }

//     res.json(user);
// });

// router.post('/user', jwt.middleware, async (req: Request, res: Response): Promise<void> => {
//     if (!req.userId) {
//         res.status(401).send();
//         return;
//     }

//     const { nickname } = req.body;
//     let user = await User.findByPk(req.userId);

//     if (!user) {
//         res.status(404).send();
//         return;
//     }

//     if (nickname) {
//         user.nickname = nickname;
//         await user.save();
//     }

//     res.json(user);
// });

// router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
//     const { refresh_token } = req.body;

//     if (!refresh_token) {
//         res.status(400).send();
//         return;
//     }

//     const user = await User.findOne({ where: { refreshToken: refresh_token } });

//     if (user) {
//         const newIdToken = jwt.generate(user.id);
//         const newRefreshToken = v4();

//         user.refreshToken = newRefreshToken;
//         await user.save();

//         res.json({
//             idToken: newIdToken,
//             user: user
//         });
//     } else {
//         res.status(400).send();
//     }
// });

// export { router as authRouter };
