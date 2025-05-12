import express from "express";
import ViteExpress from "vite-express";
import { createNewsArticle, upload } from "./news_genner";
import dotenv from "dotenv";
import { validate } from "uuid";
import {
  check_API_key,
  get_user_async,
  get_articles,
  rank_articles_based_on_tags,
} from "./utils";
import supabase from "./supabase";
import cookieParser from "cookie-parser";
import { news_article_trending, NewsArticle, user_tag } from "./types";
dotenv.config();
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());
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
      res.status(401).send({ error: "Unauthorized" });
    } else {
      const value = await createNewsArticle();
      console.log("value", value);
      res.send(value);
    }
  }
});
app.get("/articles", async (req, res) => {
  if (req.query.tag) {
    res.redirect("/filter-articles?tag=" + req.query.tag);
    return;
  }
  const satirical_news_article = await get_articles();
  if (!satirical_news_article) {
    console.error("Error fetching articles:");
    res.status(500).send({ error: "Internal Server Error" });
  } else {
    res.send(satirical_news_article);
  }
});
app.get("/article/:id", async (req, res) => {
  const id = req.params.id;
  if (!validate(id)) {
    res.status(400).send({ error: "Invalid UUID" });
    return;
  }
  const { data, error } = await supabase
    .from("satirical_news_article")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error("Error fetching articles:", error, "data:", data);
    res.status(500).send({ error: "Internal Server Error" });
  } else if (!data || data.length == 0) {
    res.status(404).send({ error: "Article not found" });
  } else {
    const {data:_,error} = await supabase.from("satirical_news_article").update({views_last_24:data.views_last_24+1}).eq("id", id)
    console.log(_, error)
    const userId = req.cookies?.id;
    console.log(req.cookies);
    if (userId) {
      const { data: user_data } = await supabase
        .from("users")
        .select("tags")
        .eq("user", userId)
        .single();
      if (user_data && user_data.tags) {
        const updatedTags = { ...user_data.tags };
        data.tags.forEach((tag: string) => {
          if (updatedTags[tag]) {
            updatedTags[tag] += 1;
          } else {
            updatedTags[tag] = 1;
          }
        });
        const { data: tag_success, error: updateError } = await supabase
          .from("users")
          .update({ tags: updatedTags })
          .eq("user", userId)
          .select();

        console.log(tag_success);
        if (updateError) {
          console.log(
            "Error updating user:",
            updateError,
            "data:",
            tag_success
          );
        } else {
          console.log("User updated successfully:", tag_success);
        }
      }
    }
    res.send(data);
  }
});

app.post("/create-article", async (req, res) => {
  const key = req.body.api_key;
  if (key) {
    const key_is_valid = await check_API_key(key as string);
    if (key_is_valid.success) {
      const upload_success = await upload({
        title: req.body.title,
        content: req.body.body,
        tags: req.body.tags as string[],
      });
      res.send({
        success: true,
        message: "Article created successfully",
        upload_success,
      });
      return;
    } else {
      // const value = await createNewsArticle();
      // console.log("value", value);
      res.send(key_is_valid);
      return;
    }
  }
  res.send(key);
});

app.get("/filter-articles", async (req, res) => {
  console.log("filter-articles");
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
    res.status(500).send({ error: "Internal Server Error" });
  } else if (!data || data.length == 0) {
    res.status(404).send({ error: "Article not found" });
  } else {
    res.send(data);
  }
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const { data: user_data, error: user_error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });
  if (user_error) {
    console.error("Error signing up:", user_error);
    res.status(400).send({ error: "the email is already registered" });
    return;
  } else {
    const { data: user, error: insert_error } = await supabase
      .from("users")
      .insert({ user: user_data.user?.id })
      .select()
      .single();
    if (insert_error) {
      console.error("Error inserting user:", insert_error);
      res.status(500).send({ error: "Error creating new User" });
      return;
    } else {
      res
        .cookie("id", user?.id, { expires: new Date(Date.now() + 86000000) })
        .send({ success: true, message: "User created successfully", user });
      return;
    }
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    console.log(data, error)
    res.send({session: data.session,user: data.user});
  }
});

app.get("/recommended", async (req, res) => {
  const id = req.cookies.id;
  const user_data = await get_user_async(id);
  if (!user_data) {
    res.status(500).send({error:"We were unable to find a user with that ID"});
    return;
  }
  const articles = await get_articles();
  if (!articles) {
    res.status(500).send({error:"We were unable to fetch articles"});
    return;
  }
  if (JSON.stringify(user_data.tags) === "{}"){
    res.send(articles)
    return
  }
  const tags_raw = Object.keys(user_data.tags);
  const values = Object.values(user_data.tags);
  const tags = tags_raw.map((tag, index) => ({
    tag: tag,
    value: values[index],
  }));

  const recommendations = rank_articles_based_on_tags(
    articles as Array<NewsArticle>,
    tags as Array<user_tag>
  );
  recommendations.sort((article_1, article_2) => {
    return article_2.rank-article_1.rank
  });
  res.send(recommendations);
});

app.get("/trending", async (_, res)=>{
  console.log("trending")
  const articles = await get_articles() as news_article_trending[] | false
  if (!articles){
    res.status(500).send({error:"We couldn't fetch the articles"})
    return
  }
  articles.sort((a, b)=>{
    return b.views_last_24-a.views_last_24
  })
  res.send(articles)
})

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000...")
);
