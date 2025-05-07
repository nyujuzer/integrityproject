import express from "express";
import ViteExpress from "vite-express";
import { createNewsArticle, upload } from "./news_genner";
import dotenv from "dotenv";
import { validate } from "uuid";
import { check_API_key } from "./utils";
import supabase from "./supabase";
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post("/create-articles", async (req, res) => {
  const key = req.body.api_key;
  if (key) {
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("key", key);
    console.log("data", data);
    if (data && data.length == 0) {
      console.error("Error fetching API key:", error);
      res.status(401).send({error:"Unauthorized"});
    } else {
      const value = await createNewsArticle();
      console.log("value", value);
      res.send(value);
    }
  }
});
app.get("/articles", async (req, res) => {
  if (req.query.tag){
    res.redirect("/filter-articles?tag="+req.query.tag);
    return
  }
  let { data: satirical_news_article, error } = await supabase
    .from("satirical_news_article")
    .select("*");
  if (error || !satirical_news_article || satirical_news_article.length == 0) {
    console.error(
      "Error fetching articles:",
      error,
      "data:",
      satirical_news_article
    );
    res.status(500).send({error:"Internal Server Error"});
  } else {
    res.send(satirical_news_article);
  }
});
app.get("/article/:id", async (req, res) => {
  const id = req.params.id;
  if (!validate(id)) {
    res.status(400).send({error:"Invalid UUID"});
    return;
  }
  const { data, error } = await supabase
    .from("satirical_news_article")
    .select("*")
    .eq("id", id);
  if (error) {
    console.error("Error fetching articles:", error, "data:", data);
    res.status(500).send({error:"Internal Server Error"});
  } else if (!data || data.length == 0) {
    res.status(404).send({error:"Article not found"});
  } else {
    res.send(data);
  }
});

app.post("/create-article", async (req, res) => {
  const key = req.body.api_key;
  if (key) {
    const key_is_valid = await check_API_key(key as string);
    if (key_is_valid.success) {
      const upload_success = await upload({title:req.body.title,content:req.body.body, tags:req.body.tags as string[]});
      res.send({success:true, message:"Article created successfully", upload_success});
      return
    } else {
      // const value = await createNewsArticle();
      // console.log("value", value);
      res.send(key_is_valid);
      return
    }
  }
  res.send(key);
});

app.get("/filter-articles", async (req, res) => {
console.log("filter-articles")
  const tag = req.query.tag?.toString().toUpperCase() as string;
  if (!tag) {
    res.redirect("/articles");
    return;
  }
  const tags = tag.split("+").map((tag) => tag.trim().toUpperCase());
  const { data, error } = await supabase
    .from("satirical_news_article")
    .select("*")
    .contains("tags", [tags]);
  if (error) {
    console.error("Error fetching articles:", error, "data:", data);
    res.status(500).send({error:"Internal Server Error"});
  } else if (!data || data.length == 0) {
    res.status(404).send({error:"Article not found"});
  } else {
    res.send(data);
  }

})
ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
