import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getSession() {
  try {
    // Check if auth is properly configured
    if (!authOptions.providers || authOptions.providers.length === 0) {
      console.warn('No auth providers configured');
      return null;
    }
    
    return await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const session = await getSession();
    return session?.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
