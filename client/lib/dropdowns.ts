/**
 * Dropdown options utilities
 * Fetches dropdown option data directly from Supabase
 */

import { supabase } from "./supabase";

interface OptionItem {
  id: string;
  name: string;
}

interface DropdownResponse {
  success: boolean;
  data?: OptionItem[];
  error?: string;
}

/**
 * Generic function to fetch dropdown options from a Supabase table
 */
async function fetchOptions(tableName: string): Promise<DropdownResponse> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id, name')
      .order('name');

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Convert id to string to ensure type compatibility
    const formattedData = (data || []).map((item: any) => ({
      id: String(item.id),
      name: item.name,
    }));

    return {
      success: true,
      data: formattedData,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching ${tableName}:`, message);
    return {
      success: false,
      error: message,
    };
  }
}

// Export individual functions for each dropdown type
export const getGenders = () => fetchOptions('genders');
export const getMaritalStatuses = () => fetchOptions('marital_statuses');
export const getServiceTypes = () => fetchOptions('service_types');
export const getInsuranceCompanies = () => fetchOptions('insurance_companies');
export const getPaymentMethods = () => fetchOptions('payment_methods');
export const getReportTypes = () => fetchOptions('report_types');
export const getTrainingCategories = () => fetchOptions('training_categories');
export const getWageUnits = () => fetchOptions('wage_units');
export const getLanguageLevels = () => fetchOptions('language_levels');
export const getResidenceTypes = () => fetchOptions('residence_types');
export const getWorkerInfoOptions = () => fetchOptions('worker_info_options');
export const getCriminalRecordOptions = () => fetchOptions('criminal_record_options');
export const getSmokingDrinkingOptions = () => fetchOptions('smoking_drinking_restrictions');
