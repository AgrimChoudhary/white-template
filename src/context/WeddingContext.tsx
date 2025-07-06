
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WeddingData, WeddingCouple, FamilyMember, WeddingEvent, PhotoGalleryItem, ContactPerson } from '@/types/wedding';

interface WeddingContextType {
  weddingData: WeddingData;
  updateCouple: (couple: Partial<WeddingCouple>) => void;
  addFamilyMember: (type: 'groom' | 'bride', member: Omit<FamilyMember, 'id'>) => void;
  removeFamilyMember: (type: 'groom' | 'bride', memberId: string) => void;
  addEvent: (event: Omit<WeddingEvent, 'id'>) => void;
  removeEvent: (eventId: string) => void;
  addPhoto: (photo: Omit<PhotoGalleryItem, 'id'>) => void;
  removePhoto: (photoId: string) => void;
  addContact: (contact: Omit<ContactPerson, 'id'>) => void;
  removeContact: (contactId: string) => void;
}

// Default wedding data with current hardcoded values
const defaultWeddingData: WeddingData = {
  couple: {
    groomFirstName: "Sidharth",
    groomLastName: "Malhotra", 
    brideFirstName: "Kiara",
    brideLastName: "Advani",
    groomAbout: "An accomplished actor known for his charming personality and dedication to his craft.",
    brideAbout: "A talented actress with a bright smile and a heart full of dreams.",
    coupleStory: "Our love story began with friendship and grew into something beautiful that we want to celebrate with all of you.",
    couplePhotoUrl: "https://www.koimoi.com/wp-content/new-galleries/2022/12/sidharth-malhotra-kiara-advani-to-have-a-grand-wedding-in-february-01.jpg"
  },
  family: {
    groomFamily: {
      title: "Groom's Family",
      members: [
        { 
          id: "groom-parents",
          name: "Mr. Sunil Malhotra & Mrs. Rimma Malhotra", 
          relation: "Parents of the Groom",
          image: "https://www.bollywoodbiography.in/wp-content/uploads/2021/11/sunil-malhotra-with-wife-rimma-malhotra.webp",
          description: "Loving parents who have guided him through life's journey."
        },
        { 
          id: "groom-father",
          name: "Mr. Sunil Malhotra", 
          relation: "Father of the Groom",
          image: "https://i.redd.it/cpy26r2olopc1.jpeg",
          description: "A captain in the merchant navy who has been his son's strength and inspiration.",
          showInDialogOnly: true
        },
        { 
          id: "groom-mother",
          name: "Mrs. Rimma Malhotra", 
          relation: "Mother of the Groom",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlLzeDQRuyataQCZvhLYG9Zmnt5Ukhga_Y4s-7kapr87PeSxxd",
          description: "A homemaker whose love and support have been the foundation of their family.",
          showInDialogOnly: true
        },
        { 
          id: "groom-brother",
          name: "Mr. Harshad Malhotra", 
          relation: "Brother of the Groom",
          image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSky-6UnO7vxLPnf6QWlgLPKcgqNNQpkVVwHvtzeEDgnZcMkPPA8y5nsMJzf63z58v6WPBhb37K3tVNKO72k8iuCg",
          description: "An elder brother who works in the banking sector and has always been Sidharth's role model.",
          showInDialogOnly: true
        },
      ],
    },
    brideFamily: {
      title: "Bride's Family",
      members: [
        { 
          id: "bride-parents",
          name: "Mr. Jagdeep Advani & Mrs. Genevieve Advani", 
          relation: "Parents of the Bride",
          image: "https://static.toiimg.com/thumb/imgsize-23456,msid-70473421,width-600,resizemode-4/70473421.jpg",
          description: "Loving parents who have always encouraged her to follow her dreams."
        },
        { 
          id: "bride-father",
          name: "Mr. Jagdeep Advani", 
          relation: "Father of the Bride",
          image: "https://starsunfolded.com/wp-content/uploads/2023/02/Jagdeep-Advani.jpg",
          description: "A successful businessman from a Sindhi family who has been her pillar of strength.",
          showInDialogOnly: true
        },
        { 
          id: "bride-mother",
          name: "Mrs. Genevieve Advani", 
          relation: "Mother of the Bride",
          image: "https://www.bollywoodbiography.in/wp-content/uploads/2023/02/Genevieve-Jaffrey.jpg",
          description: "A former teacher with Scottish, Irish, and Portuguese ancestry who has been her guiding light.",
          showInDialogOnly: true
        },
        { 
          id: "bride-brother",
          name: "Mr. Mishaal Advani", 
          relation: "Brother of the Bride",
          image: "https://static.sociofyme.com/thumb/97725020/97725020.jpg?imgsize=702924&width=420&height=746&resizemode=76",
          description: "A musician who followed his passion after working as a software engineer.",
          showInDialogOnly: true
        },
      ],
    },
  },
  mainWedding: {
    date: new Date('2025-05-15T20:00:00'),
    time: "8:00 PM",
    venue: {
      name: "Suryagarh Palace",
      address: "near Kahala Phata, Sam Road, Jaisalmer, Rajasthan",
      mapLink: "https://maps.app.goo.gl/TKKdMSCXfaV92cFJ8"
    }
  },
  events: [
    {
      id: "mehendi",
      name: "Mehendi Ceremony",
      date: "2025-05-13",
      time: "4:00 PM",
      venue: "Palace Gardens",
      address: "Suryagarh Palace Gardens, Jaisalmer",
      description: "Traditional mehendi ceremony with music and dance"
    },
    {
      id: "sangeet",
      name: "Sangeet Night",
      date: "2025-05-14", 
      time: "7:00 PM",
      venue: "Grand Ballroom",
      address: "Suryagarh Palace Ballroom, Jaisalmer",
      description: "An evening of music, dance, and celebration"
    },
    {
      id: "wedding",
      name: "Wedding Ceremony",
      date: "2025-05-15",
      time: "8:00 PM", 
      venue: "Main Courtyard",
      address: "Suryagarh Palace Main Courtyard, Jaisalmer",
      description: "The sacred wedding ceremony"
    },
    {
      id: "reception",
      name: "Reception",
      date: "2025-05-16",
      time: "7:00 PM",
      venue: "Royal Hall",
      address: "Suryagarh Palace Royal Hall, Jaisalmer", 
      description: "Wedding reception and dinner"
    }
  ],
  photoGallery: [
    { 
      id: "photo1",
      url: "https://shaadiwish.com/blog/wp-content/uploads/2023/02/Kiara-Advani-Pink-Lehenga-1.jpg",
      title: "Our Wedding Day",
      description: "The most magical day of our lives"
    },
    { 
      id: "photo2",
      url: "https://i.ytimg.com/vi/ie5LRcmvSss/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBa2_kuZKn5ezhF-rnkbiN_HPK4bA",
      title: "Mehendi Celebration",
      description: "Celebrating our mehendi ceremony with loved ones"
    },
    { 
      id: "photo3",
      url: "https://i.ytimg.com/vi/PuDFCIGk0Ow/sddefault.jpg",
      title: "Mumbai Reception",
      description: "Our reception with friends and family"
    },
    { 
      id: "photo4",
      url: "https://cdn.shopify.com/s/files/1/0665/6222/8454/files/Kiara_Advani_wedding_jewellery_480x480.jpg?v=1681196092",
      title: "Wedding Jewelry",
      description: "Beautiful jewelry for our special day"
    },
    { 
      id: "photo5",
      url: "https://peepingmoon-cdn.sgp1.digitaloceanspaces.com/engpeepingmoon/060223115000-63e0e9683fa72sidharth-malhotra-kiara-advani-sangeet-resized.jpg",
      title: "Sangeet Ceremony",
      description: "Joyful moments from our sangeet celebration"
    },
    { 
      id: "photo6",
      url: "https://data1.ibtimes.co.in/en/full/781807/sidharth-malhotra-kiara-advani-wedding.jpg?h=450&l=50&t=40",
      title: "Wedding Portrait",
      description: "A special portrait after our wedding"
    },
  ],
  contacts: [
    {
      id: "groom-contact",
      name: "Sidharth Malhotra",
      relation: "Groom",
      phone: "+91 98765 43210"
    }
  ]
};

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [weddingData, setWeddingData] = useState<WeddingData>(defaultWeddingData);

  const updateCouple = (couple: Partial<WeddingCouple>) => {
    setWeddingData(prev => ({
      ...prev,
      couple: { ...prev.couple, ...couple }
    }));
  };

  const addFamilyMember = (type: 'groom' | 'bride', member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `${type}-${Date.now()}`
    };
    
    setWeddingData(prev => ({
      ...prev,
      family: {
        ...prev.family,
        [type === 'groom' ? 'groomFamily' : 'brideFamily']: {
          ...prev.family[type === 'groom' ? 'groomFamily' : 'brideFamily'],
          members: [...prev.family[type === 'groom' ? 'groomFamily' : 'brideFamily'].members, newMember]
        }
      }
    }));
  };

  const removeFamilyMember = (type: 'groom' | 'bride', memberId: string) => {
    setWeddingData(prev => ({
      ...prev,
      family: {
        ...prev.family,
        [type === 'groom' ? 'groomFamily' : 'brideFamily']: {
          ...prev.family[type === 'groom' ? 'groomFamily' : 'brideFamily'],
          members: prev.family[type === 'groom' ? 'groomFamily' : 'brideFamily'].members.filter(m => m.id !== memberId)
        }
      }
    }));
  };

  const addEvent = (event: Omit<WeddingEvent, 'id'>) => {
    const newEvent: WeddingEvent = {
      ...event,
      id: `event-${Date.now()}`
    };
    
    setWeddingData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const removeEvent = (eventId: string) => {
    setWeddingData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId)
    }));
  };

  const addPhoto = (photo: Omit<PhotoGalleryItem, 'id'>) => {
    const newPhoto: PhotoGalleryItem = {
      ...photo,
      id: `photo-${Date.now()}`
    };
    
    setWeddingData(prev => ({
      ...prev,
      photoGallery: [...prev.photoGallery, newPhoto]
    }));
  };

  const removePhoto = (photoId: string) => {
    setWeddingData(prev => ({
      ...prev,
      photoGallery: prev.photoGallery.filter(p => p.id !== photoId)
    }));
  };

  const addContact = (contact: Omit<ContactPerson, 'id'>) => {
    const newContact: ContactPerson = {
      ...contact,
      id: `contact-${Date.now()}`
    };
    
    setWeddingData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const removeContact = (contactId: string) => {
    setWeddingData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== contactId)
    }));
  };

  return (
    <WeddingContext.Provider value={{
      weddingData,
      updateCouple,
      addFamilyMember,
      removeFamilyMember,
      addEvent,
      removeEvent,
      addPhoto,
      removePhoto,
      addContact,
      removeContact
    }}>
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
