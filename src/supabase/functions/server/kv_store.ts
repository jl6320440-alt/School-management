import { createClient } from "@supabase/supabase-js";

const client = () => {
  const url = typeof Deno !== "undefined" ? (Deno as any).env?.get?.("SUPABASE_URL") : process.env.SUPABASE_URL;
  const key = typeof Deno !== "undefined" ? (Deno as any).env?.get?.("SUPABASE_SERVICE_ROLE_KEY") : process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase credentials are not defined in environment");
  }
  return createClient(url, key);
};

export const set = async (key: string, value: any): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0f9c0abd").upsert({ key, value });
  if (error) throw new Error(error.message);
};

export const get = async (key: string): Promise<any> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0f9c0abd").select("value").eq("key", key).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.value;
};

export const del = async (key: string): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0f9c0abd").delete().eq("key", key);
  if (error) throw new Error(error.message);
};

export const mset = async (keys: string[], values: any[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0f9c0abd").upsert(keys.map((k, i) => ({ key: k, value: values[i] })));
  if (error) throw new Error(error.message);
};

export const mget = async (keys: string[]): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0f9c0abd").select("value").in("key", keys);
  if (error) throw new Error(error.message);
  return data?.map((d: any) => d.value) ?? [];
};

export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  const { error } = await supabase.from("kv_store_0f9c0abd").delete().in("key", keys);
  if (error) throw new Error(error.message);
};

export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  const { data, error } = await supabase.from("kv_store_0f9c0abd").select("key, value").like("key", `${prefix}%`);
  if (error) throw new Error(error.message);
  return data?.map((d: any) => d.value) ?? [];
};
