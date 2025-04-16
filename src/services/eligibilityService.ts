// src/services/eligibility.ts
import type { EligibilityApiResponse } from '../types/farm'; // Use the new response type
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_SCIENCE_API_URL
const token = import.meta.env.VITE_AUTH0_DEV_TOKEN;

export async function checkEligibility(
  file: File,
  countryCode: string,
  farmName: string
): Promise<EligibilityApiResponse> {

  // const token = await getToken();

  if (!token) {
    console.error("token is missing!");
    throw new Error("Authentication token is missing. Cannot check eligibility.");
  }
  if (!file) {
    throw new Error("File object is missing. Cannot check eligibility.");
  }

  const endpoint = `${API_BASE_URL}/eligibility`;

  const formData = new FormData();
  formData.append('file', file, file.name);
  formData.append('country', countryCode);
  formData.append('farmName', farmName);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error("Error in API response:", responseBody);
      throw new Error(`API request failed: ${responseBody}`);
    }

    const jsonResponse = JSON.parse(responseBody) as EligibilityApiResponse;
    console.log("Eligibility Response:", jsonResponse);

    return jsonResponse;
  }
  catch (error) {
    console.error("Error in checkEligibility:", error);
    toast.error("Error in checkEligibility:", error);
    throw new Error(`Eligibility check failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}