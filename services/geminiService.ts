
import { GoogleGenAI, Type } from "@google/genai";
import { Venue } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCoordinatesForCity = async (city: string): Promise<{ lat: number, lng: number }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide the latitude and longitude for the city: "${city}". Return only a JSON object like {"lat": 0.0, "lng": 0.0}.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{"lat": 0, "lng": 0}');
  } catch (error) {
    console.error("Geocoding error:", error);
    return { lat: 34.0522, lng: -118.2437 }; // Fallback to LA
  }
};

export const getCityFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Identify the city and state for these coordinates: Latitude ${lat}, Longitude ${lng}. Return only the "City, State" string.`,
    });
    return response.text?.trim() || "Unknown City";
  } catch (error) {
    console.error("Geocoding error:", error);
    return "Unknown City";
  }
};

export const getVenueSuggestions = async (city: string, type: string = 'social'): Promise<Venue[]> => {
  const prompt = `Suggest 5 top-rated ${type} venues in ${city}. 
  Include bars, restaurants, and activity spots.
  Return as a JSON array with name, address, rating (0-5), description, and type.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              description: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["name", "address", "rating", "description", "type"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [
      { name: "Local Social Club", address: "Main St, " + city, rating: 4.5, description: "A great central spot.", type: "Bar" },
      { name: "Urban Brew", address: "Market St, " + city, rating: 4.2, description: "Modern vibes.", type: "Cafe" }
    ];
  }
};
