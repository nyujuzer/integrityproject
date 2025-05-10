import { validate } from "uuid";
import supabase from "./supabase";
import { NewsArticle, ranked_article, user_tag } from "./types";



const check_API_key = async (key: string) => {
    const id = key;
  if (!validate(id)) {
    return {status: 400, message: "Invalid API key format", success:false};
  }
  const { data: data, error } = await supabase
    .from("api_keys")
    .select("*").eq("key", id);
    if(data && data.length == 0){
        return {success:false, message:"Invalid API key", status:401}
    }else if (error) {
        console.error("Error fetching API key:", error);
        return {success:false, message:"Error fetching API key", status:500}
    };
    return {success:true, message:"API key is valid", data}
}
const check_user_exists = async (email: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email);
  if (error) {
    console.error("Error fetching user:", error);
    return {success:false, message:"Error fetching user", status:500}
  } else if (!data || data.length == 0) {
    return {success:false, message:"User not found", status:404}
  } else {
    return {success:true, message:"User exists", data}
  }
}
const validate_email = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  console.log("email", email, "re", re.test(email));
  return re.test(email);
}

const get_user_async = async (id:string) =>{
  const {data, error} = await supabase.from("users").select("*").eq("user", id).single()
  if (error){
    return false
  } 
  return data
}

const get_articles= async ( )=>{
  let { data: satirical_news_article, error } = await supabase
    .from("satirical_news_article")
    .select("*");
    if (error){
      return false
    }
    return satirical_news_article as Array<NewsArticle>
}
const rank_articles_based_on_tags = (haystack:Array<NewsArticle>, needles:Array<user_tag>) =>{
  /*
  loop on haystack(articles):
    check how many tags match needles(tags)
    assign rank as n of matching tags + value of tags
    check if article in recommended
      if not:
        add it as 1
      if so: add +1
  sort on ranking
  */
 const recommendations :Array<ranked_article> = []
 haystack.forEach((article)=>{
  needles.forEach((tag)=>{
    if (article.tags.includes(tag.tag)){
      var new_article:ranked_article = {...article, rank:1}
      var rec_article = recommendations.find(e=>e.title === article.title)
      if(rec_article){
        new_article.rank = rec_article.rank+=tag.value
      }else{
        new_article.rank += tag.value
        recommendations.push(new_article)
      }
    }
  })
 })
 return recommendations
}
export {check_API_key, check_user_exists, get_articles, rank_articles_based_on_tags, get_user_async,validate_email}