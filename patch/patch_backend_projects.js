const fs = require('fs');
const file = './backend/src/routes/projectRoutes.ts';
let code = fs.readFileSync(file, 'utf8');
code = code.replace(
  "router.get('/public/all', async (req: Request, res: Response) => {",
  `import User from '../models/User';\n\nrouter.get('/public/all', async (req: Request, res: Response) => {`
);
code = code.replace(
  "const projects = await Project.find({ isPublished: true }).sort({ createdAt: -1 });",
  `const userParam = req.query.user as string;
    let query: any = { isPublished: true };
    if (userParam) {
      const user = await User.findOne({ name: new RegExp('^' + userParam + '$', 'i') });
      if (user) {
        query.userId = user._id;
      }
    }
    const projects = await Project.find(query).sort({ createdAt: -1 });`
);
fs.writeFileSync(file, code);
