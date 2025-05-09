import { validate } from "uuid";
import supabase from "./supabase";

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

export {check_API_key, check_user_exists, validate_email}