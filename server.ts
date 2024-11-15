import express from "express";
import BackLinks from "./backlinkbuilder";

const backLinks = new BackLinks();
backLinks.buildIdList("Animal");
backLinks.buildIdList("Painting");
backLinks.buildIdList("Skyscraper");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/client.html");
});

app.get("/re/:pageName", (req, res) => {
  const id = backLinks.getRandomId(
    decodeURIComponent(req.params.pageName)
  );
  res.redirect(`https://en.wikipedia.org/?curid=${id}`);
});

app.get("/nu/:pageName", async (req, res) => {
  const decoded = decodeURIComponent(req.params.pageName).trim();
  if (!(await backLinks.isValidPage(decoded))) {
    res.send(`We couldn't find ${decoded}`);
    return;
  }

  const loweredDecoded = decoded.toLowerCase();
  if (!backLinks.has(loweredDecoded))
    backLinks.buildIdList(loweredDecoded);

  const encodedClean = encodeURIComponent(loweredDecoded);
  res.send(`onstartup.onrender.com/re/${encodedClean}`);
});

app.listen(3000, () => {
  console.log("Server running on port 3000 - http://localhost:3000/");
});
