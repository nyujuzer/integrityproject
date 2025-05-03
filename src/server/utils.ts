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

export {check_API_key}