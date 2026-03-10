import { supabase } from "@/integrations/supabase/client";
import { getAdminSession } from "@/services/movieService";

interface AdminApiParams {
  action: 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  data?: any;
  id?: string;
  filters?: { onConflict?: string };
}

/**
 * Execute an admin write operation through the secure admin-api edge function.
 * Validates admin session server-side before performing the operation.
 */
export const adminApi = async ({ action, table, data, id, filters }: AdminApiParams) => {
  const session = getAdminSession();
  if (!session?.session_token) {
    throw new Error('No hay sesión de administrador activa');
  }

  const { data: result, error } = await supabase.functions.invoke('admin-api', {
    body: { action, table, data, id, filters },
    headers: {
      'x-admin-token': session.session_token,
    },
  });

  if (error) {
    throw new Error(error.message || 'Error en operación de administrador');
  }

  if (result?.error) {
    throw new Error(result.error);
  }

  return result?.data;
};
