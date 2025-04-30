import express from "express";
import ViteExpress from "vite-express";
import createNewsArticle from "./news_genner";
import { createClient } from "@supabase/supabase-js";
const SUPABASE_KEY = process.env.SUPABASE_KEY
const SUPABASE_URL = process.env.SUPABASE_URL
console.log("SUPABASE_KEY", SUPABASE_KEY);
console.log("SUPABASE_URL", SUPABASE_URL);
const supabase = createClient(
  SUPABASE_URL as string,SUPABASE_KEY as string);
const app = express();

app.get("/create-articles", async (req, res) => {
  const key = req.query.api_key;
  if (key) {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key);
    console.log("data", data);
    if (data && data.length == 0) {
      console.error("Error fetching API key:", error);
      res.status(401).send("Unauthorized");
    } else {
      const value = await createNewsArticle();
      console.log("value", value);
      res.send(value);
    }
  }
});
app.get("/articles", async (req, res) => {
  let { data: satirical_news_article, error } = await supabase
  .from('satirical_news_article')
  .select('*')
    if (error || !satirical_news_article || satirical_news_article.length == 0) {
      console.error("Error fetching articles:", error, "data:", satirical_news_article);
      res.status(500).send("Internal Server Error");
    }else{
      res.send(satirical_news_article);
    }
});
app.get("/article/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("satirical_news_article")
    .select("*").eq("id", req.params.id);
    if (error || !data || data.length == 0) {
      console.error("Error fetching articles:", error, "data:", data);
      res.status(500).send("Internal Server Error");
    }else{
      res.send(data);
    }
});
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
