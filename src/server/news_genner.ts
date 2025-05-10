import { GoogleGenAI, Modality, Type } from "@google/genai";
import supabase from "./supabase";
import dotenv from "dotenv";
import fs from "fs";
import { transitionaryArticle, tags, NewsArticle, VerboseResult } from "./types";
dotenv.config()

const NEWS_KEY = process.env.NEWS_KEY;
const GOOGLE_KEY = process.env.GOOGLE_KEY;
const model = "gemini-2.0-flash-exp-image-generation"
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
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING, enum: tags } },
            
          },
          propertyOrdering: ["title", "content", "tags"],
          required: ["title", "content", "tags"],
        },
        temperature: 1.3,
        topK: 50,
        topP: 0.9,
      },
    });if (response.text)
    var jsonstream = JSON.parse(response.text)
    return jsonstream;
} catch (error) {
    console.error("Error generating article:", error);
    return {error:error, keep_going:false};
  }
};
const upload = async (article: NewsArticle) => {
        const { data, error } = await supabase
          .from("satirical_news_article")
          .insert({title: article.title, body: article.content, tags: article.tags});
        if (error) {
          console.log("uh-oh", error);
          return false
        }else{
          console.log("success", data);
          return true
        }
}
const getnews = async (): Promise<VerboseResult> => {
  try {
    const response = await fetch(
      `https://newsdata.io/api/1/latest?apikey=${NEWS_KEY}&language=en`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log(NEWS_KEY)
      return {
        success: false,
        message: "We are having trouble reaching the news API.",
        error: `Status: ${response.status}, Details: ${errorText}`,
      };
    }

    const data = await response.json();

    if (!Array.isArray(data.results)) {
      return {
        success: false,
        message: "Received unexpected data format from news API.",
        error: data,
      };
    }

    const article_extract = data.results.map((article: any) => ({
      title: article.title,
      description: article.description,
    }));

    for (const article of article_extract) {
      const newsArticle = await generate_article(article);

      if (newsArticle.error) {
        return {
          success: false,
          message: "Error generating satirical article from news data.",
          error: newsArticle.error,
        };
      }

      const success = await upload(JSON.parse(JSON.stringify(newsArticle)));
      if (!success) {
        return {
          success: false,
          message: "Failed to upload satirical article to Supabase.",
        };
      }
    }

    return {
      success: true,
      message: "Successfully fetched, generated, and uploaded satirical news articles.",
    };
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred while fetching the news.",
      error,
    };
  }
};

const createNewsArticle = async (): Promise<VerboseResult> => {
  return await getnews();
};

const generate_article_with_image = async ()=>{
  
  let response:any;
  const article:NewsArticle = {title:"CPAP Market to Explode! (Because Apparently, We're All One Big, Snoring Mess)", content:"Hold onto your nasal pillows, folks, because the CPAP device market is about to become *huge*.  Persistence Market Research, those soothsayers of the snore, predict a whopping US\$6.7 billion market by 2033.  That's right, a financial windfall built on the collective sighs, gasps, and frankly, disturbing sounds of millions of sleep-deprived individuals.  Who knew that the symphony of snoring could generate so much capital?  Apparently, Big Snore is big business.The report cites the \"rising burden of respiratory conditions\" such as COPD and sleep apnea as the driving force behind this impending CPAP bonanza.  Let's translate: more of us are wheezing, gasping, and sounding like a strangled walrus in the night, and the medical industry is rubbing its hands with glee. This isn't just about improving sleep; this is about the lucrative opportunity to sell you a mask that will subtly remind you of every sci-fi horror film ever made, every single night. Think of it: the quiet hum of the machine, the gentle pressure on your face—a perfect lullaby to lull you into a blissful state of semi-conscious debt. The current global revenue of US\$3.5 billion is just the tip of the iceberg, a mere appetizer before the CPAP feast of 2033. Get ready for a future where even your pet hamster will need a miniature CPAP, because in this booming market, no one is safe from the siren song of pressurized air. This financial windfall is a testament to the impressive ingenuity of turning our collective sleep disorders into a goldmine. I mean, who needs a solid eight hours when you can have a slightly less suffocating eight hours, and the satisfaction of contributing to a multi-billion dollar market? It's a win-win, really, unless you're one of those people who can't sleep with a machine strapped to your face. Then, you're just contributing to the market without reaping any of the… benefits? The absurdity is breathtaking. But hey, at least the CPAP industry is breathing easy, right? So breathe easy, folks, and invest wisely! Or, you know, just try to sleep.  Either way, this is one market trend that's not slowing down anytime soon. The world might be a mess, but at least there's a robust market for devices that help you quietly choke on your own breath. Sleep well, and invest in the future of snoring. It's looking bright… and slightly pressurized.", tags:["HEALTH","ECONOMY","TECHNOLOGY","SCIENCE"]}
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
      response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      
      contents: prompt,
      config: {
        responseModalities: [Modality.TEXT],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING, enum: tags } },
            
          },
          propertyOrdering: ["title", "content", "tags"],
          required: ["title", "content", "tags"],
        },
        temperature: 1.3,
        topK: 50,
        topP: 0.9,
      },
    });
    
  }catch (error) {
    console.error("Error generating article:", error);
    return {error:error, keep_going:false};
  }
  for (const part of response.candidates[0].content.parts) {
    // Based on the part type, either show the text or save the image
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

export {createNewsArticle, upload};
