const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware – pozwala frontendowi z localhost:5173 na swobodne pobieranie danych
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Zmockowane oferty pracy IT
const oferty = [
  {
    id: 1,
    title: "Junior Frontend Developer",
    company: "dupa Sp. z o.o.",
    salary_min: 7000,
    salary_max: 10000,
    technologies: ["React", "TypeScript", "CSS"],
    link: "https://example.com/offer/1",
  },
  {
    id: 2,
    title: "Mid Node.js Developer",
    company: "BackendLab",
    salary_min: 12000,
    salary_max: 17000,
    technologies: ["Node.js", "Express", "PostgreSQL", "Docker"],
    link: "https://example.com/offer/2",
  },
  {
    id: 3,
    title: "Senior React Developer",
    company: "Frontly",
    salary_min: 17000,
    salary_max: 24000,
    technologies: ["React", "Next.js", "TypeScript", "GraphQL"],
    link: "https://example.com/offer/3",
  },
  {
    id: 4,
    title: "Fullstack Developer (Node + React)",
    company: "IT Solutions S.A.",
    salary_min: 14000,
    salary_max: 20000,
    technologies: ["React", "Node.js", "MongoDB", "AWS"],
    link: "https://example.com/offer/4",
  },
  {
    id: 5,
    title: "DevOps / Cloud Engineer",
    company: "CloudNine",
    salary_min: 18000,
    salary_max: 26000,
    technologies: ["AWS", "Terraform", "Kubernetes", "CI/CD"],
    link: "https://example.com/offer/5",
  },
  {
    id: 6,
    title: "Python / AI Developer",
    company: "DeepLogic",
    salary_min: 16000,
    salary_max: 23000,
    technologies: ["Python", "PyTorch", "FastAPI", "PostgreSQL"],
    link: "https://example.com/offer/6",
  },
];

// GET /api/oferty – zwraca listę zmockowanych ofert
app.get("/api/oferty", (_req, res) => {
  try {
    res.json(oferty);
  } catch (error) {
    console.error("Błąd podczas pobierania ofert:", error);
    res.status(500).json({ error: "Nie udało się pobrać ofert." });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`✅ Serwer działa na porcie ${PORT} – http://localhost:${PORT}`);
});
