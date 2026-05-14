const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// GET /api/oferty – odczytuje oferty z pliku JSON i opcjonalnie filtruje po technologiach
app.get("/api/oferty", (req, res) => {
  const sciezkaPliku = path.join(__dirname, "oferty.json");
  const paramTech = req.query.tech; // np. "javascript,react"

  fs.readFile(sciezkaPliku, "utf-8", (err, data) => {
    // Błąd odczytu pliku (np. plik nie istnieje)
    if (err) {
      console.error("Błąd odczytu pliku:", err);
      return res.status(500).json({ error: "Nie udało się odczytać pliku z ofertami." });
    }

    // Parsowanie JSON – obsługa uszkodzonego formatu
    try {
      let oferty = JSON.parse(data);

      // Filtrowanie po technologiach, jeśli podano parametr ?tech=
      if (paramTech && paramTech.trim() !== "") {
        const wybraneTech = paramTech
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t !== "");

        if (wybraneTech.length > 0) {
          oferty = oferty.filter((oferta) => {
            const tagi = (oferta.technologies || []).map((tag) =>
              tag.toLowerCase()
            );
            // Zwróć ofertę, jeśli chociaż jeden tag pasuje do wybranej technologii
            return wybraneTech.some((tech) => tagi.includes(tech));
          });
        }
      }

      res.json(oferty);
    } catch (parseError) {
      console.error("Błąd parsowania JSON:", parseError);
      return res.status(500).json({ error: "Plik z ofertami ma nieprawidłowy format JSON." });
    }
  });
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT} – http://localhost:${PORT}`);
});
