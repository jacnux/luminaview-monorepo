const fs = require('fs');
const file = './backend/src/routes/photoRoutes.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "router.get('/public/standalone', async (req: Request, res: Response) => {",
  `import User from '../models/User';\n\nrouter.get('/public/standalone', async (req: Request, res: Response) => {`
);
code = code.replace(
  "const photos = await Photo.find({ isStandalone: true, isPublished: true })",
  `const userParam = req.query.user as string;
    let query: any = { isStandalone: true, isPublished: true };
    if (userParam) {
      const user = await User.findOne({ name: new RegExp('^' + userParam + '$', 'i') });
      if (user) {
        query.userId = user._id;
      }
    }
    const photos = await Photo.find(query)`
);
fs.writeFileSync(file, code);
