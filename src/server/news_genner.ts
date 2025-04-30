import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
enum tags {
  POLITICS,
  ECONOMY,
  TECHNOLOGY,
  HEALTH,
  ENTERTAINMENT,
  SPORTS,
  ENVIRONMENT,
  INTERNATIONAL,
  CULTURE,
  OPINION,
  INVESTIGATIONS,
  BREAKING_NEWS,
  CONSPIRACIES,
  HUMAN_INTEREST,
  CELEBRITIES,
  SCIENCE,
  CRIME,
  MILITARY,
  FAITH,
  WEIRD_NEWS,
  UFO_SIGHTINGS,
  CORPORATE_SCANDALS,
  ARTIFICIAL_INTELLIGENCE,
  HISTORICAL_REVISIONISM,
  AGRICULTURE,
  EDUCATION,
  SOCIAL_MEDIA,
  SECRET_SOCIETIES,
  REAL_ESTATE,
}
type NewsArticle = {
  title: string;
  content: string;
  tags: string[];
};
interface transitionaryArticle {
  title: string;
  description: string;
}

const GOOGLE_KEY = process.env.GOOGLE_KEY;
const NEWS_KEY = process.env.NEWS_KEY;
// const SUPABASE_KEY = process.env.SUPABASE_KEY;
// const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHBueGpmcG5ybXVyanJiY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTM5NzYsImV4cCI6MjA2MTUyOTk3Nn0.9AaAHIKNcX3PHkKQKfoIEnqiehS-utxoPWSRfBl91R0"
const SUPABASE_URL="https://hphpnxjfpnrmurjrbcef.supabase.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwaHBueGpmcG5ybXVyanJiY2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5NTM5NzYsImV4cCI6MjA2MTUyOTk3Nn0"

const supabase = createClient(
  SUPABASE_URL as string, SUPABASE_KEY as string
  );
const ai = new GoogleGenAI({ apiKey: GOOGLE_KEY });
const generate_article = async (article: transitionaryArticle):Promise<any>=> {
  const prompt = `You are the world's greatest satirical writer — part savage roaster, part witty genius, and part ruthless truth-teller.
    You just encountered the following news articles: ${JSON.stringify(
      article
    )}.
    Your mission:
    - Ruthlessly roast and mock the absurdities, hypocrisies, or ridiculousness in each article while still sticking to the real facts.
    - Write **bold, hilarious, eye-catching short headlines** that instantly make readers curious and laugh.
    - In the article bodies, mix sharp humor, sarcasm, and exaggeration — but NEVER distort the real news facts.
    - Make the tone playful, irreverent, savage — as if you're writing for an edgy comedy magazine.
    - Each article should feel like it could go viral because of how funny yet brutally honest it is.
    -you should strive to make the reader laugh and think at the same time.
    - The articles should be **at least 500 words** long.
    -when generating the tags, please refrain from using words such as "humour","satire", and very specific words, instead use more general words that are related to the article.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          propertyOrdering: ["title", "content", "tags"],
          required: ["title", "content", "tags"],
        },
        temperature: 1.3,
        topK: 50,
        topP: 0.9,
      },
    });
    var jsonstream = JSON.parse(JSON.stringify(response.text))
    return jsonstream as NewsArticle;
} catch (error) {
    console.error("Error generating article:", error);
    return {error:error, continue:false};
  }
};
const upload = async (article: NewsArticle) => {
    // console.log("from here!!!!!!!!!!!!!!!!!!!!!!!!", article, "------------------")
        const { data, error } = await supabase
          .from("satirical_news_article")
          .insert({title: article.title, body: article.content, tags: article.tags});
        if (error) {
        //   console.log("uh-oh", error);
          return false
        }else{
        //   console.log("success", data);
          return true
        }
}
const getnews = async () => {
    var result = false
  try {
    const response = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${NEWS_KEY}&language=en`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (Array.isArray(data.results)) {
      const article_extract = data.results.map((article: any) => {
        return { title: article.title, description: article.description };
      });
      article_extract.forEach(async (article: transitionaryArticle) => {
        const newsArticle = await generate_article(article);
        if (newsArticle.error) {
          console.error("Error generating article:", newsArticle.error);
          return false
        }
        var success = await upload(JSON.parse(newsArticle));
        result = success
        return result
    });
    result = true
    } else {
      console.error("Unexpected data format:", data);
      result = false
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    result = false
  }
  return result
};
const createNewsArticle = async () => {
    const success =  await getnews();
    return success
};

export default createNewsArticle;
