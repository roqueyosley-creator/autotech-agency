import { supabase } from "../supabaseClient";

interface ServiceExecutionResult {
  success: boolean;
  commands_log: any[];
  duration_ms: number;
  vehicle_id: string;
}

export async function logServiceExecution(
  vehicle_id: string,
  service_id: string,
  result: ServiceExecutionResult
) {
  try {
    const { error } = await supabase.from('service_history').insert({
      vehicle_id,
      service_type: service_id,
      success: result.success,
      commands_log: result.commands_log,
      duration: result.duration_ms,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error("Error logging service execution:", err);
    return { success: false, error: err };
  }
}

export async function getServiceHistory(vehicle_id: string) {
  const { data, error } = await supabase
    .from('service_history')
    .select('*')
    .eq('vehicle_id', vehicle_id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data;
}
