import { supabase } from "../supabaseClient";

export const reportStorage = {
  /**
   * Sube un buffer de PDF a Supabase Storage y retorna la URL pública.
   */
  async upload(fileName: string, buffer: Buffer): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from('reports')
        .upload(fileName, buffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('reports')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("Error uploading to storage:", err);
      throw err;
    }
  }
};
