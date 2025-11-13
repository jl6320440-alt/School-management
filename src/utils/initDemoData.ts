import backend from './backend/api';

export const initializeDemoData = async () => {
  try {
    const result = await backend.initDemoData();
    if (result?.success) console.log('Demo data initialization:', result.message);
    else console.error('Failed to initialize demo data:', result?.error || result);
  } catch (error) {
    console.error('Error initializing demo data:', error);
  }
};
