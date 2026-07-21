import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import User from '../models/User';
import UserPage from '../models/UserPage';
import Post from '../models/Post';
import PostComment from '../models/PostComment';
import NewsletterSubscriber from '../models/NewsletterSubscriber';
import { sendNewPostNotification } from '../services/newsletterService';
import { authenticateToken as authMiddleware } from '../middleware/auth'; 

const router = express.Router();

// Transporteur pour le contact
const transporterOptions: any = {
  host:   process.env.SMTP_HOST || 'luminaview-mailhog',
  port:   parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true',
};
if (process.env.SMTP_USER) {
  transporterOptions.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };
}
const transporter = nodemailer.createTransport(transporterOptions);


// ============================================================
// ROUTES — Utilisateur (profil public blog)
// ============================================================

router.get('/user/:slug', async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      name: { $regex: new RegExp(`^${req.params.slug}$`, 'i') }
    });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    const pages = await UserPage.find({
      userId: user._id,
      showOnBlog: true
    }).select('title slug coverImage');

    res.json({
      name:                user.name,
      avatar:              user.avatar,
      bio:                 user.bio,
      servicesDescription: user.servicesDescription,
      tagline:             user.tagline,
      blogTheme:           user.blogTheme || 'classic',
      hasBlog:             (user as any).hasBlog ?? false,
      hasCarnet:           (user as any).hasCarnet ?? false,
      chambreNoireUrl:     (user as any).chambreNoireUrl || '',
      showcaseAlbums:      pages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ============================================================
// ROUTES — Articles (Posts)
// ============================================================

router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { blog } = req.query; // blog is the slug
    
    let token = req.headers['authorization']?.split(' ')[1];
    let isAdminOrOwner = false;
    if (token) {
      try {
        jwt.verify(token, process.env.JWT_SECRET || 'changeThisSecretLuminaView123!');
        isAdminOrOwner = true;
      } catch (e) {}
    }

    let query: any = {};
    if (blog) {
      const user = await User.findOne({ name: { $regex: new RegExp(`^${blog}$`, 'i') } });
      if (user) {
        query.userId = user._id;
      } else {
        return res.json([]);
      }
    }

    if (!isAdminOrOwner) {
      query.isPublished = { $ne: false };
    }

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/posts/:slug', async (req: Request, res: Response) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug });
    if (!post) return res.status(404).json({ error: 'Article non trouvé' });
    
    if (post.isPublished === false) {
      let token = req.headers['authorization']?.split(' ')[1];
      let isAdminOrOwner = false;
      if (token) {
        try {
          jwt.verify(token, process.env.JWT_SECRET || 'changeThisSecretLuminaView123!');
          isAdminOrOwner = true;
        } catch (e) {}
      }
      if (!isAdminOrOwner) {
        return res.status(404).json({ error: 'Article non trouvé' });
      }
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.post('/posts', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, slug, blogSlug, isPublished } = req.body;
    
    let userId = (req as any).user?.userId; // Assuming authMiddleware sets req.user
    if (blogSlug && !userId) {
       const u = await User.findOne({ name: { $regex: new RegExp(`^${blogSlug}$`, 'i') } });
       if (u) userId = u._id;
    }

    if (!userId) return res.status(400).json({ error: 'Utilisateur inconnu' });

    const newPost = await new Post({ 
      title, 
      content, 
      slug, 
      userId,
      isPublished: isPublished === true 
    }).save();

    if (newPost.isPublished) {
      const subscribers = await NewsletterSubscriber.find({ userId });
      if (subscribers.length > 0) {
        await sendNewPostNotification(subscribers, newPost);
      }
    }

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: 'Erreur création' });
  }
});

router.put('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title, content, slug, isPublished } = req.body;
    
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) return res.status(404).json({ error: 'Article non trouvé' });

    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      { title, content, slug, isPublished: isPublished === true },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Article non trouvé' });

    if (updated.isPublished && existingPost.isPublished !== true) {
      const subscribers = await NewsletterSubscriber.find({ userId: updated.userId });
      if (subscribers.length > 0) {
        await sendNewPostNotification(subscribers, updated);
      }
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

router.delete('/posts/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});


// ============================================================
// ROUTES — Contact
// ============================================================

router.post('/contact', async (req: Request, res: Response) => {
  try {
    const { blogSlug, name, email, message } = req.body;
    const owner = await User.findOne({
      name: { $regex: new RegExp(`^${blogSlug}$`, 'i') }
    });
    if (!owner?.email) return res.status(404).json({ error: 'Destinataire introuvable' });

    await transporter.sendMail({
      from:    process.env.SMTP_FROM,
      to:      owner.email,
      subject: `📩 Nouveau message de ${name}`,
      html:    `<p>${message}</p><p>De : ${name} (${email})</p>`
    });
    res.json({ message: 'Message envoyé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur envoi email' });
  }
});


// ============================================================
// ROUTES — Commentaires
// ============================================================

router.post('/comments', async (req: Request, res: Response) => {
  try {
    const { postId, name, content } = req.body;
    await new PostComment({ postId, name, email: 'anonyme', content }).save();
    res.status(201).json({ message: 'Commentaire en attente de modération' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/comments/post/:postId', async (req: Request, res: Response) => {
  try {
    res.json(await PostComment.find({ postId: req.params.postId, isApproved: true }));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/comments/pending', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    let query: any = { isApproved: false };
    if (!user.isAdmin) {
      const postIds = (await Post.find({ userId: user._id }).select('_id')).map(p => p._id);
      query.postId = { $in: postIds };
    }

    res.json(await PostComment.find(query).populate('postId', 'title'));
  } catch (error) {
    console.error('[COMMENTS] Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.patch('/comments/:id/approve', authMiddleware, async (req: Request, res: Response) => {
  try {
    res.json(await PostComment.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/comments/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await PostComment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commentaire supprimé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ============================================================
// ROUTES — Newsletter
// ============================================================

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { email, blogSlug } = req.body;
    const user = await User.findOne({ name: { $regex: new RegExp(`^${blogSlug}$`, 'i') } });
    if (!user) return res.status(404).json({ error: 'Blog introuvable' });

    if (await NewsletterSubscriber.findOne({ email, userId: user._id })) {
      return res.json({ message: 'Déjà abonné' });
    }
    await new NewsletterSubscriber({ email, userId: user._id }).save();
    res.status(201).json({ message: 'Abonnement confirmé' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


export default router;
