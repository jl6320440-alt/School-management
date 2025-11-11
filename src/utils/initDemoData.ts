import { projectId, publicAnonKey } from './supabase/info';

export const initializeDemoData = async () => {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-0f9c0abd/init-demo-data`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      }
    );

    const result = await response.json();
    
    if (result.success) {
      console.log('Demo data initialization:', result.message);
    } else {
      console.error('Failed to initialize demo data:', result.error);
    }
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};
