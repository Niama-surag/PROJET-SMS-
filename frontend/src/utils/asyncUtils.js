// Utility functions for simulating async operations and professional feedback

export const simulateAsyncOperation = (duration = 1500, successRate = 0.95) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < successRate) {
        resolve({ success: true, data: null });
      } else {
        reject(new Error('Operation failed'));
      }
    }, duration);
  });
};

export const generateMockData = {
  contact: () => ({
    id_contact: Date.now(),
    nom: 'Johnson',
    prenom: 'Sarah',
    numero_telephone: '+33612345678',
    email: 'sarah.johnson@example.com',
    ville: 'Paris',
    region: 'Ile-de-France',
    type_client: 'Premium',
    age: 32,
    genre: 'F',
    statut_opt_in: true,
    code_postal: '75001',
    notes: 'New premium customer',
    date_inscription: new Date().toISOString().split('T')[0]
  }),
  
  campaign: () => ({
    id_campagne: Date.now(),
    nom_campagne: 'Flash Sale ' + new Date().toLocaleDateString(),
    type_campagne: 'promotional',
    statut: 'draft',
    date_creation: new Date().toISOString(),
    message_template: 'Hello {prenom}, exclusive flash sale just for you!',
    personnalisation_active: true,
    segment_cible: 'All customers',
  }),
  
  notification: () => ({
    id: Date.now(),
    message: 'New activity: Campaign delivery completed successfully',
    time: 'Just now',
    type: 'success'
  })
};

export const formatters = {
  currency: (amount) => `$${amount.toLocaleString()}`,
  percentage: (value) => `${value.toFixed(1)}%`,
  number: (num) => num.toLocaleString(),
  phone: (phone) => {
    if (!phone) return '';
    return phone.replace(/(\+\d{2})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  }
};

export const businessCalculations = {
  estimatedROI: (sent, conversionRate = 0.025, avgOrderValue = 25) => {
    const conversions = sent * conversionRate;
    const revenue = conversions * avgOrderValue;
    const cost = sent * 0.05; // $0.05 per SMS
    return ((revenue - cost) / cost * 100);
  },
  
  deliveryRate: (sent) => Math.min(95 + Math.random() * 3, 98), // 95-98%
  openRate: (delivered) => Math.min(68 + Math.random() * 8, 76), // 68-76%
  clickRate: (opened) => Math.min(28 + Math.random() * 7, 35), // 28-35%
  
  costAnalysis: (sent) => ({
    smsCost: sent * 0.05,
    platformFee: sent * 0.01,
    total: sent * 0.06
  })
};
