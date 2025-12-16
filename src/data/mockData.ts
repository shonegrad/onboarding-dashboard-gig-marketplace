import { Applicant, OnboardingStatus } from '../types';

// Generate realistic mock data for 300 applicants (scaled from 112)
export const generateMockApplicants = (): Applicant[] => {
    const maleNames = [
        'Marcus', 'David', 'Alex', 'James', 'Michael', 'Christopher', 'Matthew', 'Daniel', 'Joshua', 'Andrew',
        'Kenneth', 'Steven', 'Edward', 'Brian', 'Ronald', 'Anthony', 'Kevin', 'Jason', 'Jeffrey', 'Ryan',
        'Jacob', 'Gary', 'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
        'Tyler', 'Benjamin', 'Samuel', 'Gregory', 'Frank', 'Raymond', 'Jack', 'Dennis', 'Jerry', 'Tyler',
        'Aaron', 'Jose', 'Henry', 'Adam', 'Douglas', 'Nathan', 'Peter', 'Zachary', 'Kyle', 'Noah'
    ];

    const femaleNames = [
        'Sarah', 'Jessica', 'Emily', 'Maria', 'Ashley', 'Jennifer', 'Lisa', 'Amanda', 'Michelle', 'Kimberly',
        'Susan', 'Karen', 'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon',
        'Anna', 'Rebecca', 'Laura', 'Amy', 'Deborah', 'Rachel', 'Catherine', 'Carolyn', 'Janet', 'Virginia',
        'Elizabeth', 'Linda', 'Barbara', 'Patricia', 'Mary', 'Christine', 'Samantha', 'Deborah', 'Stephanie', 'Dorothy',
        'Lisa', 'Nancy', 'Karen', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon'
    ];

    const lastNames = [
        'Johnson', 'Chen', 'Rodriguez', 'Kim', 'Walker', 'Thompson', 'Santos', 'Wilson', 'Martinez', 'Anderson',
        'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Garcia', 'Miller', 'Davis', 'Lopez',
        'Gonzalez', 'Williams', 'Jones', 'Brown', 'Smith', 'White', 'Lewis', 'Robinson', 'Clark', 'Hall',
        'Allen', 'Young', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter',
        'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins',
        'Stewart', 'Sanchez', 'Morris', 'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey'
    ];

    const jobTitles = [
        'Customer Service Representative',
        'Customer Experience Specialist',
        'Data Entry Specialist',
        'Technical Support Agent',
        'Customer Success Associate',
        'Help Desk Technician',
        'Virtual Assistant',
        'Customer Care Specialist'
    ];

    const experiences = [
        'New to customer service',
        '6 months call center experience',
        '1 year retail customer service',
        '2 years customer support experience',
        '3 years technical support experience',
        '4 years data entry experience',
        '5 years customer service experience',
        'No prior customer service experience',
        '1 year help desk experience',
        '2 years virtual assistant experience',
        '3 years customer experience specialist',
        '1 year data processing experience',
        '2 years online chat support',
        '3 years phone customer service',
        '4 years remote customer support',
        '1 year CRM system experience'
    ];

    // Location data for the specified countries
    const locations = [
        // Canada
        { city: 'Toronto', region: 'Ontario', country: 'Canada' },
        { city: 'Vancouver', region: 'British Columbia', country: 'Canada' },
        { city: 'Montreal', region: 'Quebec', country: 'Canada' },
        { city: 'Calgary', region: 'Alberta', country: 'Canada' },
        { city: 'Ottawa', region: 'Ontario', country: 'Canada' },
        { city: 'Edmonton', region: 'Alberta', country: 'Canada' },
        { city: 'Mississauga', region: 'Ontario', country: 'Canada' },
        { city: 'Winnipeg', region: 'Manitoba', country: 'Canada' },
        { city: 'Hamilton', region: 'Ontario', country: 'Canada' },
        { city: 'Quebec City', region: 'Quebec', country: 'Canada' },

        // United States
        { city: 'New York', region: 'New York', country: 'United States' },
        { city: 'Los Angeles', region: 'California', country: 'United States' },
        { city: 'Chicago', region: 'Illinois', country: 'United States' },
        { city: 'Houston', region: 'Texas', country: 'United States' },
        { city: 'Phoenix', region: 'Arizona', country: 'United States' },
        { city: 'Philadelphia', region: 'Pennsylvania', country: 'United States' },
        { city: 'San Antonio', region: 'Texas', country: 'United States' },
        { city: 'San Diego', region: 'California', country: 'United States' },
        { city: 'Dallas', region: 'Texas', country: 'United States' },
        { city: 'Austin', region: 'Texas', country: 'United States' },
        { city: 'Jacksonville', region: 'Florida', country: 'United States' },
        { city: 'San Francisco', region: 'California', country: 'United States' },
        { city: 'Columbus', region: 'Ohio', country: 'United States' },
        { city: 'Indianapolis', region: 'Indiana', country: 'United States' },
        { city: 'Fort Worth', region: 'Texas', country: 'United States' },
        { city: 'Charlotte', region: 'North Carolina', country: 'United States' },
        { city: 'Seattle', region: 'Washington', country: 'United States' },
        { city: 'Denver', region: 'Colorado', country: 'United States' },
        { city: 'Boston', region: 'Massachusetts', country: 'United States' },
        { city: 'El Paso', region: 'Texas', country: 'United States' },

        // South Africa
        { city: 'Cape Town', region: 'Western Cape', country: 'South Africa' },
        { city: 'Johannesburg', region: 'Gauteng', country: 'South Africa' },
        { city: 'Durban', region: 'KwaZulu-Natal', country: 'South Africa' },
        { city: 'Pretoria', region: 'Gauteng', country: 'South Africa' },
        { city: 'Port Elizabeth', region: 'Eastern Cape', country: 'South Africa' },
        { city: 'Bloemfontein', region: 'Free State', country: 'South Africa' },
        { city: 'East London', region: 'Eastern Cape', country: 'South Africa' },
        { city: 'Nelspruit', region: 'Mpumalanga', country: 'South Africa' },
        { city: 'Polokwane', region: 'Limpopo', country: 'South Africa' },
        { city: 'Kimberley', region: 'Northern Cape', country: 'South Africa' },

        // Serbia
        { city: 'Belgrade', region: 'Central Serbia', country: 'Serbia' },
        { city: 'Novi Sad', region: 'Vojvodina', country: 'Serbia' },
        { city: 'Niš', region: 'Southern and Eastern Serbia', country: 'Serbia' },
        { city: 'Kragujevac', region: 'Central Serbia', country: 'Serbia' },
        { city: 'Subotica', region: 'Vojvodina', country: 'Serbia' },
        { city: 'Novi Pazar', region: 'Southern and Eastern Serbia', country: 'Serbia' },
        { city: 'Zrenjanin', region: 'Vojvodina', country: 'Serbia' },
        { city: 'Pančevo', region: 'Vojvodina', country: 'Serbia' },
        { city: 'Čačak', region: 'Central Serbia', country: 'Serbia' },
        { city: 'Novi Beograd', region: 'Central Serbia', country: 'Serbia' },

        // Croatia
        { city: 'Zagreb', region: 'Central Croatia', country: 'Croatia' },
        { city: 'Split', region: 'Dalmatia', country: 'Croatia' },
        { city: 'Rijeka', region: 'Primorje-Gorski Kotar', country: 'Croatia' },
        { city: 'Osijek', region: 'Slavonia', country: 'Croatia' },
        { city: 'Zadar', region: 'Dalmatia', country: 'Croatia' },
        { city: 'Slavonski Brod', region: 'Slavonia', country: 'Croatia' },
        { city: 'Pula', region: 'Istria', country: 'Croatia' },
        { city: 'Karlovac', region: 'Central Croatia', country: 'Croatia' },
        { city: 'Sisak', region: 'Central Croatia', country: 'Croatia' },
        { city: 'Šibenik', region: 'Dalmatia', country: 'Croatia' },

        // Morocco
        { city: 'Casablanca', region: 'Casablanca-Settat', country: 'Morocco' },
        { city: 'Rabat', region: 'Rabat-Salé-Kénitra', country: 'Morocco' },
        { city: 'Fez', region: 'Fès-Meknès', country: 'Morocco' },
        { city: 'Marrakech', region: 'Marrakech-Safi', country: 'Morocco' },
        { city: 'Agadir', region: 'Souss-Massa', country: 'Morocco' },
        { city: 'Tangier', region: 'Tanger-Tetouan-Al Hoceima', country: 'Morocco' },
        { city: 'Meknès', region: 'Fès-Meknès', country: 'Morocco' },
        { city: 'Oujda', region: 'Oriental', country: 'Morocco' },
        { city: 'Kenitra', region: 'Rabat-Salé-Kénitra', country: 'Morocco' },
        { city: 'Tetouan', region: 'Tanger-Tetouan-Al Hoceima', country: 'Morocco' },

        // Mexico
        { city: 'Mexico City', region: 'Mexico City', country: 'Mexico' },
        { city: 'Guadalajara', region: 'Jalisco', country: 'Mexico' },
        { city: 'Monterrey', region: 'Nuevo León', country: 'Mexico' },
        { city: 'Puebla', region: 'Puebla', country: 'Mexico' },
        { city: 'Tijuana', region: 'Baja California', country: 'Mexico' },
        { city: 'León', region: 'Guanajuato', country: 'Mexico' },
        { city: 'Juárez', region: 'Chihuahua', country: 'Mexico' },
        { city: 'Torreón', region: 'Coahuila', country: 'Mexico' },
        { city: 'Querétaro', region: 'Querétaro', country: 'Mexico' },
        { city: 'San Luis Potosí', region: 'San Luis Potosí', country: 'Mexico' },
        { city: 'Mérida', region: 'Yucatán', country: 'Mexico' },
        { city: 'Mexicali', region: 'Baja California', country: 'Mexico' }
    ];

    // Gender-specific photo IDs - expanded for 300 applicants
    const malePhotoIds = [
        '1507003211169-0a1dd7228f2d', '1472099645785-5658abf4ff4e', '1500648767791-00dcc994a43e',
        '1560250097-0b93528c311a', '1506794778202-cad84cf45f1d', '1580489944761-15a19d654956',
        '1527980965255-87ee5ad30f04', '1607990281513-2c110a25abb8', '1531123897727-8f129e40ee09',
        '1552058544-f2b08422138a', '1541101767792-f9b2b1c4f127', '1619946794135-2a824c81dc5b',
        '1607344076906-8859c95b3a81', '1570295999716-00a8ee11bcfa', '1534308143481-c55c845c2ac7',
        '1517841905240-472988babdf9', '1596815608024-e95f2e6b10f3', '1570295999919-56ceb5ecca61',
        '1554151228-985bf529da78', '1552374196-1c4e79769114', '1599566150163-29194dcaad36',
        '1633332755192-727a05c4013d', '1590031905470-a1eb2b238b46', '1628157588553-5eeea00af15c'
    ];

    const femalePhotoIds = [
        '1494790108755-2616b612b04c', '1438761681033-6461ffad8d80', '1544725176-7c40e5a71c5e',
        '1489424731084-a5d8b219a5bb', '1573496359142-b8d87734a5a2', '1535713875002-d1d0cf227877',
        '1494790108755-2616b612b04c', '1438761681033-6461ffad8d80', '1544725176-7c40e5a71c5e',
        '1489424731084-a5d8b219a5bb', '1573496359142-b8d87734a5a2', '1535713875002-d1d0cf227877',
        '1544725176-7c40e5a71c5e', '1573496359142-b8d87734a5a2', '1489424731084-a5d8b219a5bb',
        '1494790108755-2616b612b04c', '1438761681033-6461ffad8d80', '1535713875002-d1d0cf227877',
        '1573496359142-b8d87734a5a2', '1544725176-7c40e5a71c5e', '1489424731084-a5d8b219a5bb',
        '1494790108755-2616b612b04c', '1438761681033-6461ffad8d80', '1535713875002-d1d0cf227877'
    ];

    // Scaled status distribution for 300 applicants maintaining same proportions
    // Original: 22 Applied, 10 Invited to Interview, 8 Interview Scheduled, 4 Invited to Training, 2 In Training, 50 Go Live, 15 Declined, 1 Under Review
    // Scale factor: 300/112 ≈ 2.68
    const statusDistribution = [
        ...Array(59).fill('Applied'), // ~22 * 2.68
        ...Array(27).fill('Invited to Interview'), // ~10 * 2.68
        ...Array(21).fill('Interview Scheduled'), // ~8 * 2.68
        ...Array(11).fill('Invited to Training'), // ~4 * 2.68
        ...Array(5).fill('In Training'), // ~2 * 2.68
        ...Array(134).fill('Go Live'), // ~50 * 2.68
        ...Array(40).fill('Declined'), // ~15 * 2.68
        ...Array(3).fill('Under Review') // ~1 * 2.68
    ];

    const interviewTimes = [
        'Monday, Aug 19 at 10:00 AM',
        'Tuesday, Aug 20 at 2:00 PM',
        'Wednesday, Aug 21 at 11:00 AM',
        'Thursday, Aug 22 at 9:00 AM',
        'Friday, Aug 23 at 3:00 PM',
        'Monday, Aug 26 at 1:00 PM',
        'Tuesday, Aug 27 at 10:30 AM',
        'Wednesday, Aug 28 at 3:30 PM'
    ];

    const trainingSessions = [
        'Customer Service Fundamentals: Aug 26-27',
        'Technical Support Basics: Aug 28-29',
        'CX Excellence Program: Sep 2-3',
        'Data Entry & CRM Training: Sep 5-6',
        'Advanced Customer Relations: Sep 9-10',
        'Digital Communication Skills: Sep 12-13'
    ];

    // Generate dates over the last 45 days for more realistic spread
    const generateRandomDate = () => {
        const today = new Date();
        const daysAgo = Math.floor(Math.random() * 45);
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    };

    // Generate last status change date (within last 10 days for more recent activity)
    const generateLastStatusChangeDate = (appliedDate: string) => {
        const applied = new Date(appliedDate);
        const today = new Date();
        const daysSinceApplied = Math.floor((today.getTime() - applied.getTime()) / (1000 * 60 * 60 * 24));

        // Status change should be after application date but before today
        const maxDaysAgo = Math.min(daysSinceApplied, 10);
        const daysAgo = Math.floor(Math.random() * maxDaysAgo);
        const changeDate = new Date(today);
        changeDate.setDate(changeDate.getDate() - daysAgo);
        return changeDate.toISOString().split('T')[0];
    };

    return Array.from({ length: 300 }, (_, index) => {
        // Randomly choose gender
        const isMale = Math.random() > 0.5;
        const firstName = isMale
            ? maleNames[Math.floor(Math.random() * maleNames.length)]
            : femaleNames[Math.floor(Math.random() * femaleNames.length)];

        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
        const status = statusDistribution[index] as OnboardingStatus;

        // Select appropriate photo based on gender with some fallback to pixel art
        const photoIds = isMale ? malePhotoIds : femalePhotoIds;
        const hasPhoto = Math.random() > 0.3; // 70% chance of having a real photo
        const avatarId = hasPhoto ? photoIds[index % photoIds.length] : null;

        const appliedDate = generateRandomDate();
        const location = locations[Math.floor(Math.random() * locations.length)];

        const applicant: Applicant = {
            id: (index + 1).toString(),
            name,
            email,
            jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
            status,
            appliedDate,
            lastStatusChangeDate: status === 'Applied' ? appliedDate : generateLastStatusChangeDate(appliedDate),
            avatar: avatarId ? `https://images.unsplash.com/photo-${avatarId}?w=150&h=150&fit=crop&crop=face` : undefined,
            phone: `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
            experience: experiences[Math.floor(Math.random() * experiences.length)],
            location
        };

        // Add status-specific data
        if (status === 'Interview Scheduled') {
            applicant.interviewTime = interviewTimes[Math.floor(Math.random() * interviewTimes.length)];
        } else if (status === 'In Training' || status === 'Invited to Training') {
            applicant.trainingSession = trainingSessions[Math.floor(Math.random() * trainingSessions.length)];
        } else if (status === 'Declined') {
            const declineReasons = [
                'Insufficient communication skills for customer service role',
                'Failed background check',
                'Did not meet interview standards for technical support',
                'Incomplete application or missing documentation',
                'Not available for required shift hours'
            ];
            applicant.notes = declineReasons[Math.floor(Math.random() * declineReasons.length)];
        }

        return applicant;
    });
};
