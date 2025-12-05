import jwt from "jsonwebtoken";

export const auth = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ message: "Invalid auth format" });
      }

      const token = parts[1];
      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ message: "Invalid token" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
