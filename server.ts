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
  const id = backLinks.getRandomId(encodeURIComponent(req.params.pageName));
  res.redirect(`https://en.wikipedia.org/?curid=${id}`);
});

app.get("/nu/:pageName", async (req, res) => {
  if (!(await backLinks.isValidPage(req.params.pageName))) {
    res.send(`We couldn't find ${decodeURIComponent(req.params.pageName)}`);
    return;
  }

  if (!backLinks.has(req.params.pageName))
    backLinks.buildIdList(req.params.pageName);

  res.send(
    `onstartup.onrender.com/re/${encodeURIComponent(req.params.pageName)}`
  );
});

app.listen(3000, () => {
  console.log("Server running on port 3000 - http://localhost:3000/");
});
