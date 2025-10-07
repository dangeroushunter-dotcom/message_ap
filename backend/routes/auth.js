import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// 仮ユーザーデータ（本来はDBから取る）
const users = [
  { id: 1, username: "testuser", password: "$2a$10$ExJhEuPpvVnIDoPhJShmEee2kLj5AizOc7mL1PRA6TiD3/Mzn5Z0a" } 
  // ↑ パスワード: "password123" をbcryptでハッシュ化したもの
];

// ログインAPI
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "ユーザーが存在しません" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "パスワードが違います" });

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({ message: "ログイン成功", token });
});

// 認証チェックAPI（トークン検証用）
router.get("/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "トークンがありません" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ message: "認証OK", user: decoded });
  } catch (err) {
    res.status(403).json({ error: "トークンが無効です" });
  }
});

export default router;
