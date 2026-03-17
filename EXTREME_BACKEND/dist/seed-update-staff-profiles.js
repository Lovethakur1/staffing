"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
const staffData = [
    { email: 'michael.chen@staff.com', skills: ['Bartending', 'Mixology'], hourlyRate: 28, rating: 4.8 },
    { email: 'sarah.johnson@staff.com', skills: ['Event Server', 'Fine Dining'], hourlyRate: 25, rating: 4.9 },
    { email: 'david.martinez@staff.com', skills: ['Setup Crew', 'AV Equipment'], hourlyRate: 22, rating: 4.5 },
    { email: 'emma.davis@staff.com', skills: ['Event Coordinator', 'Planning'], hourlyRate: 35, rating: 4.7 },
    { email: 'james.wilson@staff.com', skills: ['Security', 'Crowd Management'], hourlyRate: 30, rating: 4.6 },
    { email: 'lisa.anderson@staff.com', skills: ['Event Server', 'Catering'], hourlyRate: 24, rating: 4.4 },
    { email: 'robert.taylor@staff.com', skills: ['Security', 'First Aid'], hourlyRate: 32, rating: 4.8 },
    { email: 'jennifer.lee@staff.com', skills: ['Bartending', 'Wine Service'], hourlyRate: 27, rating: 4.7 },
    { email: 'christopher.brown@staff.com', skills: ['Event Server', 'Hospitality'], hourlyRate: 23, rating: 4.3 },
    { email: 'amanda.white@staff.com', skills: ['Event Server', 'Customer Service'], hourlyRate: 24, rating: 4.5 },
    { email: 'daniel.garcia@staff.com', skills: ['Setup Crew', 'Lighting'], hourlyRate: 22, rating: 4.2 },
    { email: 'olivia.martinez@staff.com', skills: ['Event Server', 'Table Setting'], hourlyRate: 23, rating: 4.6 },
    { email: 'william.thomas@staff.com', skills: ['Bartending', 'Cocktails'], hourlyRate: 26, rating: 4.4 },
    { email: 'sophia.clark@staff.com', skills: ['Event Coordinator', 'Decorations'], hourlyRate: 30, rating: 4.9 },
    { email: 'ethan.robinson@staff.com', skills: ['Setup Crew', 'Heavy Lifting', 'AV Equipment'], hourlyRate: 25, rating: 4.3 },
];
async function main() {
    console.log('Connecting to database... URL:', env_1.env.DATABASE_URL ? 'Loaded' : 'Missing');
    for (const s of staffData) {
        const user = await database_1.default.user.findUnique({
            where: { email: s.email },
            include: { staffProfile: true }
        });
        if (!user) {
            console.log(`❌ User not found: ${s.email}`);
            continue;
        }
        if (user.staffProfile) {
            await database_1.default.staffProfile.update({
                where: { id: user.staffProfile.id },
                data: {
                    skills: s.skills,
                    hourlyRate: s.hourlyRate,
                    rating: s.rating,
                    totalEvents: Math.floor(Math.random() * 30) + 5,
                }
            });
            console.log(`✅ Updated StaffProfile for ${s.email}`);
        }
        else {
            await database_1.default.staffProfile.create({
                data: {
                    userId: user.id,
                    skills: s.skills,
                    hourlyRate: s.hourlyRate,
                    rating: s.rating,
                    totalEvents: Math.floor(Math.random() * 30) + 5,
                    availabilityStatus: 'available',
                    isActive: true,
                }
            });
            console.log(`✅ Created new StaffProfile for ${s.email}`);
        }
    }
}
main()
    .catch((e) => {
    console.error('Error updating profiles:', e);
    process.exit(1);
})
    .finally(async () => {
    await database_1.default.$disconnect();
    console.log('Done!');
});
